import { API_Route } from '../main';

// In-memory state for batching and dedupe
const QUEUE_KEY = 'osas_telemetry_queue_v1';
let _queue = null;
let _flushTimer = null;
let _flushDelay = 15000; // 15s default
let _backoffMultiplier = 1;
const _maxBatchSize = 20;

// recent normalized errors to avoid duplicates (message -> expiry)
const _recent = new Map();
const _dedupeMs = 5 * 60 * 1000; // 5 minutes

const loadQueue = () => {
	if (_queue) return _queue;
	try {
		const raw = localStorage.getItem(QUEUE_KEY);
		_queue = raw ? JSON.parse(raw) : [];
	} catch (err) {
		_queue = [];
	};
	return _queue;
};

const persistQueue = () => {
	try {
		localStorage.setItem(QUEUE_KEY, JSON.stringify(_queue || []));
	} catch (err) {
		// ignore
	};
};

const normalizeError = (errorMessage) => {
	if (!errorMessage) return '';
	try {
		return String(errorMessage)
			// Remove ISO timestamps
			.replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g, 'TIMESTAMP')
			// Millisecond timestamps
			.replace(/\d{13}/g, 'TIMESTAMP')
			// IPs
			.replace(/\b\d{1,3}(?:\.\d{1,3}){3}\b/g, 'IP')
			// UUIDs
			.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, 'UUID')
			// Numbers (IDs, ports)
			.replace(/\b\d+\b/g, 'N')
			// Paths with numbers
			.replace(/\/\d+/g, '/ID')
			// Normalize whitespace
			.replace(/\s+/g, ' ')
			.trim()
			.toLowerCase();
	} catch (err) {
		return String(errorMessage).toLowerCase();
	};
};

const shouldReportNormalized = (normalized) => {
	if (!normalized) return true;
	const now = Date.now();
	const expiry = _recent.get(normalized);
	if (expiry && expiry > now) return false;
	_recent.set(normalized, now + _dedupeMs);
	// prune occasionally
	if (_recent.size > 1000)
		for (const [k, v] of _recent) if (v <= now) _recent.delete(k);
	return true;
};

const enqueue = (item) => {
	loadQueue();
	_queue.push(item);
	persistQueue();
	// flush when queue large
	if (_queue.length >= _maxBatchSize) flushQueue();
	// ensure timer
	scheduleFlush();
};

const scheduleFlush = () => {
	if (_flushTimer) return;
	_flushTimer = setTimeout(() => {
		_flushTimer = null;
		flushQueue();
	}, _flushDelay * _backoffMultiplier);
};

const flushQueue = async () => {
	loadQueue();
	if (!_queue || _queue.length === 0) return;
	const batch = _queue.slice(0, _maxBatchSize);
	try {
		const ok = await reportErrorBatch(batch);
		if (ok) {
			_queue = _queue.slice(batch.length);
			persistQueue();
			_backoffMultiplier = 1;
		} else {
			_backoffMultiplier = Math.min(_backoffMultiplier * 2, 16);
		}
	} catch (err) {
		_backoffMultiplier = Math.min(_backoffMultiplier * 2, 16);
	} finally {
		if (_queue && _queue.length > 0) scheduleFlush();
	};
};

/**
 * Send error telemetry to the backend
 * @param {Error|string} error - The error to report
 * @param {Object} context - Additional context about the error
 * @returns {Promise<boolean>} - Whether the telemetry was sent successfully
 */
export const reportError = async (error, context = {}) => {
	try {
		const payload = {
			error: error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error,
			context: {
				subsystem: 'frontend',
				userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
				url: typeof window !== 'undefined' ? window.location.href : undefined,
				timestamp: new Date().toISOString(),
				...context
			}
		};

		// Dedupe using normalized message if possible
		const normalized = normalizeError(error instanceof Error ? error.message : String(error));
		if (!shouldReportNormalized(normalized)) return false;

		// enqueue and return true (we accepted it)
		enqueue(payload);
		return true;
	} catch (err) {
		console.error('Failed to enqueue telemetry:', err);
		return false;
	};
};

/**
 * Send multiple errors in a batch
 * @param {Array} errors - Array of {error, context} objects
 * @returns {Promise<boolean>} - Whether the batch was sent successfully
 */
export const reportErrorBatch = async (errors) => {
	try {
		const response = await fetch(`${API_Route}/telemetry/batch`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ errors })
		});

		return response.ok;
	} catch (err) {
		console.error('Failed to send batch telemetry:', err);
		return false;
	};
};

/**
 * Initialize global error handlers
 */
export const initTelemetry = () => {
	// Handle uncaught errors
	window.addEventListener('error', (event) => {
		reportError(event.error || event.message, {
			type: 'uncaught-error',
			filename: event.filename,
			lineno: event.lineno,
			colno: event.colno
		});
	});

	// Handle unhandled promise rejections
	window.addEventListener('unhandledrejection', (event) => {
		reportError(event.reason, {
			type: 'unhandled-rejection',
			promise: 'Promise rejected without catch handler'
		});
	});

	// Handle React errors (for development)
	if (import.meta.env.DEV) {
		const originalConsoleError = console.error;
		console.error = (...args) => {
			// Check if it's a React error
			if (args[0] && typeof args[0] === 'string' && args[0].includes('React')) {
				reportError(args.join(' '), {
					type: 'react-error',
					isDev: true
				});
			}
			originalConsoleError.apply(console, args);
		};
	};

	// Start flush cycle from any persisted queue
	loadQueue();
	scheduleFlush();

	console.log('✓ Telemetry initialized (batching, dedupe enabled)');
};

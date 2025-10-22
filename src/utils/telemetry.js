import { API_Route } from '../main';
import authFetch from './authFetch';

/**
 * Send error telemetry to the backend
 * @param {Error|string} error - The error to report
 * @param {Object} context - Additional context about the error
 * @returns {Promise<boolean>} - Whether the telemetry was sent successfully
 */
export const reportError = async (error, context = {}) => {
	try {
		const errorData = {
			error: error instanceof Error ? {
				message: error.message,
				stack: error.stack,
				name: error.name
			} : error,
			context: {
				subsystem: 'frontend',
				userAgent: navigator.userAgent,
				url: window.location.href,
				timestamp: new Date().toISOString(),
				...context
			}
		};

		const response = await authFetch(`${API_Route}/telemetry`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(errorData)
		});

		return response.ok;
	} catch (err) {
		// Silently fail - don't want telemetry to break the app
		console.error('Failed to send telemetry:', err);
		return false;
	}
};

/**
 * Send multiple errors in a batch
 * @param {Array} errors - Array of {error, context} objects
 * @returns {Promise<boolean>} - Whether the batch was sent successfully
 */
export const reportErrorBatch = async (errors) => {
	try {
		const response = await authFetch(`${API_Route}/telemetry/batch`, {
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
	}
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
	}

	console.log('✓ Telemetry initialized');
};

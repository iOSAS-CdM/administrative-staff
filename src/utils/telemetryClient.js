// Deprecated shim: re-export project's `reportError` to keep compatibility with earlier imports.
import { reportError } from './telemetry';

export const sendTelemetry = (error, context = {}, source = 'administrative-staff') => {
	// Map to the project's reportError API; include source in context
	const ctx = { ...(context || {}), source };
	return reportError(error, ctx);
};

export default { sendTelemetry };

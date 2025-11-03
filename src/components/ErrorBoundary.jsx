import React from 'react';
// PropTypes removed to avoid adding an extra dependency in the build.
import { reportError } from '../utils/telemetry';

class ErrorBoundary extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasError: false };
	};

	static getDerivedStateFromError() {
		return { hasError: true };
	};

	componentDidCatch(error, info) {
		// Report to telemetry with React error context
		reportError(error, { type: 'react-error', info });
	};

	render() {
		if (this.state.hasError) {
			// Render children anyway; do not break the app shell.
			return this.props.fallback || this.props.children;
		};

		return this.props.children;
	};
};

// propTypes intentionally omitted (keeps bundle dependency-free)

export default ErrorBoundary;

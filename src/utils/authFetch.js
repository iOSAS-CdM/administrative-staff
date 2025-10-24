import supabase from './supabase';
import { notification } from 'antd';

/**
 * A fetch wrapper that includes the user's access token in the Authorization header.
 * If a 403/401 response is received, it signs the user out and navigates to /unauthorized.
 * @param  {input: URL | RequestInfo, init?: RequestInit} args - Arguments to pass to fetch (url, options)
 * @returns {Promise<Response>} - The fetch response
 */
const authFetch = async (...args) => {
	const originalFetch = window.fetch;

	// Get current session from Supabase
	const { data } = await supabase.auth.getSession();
	const session = data?.session ?? null;
	const token = session?.access_token;

	// Only add headers if we have a session with access token
	if (token) {
		// First arg is the resource/URL, second arg is options
		if (args[1] && typeof args[1] === 'object') {
			// If headers already exist, add to them
			args[1].headers = {
				...args[1].headers,
				'Authorization': `Bearer ${token}`
			};
		} else {
			// Create options object with headers if it doesn't exist
			args[1] = {
				...(args[1] || {}),
				headers: {
					'Authorization': `Bearer ${token}`
				}
			};
		}
	}

	const request = await originalFetch(...args).catch((error) => {
		if (error.name === 'AbortError') return;
		throw error;
	});

	// If we have a session but get a 403/401, sign out via Supabase auth and navigate
	if (session && (request?.status === 403 || request?.status === 401)) {
		await supabase.auth.signOut();
		notification.error({
			message: 'Unauthorized',
			description: 'You are not authorized to access this resource.'
		});
		window.location.href = '/unauthorized';
	};

	return request;
};

export default authFetch;
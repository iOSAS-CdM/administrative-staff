import supabase from './supabase';

/**
 * A fetch wrapper that includes the user's access token in the Authorization header.
 * If a 403 Forbidden response is received, it signs the user out and navigates to SignUp.
 * @param  {input: URL | RequestInfo, init?: RequestInit} args - Arguments to pass to fetch (url, options)
 * @returns {Promise<Response>} - The fetch response
 */
const authFetch = async (...args) => {
	const originalFetch = window.fetch;
	const session = (await supabase.auth.getSession()).data.session;
	// Only add headers if we have a session with access token
	if (session?.access_token) {
		// First arg is the resource/URL, second arg is options
		if (args[1] && typeof args[1] === 'object') {
			// If headers already exist, add to them
			args[1].headers = {
				...args[1].headers,
				'Authorization': `Bearer ${JSON.parse(localStorage.getItem('CustomApp')).access_token}`
			};
		} else {
			// Create headers object if options doesn't exist
			args[1] = {
				...(args[1] || {}),
				headers: {
					'Authorization': `Bearer ${JSON.parse(localStorage.getItem('CustomApp')).access_token}`
				}
			};
		};
	};

	const response = await originalFetch(...args);

	// If we have a session but get a 403 Forbidden response, sign out
	if (session && response.status === 403) {
		await supabase.auth.signOut();
		window.location.href = '/unauthorized';
	};

	return response;
};

export default authFetch;
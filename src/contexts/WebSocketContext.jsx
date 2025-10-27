import React from 'react';
import { usePageProps } from './PagePropsContext';
import { useRefresh } from './RefreshContext';
import { API_Route } from '../main';

const WebSocketContext = React.createContext({});

export const WebSocketProvider = ({ children }) => {
	const { staff } = usePageProps();
	const { setRefresh } = useRefresh();

	React.useEffect(() => {
		if (!staff?.id) return;

		const wsUrl = API_Route.replace(/^http/, 'ws').replace('/api', '');
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('WebSocket connected');
			ws.send(JSON.stringify({
				type: 'introduce',
				payload: { id: staff.id }
			}));
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				switch (data.type) {
					case 'refresh':
						console.log('Refresh signal received:', data.payload);
						setRefresh({ timestamp: new Date(data.payload.timestamp).getTime() });
						break;
					case 'notification':
						console.log('Notification received:', data.payload);
						// TODO: Implement a user-facing notification system
						// Example: showToast(data.payload.title, data.payload.message);
						break;
					default:
						break;
				}
			} catch (error) {
				console.error('Error processing WebSocket message:', error);
			}
		};

		ws.onclose = () => {
			console.log('WebSocket disconnected');
			// Optional: Implement reconnection logic here
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
		};

		return () => {
			ws.close();
		};
	}, [staff?.id, setRefresh]);

	return (
		<WebSocketContext.Provider value={{}}>
			{children}
		</WebSocketContext.Provider>
	);
};

/**
 * @typedef {{ [key: string]: any }} WebSocketData
 */

/** @type {() => { webSocketData: WebSocketData; setWebSocketData: React.Dispatch<React.SetStateAction<WebSocketData>> }} */
// eslint-disable-next-line react-refresh/only-export-components
export const useWebSocket = () => {
	return React.useContext(WebSocketContext);
};
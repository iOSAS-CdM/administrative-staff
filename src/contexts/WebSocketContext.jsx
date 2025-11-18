import React from 'react';
import { usePageProps } from './PagePropsContext';
import { useRefresh } from './RefreshContext';
import { API_Route } from '../main';
import notificationService from '../utils/notificationService';

const WebSocketContext = React.createContext({});

export const WebSocketProvider = ({ children }) => {
	const { staff } = usePageProps();
	const { setRefresh } = useRefresh();

	React.useEffect(() => {
		// Initialize notification service when WebSocket provider mounts
		notificationService.initialize();
	}, []);

	React.useEffect(() => {
		if (!staff?.id) return;

		const wsUrl = API_Route.replace(/^http/, 'ws').replace('/api', '');
		const ws = new WebSocket(wsUrl);

		ws.onopen = () => {
			console.log('WebSocket connected');
			ws.send(JSON.stringify({
				type: 'introduce',
				payload: { id: staff.id, role: staff.role }
			}));
		};

		ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);

				switch (data.type) {
					case 'refresh':
						console.log('Refresh signal received:', data.payload);
						setRefresh({ timestamp: new Date(data.payload.timestamp).getTime() });

						// Send native notifications based on resource type
						if (data.payload.resource) {
							switch (data.payload.resource) {
								case 'announcements':
									notificationService.send({
										title: 'New Announcement',
										body: 'A new announcement has been posted'
									});
									break;
								case 'cases':
									notificationService.send({
										title: 'New Report',
										body: 'A new case report has been filed'
									});
									break;
								case 'requests':
									notificationService.send({
										title: 'New Request',
										body: 'A new request has been submitted'
									});
									break;
								default:
									break;
							}
						}
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
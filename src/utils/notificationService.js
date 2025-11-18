import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

/**
 * NotificationService for handling native desktop notifications
 * This service manages permission requests and sending notifications
 */
class NotificationService {
	constructor() {
		this.permissionGranted = false;
		this.initialized = false;
	}

	/**
	 * Initialize the notification service and request permissions
	 * @returns {Promise<boolean>} - Whether initialization was successful
	 */
	async initialize() {
		if (this.initialized) return this.permissionGranted;

		try {
			// Check if we're running in Tauri environment
			if (!window.__TAURI_INTERNALS__) {
				console.warn('NotificationService: Not running in Tauri environment');
				return false;
			}

			// Check if permission is already granted
			this.permissionGranted = await isPermissionGranted();

			// If not granted, request permission
			if (!this.permissionGranted) {
				const permission = await requestPermission();
				this.permissionGranted = permission === 'granted';
			}

			this.initialized = true;
			
			if (this.permissionGranted) {
				console.log('NotificationService: Permissions granted');
			} else {
				console.warn('NotificationService: Permissions denied');
			}

			return this.permissionGranted;
		} catch (error) {
			console.error('NotificationService: Error initializing:', error);
			return false;
		}
	}

	/**
	 * Send a native desktop notification
	 * @param {Object} options - Notification options
	 * @param {string} options.title - Notification title
	 * @param {string} options.body - Notification body/message
	 * @param {string} [options.icon] - Optional icon path
	 * @returns {Promise<boolean>} - Whether the notification was sent successfully
	 */
	async send({ title, body, icon }) {
		try {
			// Initialize if not already done
			if (!this.initialized) {
				await this.initialize();
			}

			// Don't send if permission not granted
			if (!this.permissionGranted) {
				console.warn('NotificationService: Cannot send notification - permission not granted');
				return false;
			}

			// Send the notification
			await sendNotification({
				title: title || 'iOSAS Administrative Staff',
				body: body || '',
				...(icon ? { icon } : {})
			});

			console.log('NotificationService: Notification sent:', { title, body });
			return true;
		} catch (error) {
			console.error('NotificationService: Error sending notification:', error);
			return false;
		}
	}

	/**
	 * Send notification for new announcement
	 * @param {Object} announcement - Announcement data
	 * @param {string} announcement.title - Announcement title
	 * @param {string} [announcement.type] - Announcement type (event, announcement, etc.)
	 */
	async notifyNewAnnouncement(announcement) {
		const typeLabel = announcement.type === 'event' ? 'Event' : 'Announcement';
		return this.send({
			title: `New ${typeLabel}`,
			body: announcement.title || 'A new announcement has been posted'
		});
	}

	/**
	 * Send notification for new report/case
	 * @param {Object} report - Report/Case data
	 * @param {string} [report.violation] - Type of violation
	 */
	async notifyNewReport(report) {
		const violationType = report.violation 
			? report.violation.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
			: 'Unknown';
		
		return this.send({
			title: 'New Case Report',
			body: `A new case has been filed: ${violationType}`
		});
	}

	/**
	 * Send notification for new request
	 * @param {Object} request - Request data
	 * @param {string} [request.type] - Type of request
	 * @param {Object} [request.student] - Student who made the request
	 */
	async notifyNewRequest(request) {
		const requestType = request.type 
			? request.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
			: 'Document';
		
		const studentName = request.student?.name 
			? `${request.student.name.first} ${request.student.name.last}`
			: 'A student';

		return this.send({
			title: 'New Request',
			body: `${studentName} has requested: ${requestType}`
		});
	}
}

// Create and export a singleton instance
const notificationService = new NotificationService();

export default notificationService;

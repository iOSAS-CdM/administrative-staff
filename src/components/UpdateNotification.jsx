import React from 'react';
import { Button, Modal, Progress, Space, Typography, Flex } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const { Text } = Typography;

const UpdateNotification = () => {
	const [updateAvailable, setUpdateAvailable] = React.useState(false);
	const [updateVersion, setUpdateVersion] = React.useState('');
	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [isUpdating, setIsUpdating] = React.useState(false);
	const [downloadProgress, setDownloadProgress] = React.useState(0);
	const [checkingForUpdate, setCheckingForUpdate] = React.useState(false);
	const [statusMessage, setStatusMessage] = React.useState('');

	// Check for updates on component mount
	React.useEffect(() => {
		checkForUpdates();
	}, []);

	const checkForUpdates = async () => {
		try {
			setCheckingForUpdate(true);
			const update = await check();
			console.log('Update check result:', update);

			if (update) {
				setUpdateAvailable(true);
				setUpdateVersion(update.version);
				setIsModalVisible(true);
			};
			// Remove the success message for 'latest version' since this is automatic
		} catch (error) {
			console.error('Error checking for updates:', error);

			// Handle specific signature errors more gracefully
			if (error.message && (
				error.message.includes('signature') ||
				error.message.includes('Signature') ||
				error.message.includes('the `signature` field was not set')
			)) {
				console.warn('Update signature verification failed. This may indicate:');
				console.warn('1. The release was not properly signed during build');
				console.warn('2. The TAURI_SIGNING_PRIVATE_KEY secret is not set in GitHub');
				console.warn('3. The signing process failed during release creation');

			// Only show user-facing error in development or if explicitly enabled
				if (import.meta.env.DEV) {
					console.warn('Signature verification disabled in development mode');
				} else {
					// In production, log but don't show intrusive error for signature issues
					console.warn('Skipping update due to signature verification failure');
				};
				return;
			};

			// Handle network or other errors
			if (error.message && (
				error.message.includes('network') ||
				error.message.includes('fetch') ||
				error.message.includes('timeout')
			)) {
				console.warn('Network error while checking for updates:', error.message);
				// Don't show network errors to users as they're usually temporary
				return;
			};

			// For other errors, only log them without showing user notifications
			console.warn('Update check failed:', error.message);
		} finally {
			setCheckingForUpdate(false);
		};
	};

	const handleUpdate = async () => {
		try {
			setIsUpdating(true);
			setDownloadProgress(0);
			setStatusMessage('Starting download...');

			const update = await check();
			if (!update) {
				setStatusMessage('No update available');
				return;
			};

			// Download and install the update with progress tracking
			await update.downloadAndInstall((event) => {
				switch (event.event) {
					case 'Started':
						setDownloadProgress(0);
						setStatusMessage('Starting download...');
						break;
					case 'Progress':
						const progress = Math.round((event.data.chunkLength / event.data.contentLength) * 100);
						setDownloadProgress(progress);
						setStatusMessage(`Downloading... ${progress}%`);
						break;
					case 'Finished':
						setDownloadProgress(100);
						setStatusMessage('Update downloaded successfully!');
						break;
				};
			});

			// Installation completed, restart the app
			setStatusMessage('Update installed! Restarting application...');
			setTimeout(async () => {
				await relaunch();
			}, 1000);

		} catch (error) {
			console.error('Error updating:', error);

			// Handle signature verification errors during update
			if (error.message && (
				error.message.includes('signature') ||
				error.message.includes('Signature') ||
				error.message.includes('the `signature` field was not set')
			)) {
				setStatusMessage('Update failed: Signature verification error. Please contact support.');
				console.error('Signature verification failed during update process');
			} else if (error.message && (
				error.message.includes('network') ||
				error.message.includes('download') ||
				error.message.includes('timeout')
			)) {
				setStatusMessage('Update failed: Network or download error. Please try again later.');
				console.error('Network error during update:', error.message);
			} else {
				setStatusMessage('Failed to update the application. Please try again or contact support.');
				console.error('Update installation failed:', error.message);
			};
		} finally {
			setIsUpdating(false);
		};
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setUpdateAvailable(false);
		setStatusMessage('');
	};

	return (
		<>
			{/* Update Modal */}
			<Modal
				title='Update Available'
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key='cancel' onClick={handleCancel} disabled={isUpdating}>
						Later
					</Button>,
					<Button
						key='update'
						type='primary'
						icon={<DownloadOutlined />}
						loading={isUpdating}
						onClick={handleUpdate}
					>
						{isUpdating ? 'Updating...' : 'Update Now'}
					</Button>,
				]}
				closable={!isUpdating}
				maskClosable={!isUpdating}
			>
				<Space direction='vertical' style={{ width: '100%' }}>
					<Text>
						A new version <strong>v{updateVersion}</strong> is available.
						Would you like to download and install it now?
					</Text>

					{isUpdating && (
						<Flex vertical align='start' gap='16' style={{ width: '100%' }}>
							<Progress
								percent={downloadProgress}
								status={downloadProgress === 100 ? 'success' : 'active'}
							/>
						</Flex>
					)}

					{statusMessage && (
						<Text type={statusMessage.toLowerCase().includes('failed') ? 'danger' : 'secondary'}>
							{statusMessage}
						</Text>
					)}

					<Text type='secondary'>
						The application will restart automatically after the update is installed.
					</Text>
				</Space>
			</Modal>
		</>
	);
};

export default UpdateNotification;
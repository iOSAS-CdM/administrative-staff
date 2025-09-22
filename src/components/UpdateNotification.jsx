import React, { useState, useEffect } from 'react';
import { Button, Modal, Progress, message, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { invoke } from '@tauri-apps/api/core';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const UpdateNotification = () => {
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [updateVersion, setUpdateVersion] = useState('');
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [downloadProgress, setDownloadProgress] = useState(0);
	const [checkingForUpdate, setCheckingForUpdate] = useState(false);

	// Check for updates on component mount
	useEffect(() => {
		checkForUpdates();
	}, []);

	const checkForUpdates = async () => {
		try {
			setCheckingForUpdate(true);
			const update = await check();
			console.log('Update check result:', update);

			if (update?.available) {
				setUpdateAvailable(true);
				setUpdateVersion(update.version);
				setIsModalVisible(true);
				message.info(`Update available: v${update.version}`);
			}
			// Remove the success message for "latest version" since this is automatic
		} catch (error) {
			console.error('Error checking for updates:', error);
			// Only show error message if it's a real error, not just "no updates"
		} finally {
			setCheckingForUpdate(false);
		}
	};

	const handleUpdate = async () => {
		try {
			setIsUpdating(true);
			setDownloadProgress(0);

			const update = await check();
			if (!update?.available) {
				message.error('No update available');
				return;
			}

			// Download and install the update with progress tracking
			await update.downloadAndInstall((event) => {
				switch (event.event) {
					case 'Started':
						setDownloadProgress(0);
						message.info('Starting download...');
						break;
					case 'Progress':
						const progress = Math.round((event.data.chunkLength / event.data.contentLength) * 100);
						setDownloadProgress(progress);
						break;
					case 'Finished':
						setDownloadProgress(100);
						message.success('Update downloaded successfully!');
						break;
				}
			});

			// Installation completed, restart the app
			message.success('Update installed! Restarting application...');
			setTimeout(async () => {
				await relaunch();
			}, 1000);

		} catch (error) {
			console.error('Error updating:', error);
			message.error('Failed to update the application');
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setUpdateAvailable(false);
	};

	return (
		<>
			{/* Update Modal */}
			<Modal
				title="Update Available"
				open={isModalVisible}
				onCancel={handleCancel}
				footer={[
					<Button key="cancel" onClick={handleCancel} disabled={isUpdating}>
						Later
					</Button>,
					<Button
						key="update"
						type="primary"
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
				<Space direction="vertical" style={{ width: '100%' }}>
					<p>
						A new version <strong>v{updateVersion}</strong> is available.
						Would you like to download and install it now?
					</p>

					{isUpdating && (
						<div>
							<p>Downloading update...</p>
							<Progress
								percent={downloadProgress}
								status={downloadProgress === 100 ? 'success' : 'active'}
								strokeColor={{
									'0%': '#108ee9',
									'100%': '#87d068',
								}}
							/>
						</div>
					)}

					<p style={{ fontSize: '12px', color: '#666' }}>
						The application will restart automatically after the update is installed.
					</p>
				</Space>
			</Modal>
		</>
	);
};

export default UpdateNotification;
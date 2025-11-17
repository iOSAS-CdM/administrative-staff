import React from 'react';
import { useNavigate } from 'react-router';
import { download } from '@tauri-apps/plugin-upload';
import { join, downloadDir } from '@tauri-apps/api/path';

import {
	App,
	Input,
	Segmented,
	Flex,
	Avatar,
	Typography,
	Tag,
	Dropdown,
	Spin,
	Modal,
	Skeleton,
	Button,
	Divider,
	Card
} from 'antd';

import ContentPage from '../../../components/ContentPage';

import {
	UserOutlined,
	FileOutlined,
	DownloadOutlined,
	EyeOutlined,
	CloseOutlined,
	CheckOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

import ItemCard from '../../../components/ItemCard';

import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';
import { useRefresh } from '../../../contexts/RefreshContext';

const violationLabels = {
	bullying: 'Bullying',
	cheating: 'Cheating',
	disruptive_behavior: 'Disruptive Behavior',
	fraud: 'Fraud',
	gambling: 'Gambling',
	harassment: 'Harassment',
	improper_uniform: 'Improper Uniform',
	littering: 'Littering',
	plagiarism: 'Plagiarism',
	prohibited_items: 'Prohibited Items',
	vandalism: 'Vandalism',
	other: 'Other'
};

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';
import NewCase from '../../../modals/NewCase';
import supabase from '../../../utils/supabase';

/**
 * @type {React.FC}
 */
const Reports = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();

	React.useEffect(() => {
		setSelectedKeys(['reports']);
	}, [setSelectedKeys]);

	const isMobile = useMobile();
	const { cache, pushToCache } = useCache();
	const { setRefresh } = useRefresh();

	/** @typedef {'open' | 'dismissed' | 'proceeded'} Status */
	/** @type {[Status, React.Dispatch<React.SetStateAction<Status>>]} */
	const [status, setStatus] = React.useState('open');

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Reports',
			subtitle: 'View and manage student reports',
			actions: [
				<Segmented
					key='status-filter'
					options={[
						{ label: 'Open', value: 'open', title: 'Open Reports' },
						{ label: 'Dismissed', value: 'dismissed', title: 'Dismissed Reports' },
						{ label: 'Proceeded', value: 'proceeded', title: 'Proceeded Reports' }
					]}
					value={status}
					onChange={(value) => {
						setStatus(value);
					}}
				/>
			]
		});
	}, [setHeader, status, isMobile, navigate]);

	return (
		<ContentPage
			fetchUrl={`${API_Route}/cases${status ? `?status=${status}` : ''}`}
			emptyText='No reports found'
			cacheKey='cases'
			transformData={(data) => data.cases || []}
			renderItem={(caseItem) => (
				<ReportCard
					caseItem={caseItem}
					loading={caseItem.placeholder}
				/>
			)}
		/>
	);
};

export default Reports;

/**
 * @type {React.FC<{
 * 	caseItem: import('../../../classes/Case').CaseProps,
 * 	loading: Boolean
 * }>}
 */
const ReportCard = ({ caseItem, loading }) => {
	const [thisCase, setThisCase] = React.useState(caseItem);
	const [modalOpen, setModalOpen] = React.useState(false);
	const { setRefresh } = useRefresh();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (caseItem) {
			setThisCase(caseItem);
		};
	}, [caseItem]);

	const app = App.useApp();
	const Modal = app.modal;
	const notification = app.notification;

	return (
		<>
			<ItemCard
				hoverable
				loading={loading}
				onClick={() => !loading && setModalOpen(true)}
			>
				<Flex vertical>
					<Title level={5}>
						{thisCase ? violationLabels[thisCase.violation] : <Skeleton.Input style={{ width: 100 }} active />}
					</Title>
					<Paragraph ellipsis={{ rows: 2, expandable: false }}>
						{thisCase ? thisCase.content : <Skeleton.Input style={{ width: '100%' }} active />}
					</Paragraph>

					<Flex vertical gap={8} justify='start' align='start'>
						<Flex align='center' gap={8}>
							<Avatar
								size={32}
								icon={<UserOutlined />}
								src={thisCase && thisCase.author.profilePicture ? thisCase.author.profilePicture : null}
								onClick={(e) => {
									e.stopPropagation();
									navigate(`/dashboard/students/profile/${thisCase.author.id}`);
								}}
							/>
							<Flex vertical>
								<Text>
									{thisCase.author.name.first} {thisCase.author.name.last}
								</Text>
								<Text type='secondary'>
									{thisCase && new Date(thisCase.created_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</Text>
							</Flex>
						</Flex>
					</Flex>
				</Flex>
			</ItemCard>

			<ReportDetailModal
				open={modalOpen}
				onClose={() => {
					setModalOpen(false);
					setRefresh({ timestamp: Date.now()});
				}}
				caseItem={thisCase}
				notification={notification}
			/>
		</>
	);
};

/**
 * @type {React.FC<{
 * 	open: boolean,
 * 	onClose: () => void,
 * 	caseItem: import('../../../classes/Case').CaseProps
 * }>}
 */
const ReportDetailModal = ({ open, onClose, caseItem, notification }) => {
	const navigate = useNavigate();
	const app = App.useApp();
	const modal = app.modal;

	if (!caseItem) return null;

	const hasAttachments = caseItem.attachments && Array.isArray(caseItem.attachments) && caseItem.attachments.length > 0;

	const handleStatusChange = async (newStatus, dismissalReason = null) => {
		return new Promise(async (resolve, reject) => {
			const body = { status: newStatus };
			if (newStatus === 'dismissed' && dismissalReason)
				body.dismissal_reason = dismissalReason;

			const response = await authFetch(`${API_Route}/cases/${caseItem.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			if (!response?.ok) {
				notification.error({
					message: 'Error',
					description: 'Failed to update the report. Please try again later.',
					duration: 4
				});
				reject();
				return;
			};

			notification.success({
				message: 'Success',
				description: `Report has been ${newStatus}.`,
				duration: 3
			});

			resolve();
			onClose();
		});
	};

	const handleDismiss = () => {
		modal.confirm({
			title: 'Dismiss Case Report',
			content: (
				<Flex vertical gap={8} style={{ marginTop: 16 }}>
					<Text>Please provide a reason for dismissing this case:</Text>
					<Input.TextArea
						id='dismissal-reason-input'
						rows={4}
						placeholder='Enter dismissal reason...'
						autoFocus
					/>
				</Flex>
			),
			okText: 'Dismiss',
			okButtonProps: { danger: true },
			onOk: () => {
				const reason = document.getElementById('dismissal-reason-input')?.value;
				if (!reason || reason.trim() === '') {
					notification.error({
						message: 'Error',
						description: 'Please provide a reason for dismissal.',
						duration: 3
					});
					return Promise.reject();
				};
				return handleStatusChange('dismissed', reason);
			}
		});
	};

	const handleProceed = async () => {
		try {
			// First, update the case status to 'proceeded'
			const response = await authFetch(`${API_Route}/cases/${caseItem.id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ status: 'proceeded' })
			});

			if (!response?.ok) {
				notification.error({
					message: 'Error',
					description: 'Failed to proceed with the case. Please try again later.',
					duration: 4
				});
				return;
			}

			// Fetch attachments from storage
			let attachmentFiles = [];
			if (hasAttachments) {
				const { data: storageData, error: storageError } = await supabase
					.storage
					.from('cases')
					.list(`${caseItem.id}/`);

				if (!storageError && storageData) {
					attachmentFiles = storageData.map((file) => ({
						uid: file.id,
						name: file.name,
						status: 'done',
						url: supabase.storage.from('cases').getPublicUrl(`${caseItem.id}/${file.name}`).data.publicUrl,
						publicUrl: supabase.storage.from('cases').getPublicUrl(`${caseItem.id}/${file.name}`).data.publicUrl
					}));
				}
			}

			// Close the current modal
			onClose();

			// Prepare initial data for the new record
			const initialData = {
				violation: caseItem.violation,
				complainants: [caseItem.author.id],
				complainees: [],
				description: caseItem.content || '',
				title: violationLabels[caseItem.violation] || '',
				files: attachmentFiles.length > 0 ? { fileList: attachmentFiles } : undefined
			};

			// Open NewCase modal with pre-filled data
			await NewCase(modal, notification, initialData);

			notification.success({
				message: 'Success',
				description: 'Case has been proceeded to disciplinary record.',
				duration: 3
			});
		} catch (error) {
			console.error('Error proceeding case:', error);
			notification.error({
				message: 'Error',
				description: 'An error occurred while proceeding the case.',
				duration: 4
			});
		}
	};

	const getTagColor = (status) => {
		switch (status) {
			case 'open':
				return 'blue';
			case 'proceeded':
				return 'green';
			case 'dismissed':
				return 'red';
			default:
				return 'gray';
		};
	};

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width={800}
			title={
				<Flex align='center' gap={8}>
					<Text strong style={{ fontSize: 18 }}>
						{violationLabels[caseItem.violation]}
					</Text>
					<Tag color={getTagColor(caseItem.status)}>
						{caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
					</Tag>
				</Flex>
			}
		>
			<Flex vertical gap={16}>
				{/* Case Description */}
				<Flex vertical gap={8}>
					<Text type='secondary' strong>Description</Text>
					<Paragraph style={{ marginBottom: 0 }}>
						{caseItem.content || 'No description provided.'}
					</Paragraph>
				</Flex>

				{/* Dismissal Reason */}
				{caseItem.status === 'dismissed' && caseItem.dismissal_reason && (
					<>
						<Divider style={{ margin: '8px 0' }} />
						<Flex vertical gap={8}>
							<Text type='secondary' strong>Dismissal Reason</Text>
							<Paragraph style={{ marginBottom: 0, color: '#ff4d4f' }}>
								{caseItem.dismissal_reason}
							</Paragraph>
						</Flex>
					</>
				)}

				{/* Attachments */}
				{hasAttachments && (
					<>
						<Divider style={{ margin: '8px 0' }} />
						<Flex vertical gap={8}>
							<Text type='secondary' strong>
								Attachments ({caseItem.attachments.length})
							</Text>
							<Flex vertical gap={8}>
								{caseItem.attachments.map((file, index) => (
									<FileAttachment key={index} file={file} />
								))}
							</Flex>
						</Flex>
					</>
				)}

				{/* Footer */}
				<Divider style={{ margin: '8px 0' }} />
				<Flex justify='space-between' align='center'>
					<Flex align='center' gap={12}>
						<Avatar
							size={32}
							icon={<UserOutlined />}
							src={caseItem.author.profilePicture || null}
							style={{ cursor: 'pointer' }}
							onClick={() => {
								navigate(`/dashboard/students/profile/${caseItem.author.id}`);
								onClose();
							}}
						/>
						<Flex vertical style={{ textAlign: 'left' }}>
							<Text strong>
								{caseItem.author.name.first} {caseItem.author.name.last}
							</Text>
							<Text type='secondary' style={{ fontSize: 12 }}>
								{new Date(caseItem.created_at).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</Text>
						</Flex>
					</Flex>

					<Flex gap={8}>
						{caseItem.status === 'open' && (
							<>
								<Button onClick={onClose}>
									Close
								</Button>
								<Button
									danger
									icon={<CloseOutlined />}
									onClick={handleDismiss}
								>
									Dismiss
								</Button>
								<Button
									type='primary'
									icon={<CheckOutlined />}
									onClick={handleProceed}
								>
									Proceed
								</Button>
							</>
						)}
						{caseItem.status !== 'open' && (
							<Button onClick={onClose}>
								Close
							</Button>
						)}
					</Flex>
				</Flex>
			</Flex>
		</Modal>
	);
};

/**
 * @type {React.FC<{
 * 	file: any
 * }>}
 */
const FileAttachment = ({ file }) => {
	const app = App.useApp();
	const notification = app.notification;

	const isImage = file.metadata?.mimetype?.includes('image/') || file.type?.startsWith('image/') || file.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

	return (
		<Card
			size='small'
			style={{ width: '100%' }}
		>
			<Flex align='center' gap={16}>
				{isImage ? (
					<Avatar
						src={file.publicUrl || file.url}
						size='large'
						shape='square'
						style={{ width: 64, height: 64 }}
						preview={{
							mask: <EyeOutlined />
						}}
					/>
				) : (
					<Avatar
						icon={<FileOutlined />}
						size='large'
						shape='square'
						style={{ width: 64, height: 64 }}
					/>
				)}
				<Flex vertical style={{ flex: 1 }}>
					<Text>{file.name || 'Unnamed file'}</Text>
					{(file.metadata?.size || file.size) && (
						<Text type='secondary'>
							{((file.metadata?.size || file.size) / 1024).toFixed(2)} KB
							{file.metadata?.mimetype && ` • ${file.metadata.mimetype}`}
						</Text>
					)}
				</Flex>
				<Flex gap={8}>
					{(file.publicUrl || file.url) && (
						<Button
							type='default'
							size='small'
							icon={<DownloadOutlined />}
							onClick={async () => {
								const downloadDirPath = await downloadDir();
								const tempPath = await join(downloadDirPath, file.name);
								const downloadTask = download(file.publicUrl || file.url, tempPath, {
									onProgress: (progress) => {
										console.log(`Progress: ${Math.round(progress * 100)}%`);
									}
								});
								notification.info({
									message: 'Download started.',
									description: `Downloading ${file.name}...`,
									duration: 2
								});
								const savedPath = await downloadTask;
								notification.success({
									message: 'Download completed.',
									description: `${file.name} has been downloaded to your Downloads folder.`,
									duration: 4
								});
								console.log('File downloaded to:', savedPath);
							}}
						>
							Download
						</Button>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};

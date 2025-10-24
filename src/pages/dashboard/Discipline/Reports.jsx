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
	CloseOutlined
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

	/** @typedef {'open' | 'closed'} Status */
	/** @type {[Status, React.Dispatch<React.SetStateAction<Status>>]} */
	const [status, setStatus] = React.useState('open');

	const [search, setSearch] = React.useState('');
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearching] = React.useState(false);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchSearchResults = async () => {
			if (search.length === 0) return setSearchResults([]);

			// Fetch cases from the backend
			setSearching(true);
			const request = await authFetch(`${API_Route}/cases/search?q=${encodeURIComponent(search)}`, { signal: controller.signal });
			if (!request?.ok) {
				setSearching(false);
				return;
			}

			const data = await request.json();
			if (!data || !Array.isArray(data.cases)) {
				setSearching(false);
				return;
			}
			setSearchResults(data.cases);
			setSearching(false);
			pushToCache('cases', data.cases, false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search, pushToCache]);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Reports',
			subtitle: 'View and manage student reports',
			actions: [
				<Flex style={{ flexGrow: isMobile ? 1 : '' }} key='search'>
					<Dropdown
						showArrow={false}
						open={search.length > 0}
						position='bottomRight'
						placement='bottomRight'
						menu={{
							items: searchResults.length > 0 ? searchResults.map((caseItem) => ({
								key: caseItem.id,
								label: (
									<div style={{ width: '100%' }}>
										<Flex justify='space-between' align='center' gap={8}>
											<Text ellipsis>{violationLabels[caseItem.violation]}</Text>
											<Tag color={caseItem.status === 'open' ? 'blue' : 'gray'}>
												<Text style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>
													{caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
												</Text>
											</Tag>
										</Flex>
									</div>
								)
							})) : [{
								key: 'no-results',
								label: <Text>No results found</Text>,
								disabled: true
							}],
							placement: 'bottomRight',
							style: { width: isMobile ? '100%' : 300, maxHeight: 400, overflowY: 'auto' },
							emptyText: 'No results found',
							onClick: (e) => {
								setSearch('');
								navigate(`/dashboard/discipline/report/${e.key}`);
							}
						}}
					>
						<Input.Search
							placeholder='Search reports'
							allowClear
							suffix={searching ? <Spin size='small' /> : null}
							onChange={(e) => {
								const value = e.target.value;
								clearTimeout(window.reportDebounceTimer);
								const debounceTimer = setTimeout(() => {
									setSearch(value);
								}, 512);
								window.reportDebounceTimer = debounceTimer;
							}}
							style={{ width: '100%', minWidth: isMobile ? '100%' : 256 }}
						/>
					</Dropdown>
				</Flex>,
				<Segmented
					key='status-filter'
					options={[
						{ label: 'Open', value: 'open' },
						{ label: 'Closed', value: 'closed' }
					]}
					value={status}
					onChange={(value) => {
						setStatus(value);
					}}
				/>
			]
		});
	}, [setHeader, status, search, searchResults, isMobile, navigate]);

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
							<Text>
								{thisCase.author.name.first} {thisCase.author.name.last}
							</Text>
						</Flex>

						<Text type='secondary'>
							Reported on{' '}
							{thisCase ? new Date(thisCase.created_at).toLocaleDateString() : <Skeleton.Input style={{ width: 100 }} active />}
						</Text>
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

	if (!caseItem) return null;

	const hasAttachments = caseItem.attachments && Array.isArray(caseItem.attachments) && caseItem.attachments.length > 0;

	return (
		<Modal
			open={open}
			onCancel={onClose}
			okText='Dismiss'
			okButtonProps={{ icon: <CloseOutlined />, danger: true }}
			onOk={() => new Promise(async (resolve) => {
				const reponse = await authFetch(`${API_Route}/cases/${caseItem.id}/close`, {
					method: 'DELETE'
				});
				if (!reponse?.ok) {
					notification.error({
						message: 'Error',
						description: 'Failed to close the report. Please try again later.',
						duration: 4
					});
					return;
				};
				resolve();
				onClose();
			})}
			width={800}
			title={
				<Flex align='center' gap={8}>
					<Text strong style={{ fontSize: 18 }}>
						{violationLabels[caseItem.violation]}
					</Text>
					<Tag color={caseItem.status === 'open' ? 'blue' : 'gray'}>
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

				<Divider style={{ margin: '8px 0' }} />

				{/* Author Information */}
				<Flex vertical gap={8}>
					<Text type='secondary' strong>Reported By</Text>
					<Flex align='center' gap={12}>
						<Avatar
							size={48}
							icon={<UserOutlined />}
							src={caseItem.author.profilePicture || null}
							style={{ cursor: 'pointer' }}
							onClick={() => {
								navigate(`/dashboard/students/profile/${caseItem.author.id}`);
								onClose();
							}}
						/>
						<Flex vertical>
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

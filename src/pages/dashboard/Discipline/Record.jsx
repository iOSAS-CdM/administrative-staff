import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { download } from '@tauri-apps/plugin-upload';
import { join, downloadDir } from '@tauri-apps/api/path'; 
import moment from 'moment';

import {
	Card,
	Button,
	Flex,
	Avatar,
	Typography,
	Tag,
	Badge,
	App,
	Steps,
	Dropdown
} from 'antd';

import {
	EditOutlined,
	InboxOutlined,
	LeftOutlined,
	RightOutlined,
	FileOutlined,
	DownloadOutlined,
	DeleteOutlined,
	UploadOutlined,
	UserOutlined,
	ExportOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import PanelCard from '../../../components/PanelCard';

import { useCache } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';
import { usePageProps } from '../../../contexts/PagePropsContext';
import { useRefresh } from '../../../contexts/RefreshContext';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import EditCase from '../../../modals/EditCase.jsx';
import UploadRecordFiles from '../../../modals/UploadRecordFiles.jsx';

/**
 * @type {React.FC}
 */
const Record = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();

	const app = App.useApp();
	const Modal = app.modal;
	const notification = app.notification;

	const isMobile = useMobile();
	const { cache, pushToCache, removeFromCache } = useCache();
	const { refresh, setRefresh } = useRefresh();

	const { id } = useParams();

	const [thisRecord, setThisRecord] = React.useState({
		id: '',
		violation: '',
		description: '',
		tags: {
			status: '',
			severity: '',
			progress: 0
		},
		complainants: [],
		complainees: [],
		placeholder: true,
		date: ''
	});

	const [step, setStep] = React.useState(0);
	React.useEffect(() => {
		if (!id) return;
		const record = (cache.records || []).find(r => r.id === id);
		if (record)
			return setThisRecord(record);

		const controller = new AbortController();
		const loadRecord = async () => {
			const response = await authFetch(`${API_Route}/records/${id}`, { signal: controller.signal });
			if (!response?.ok) {
				console.error('Failed to fetch record:', response?.statusText || response);
				Modal.error({
					title: 'Error',
					content: 'Failed to fetch record. Please try again later.',
					centered: true,
					onOk: () => navigate(-1)
				});
				return;
			};
			const data = await response.json();
			console.log('Fetched record:', data);
			if (data) {
				setThisRecord(data);
				setStep(data.tags.progress || 0);
				pushToCache('records', data, true);
			};
		};
		loadRecord();
		return () => controller.abort();
	}, [id, cache.records, refresh]);

	const [thisComplainants, setThisComplainants] = React.useState([]);
	const [thisComplainees, setThisComplainees] = React.useState([]);
	React.useEffect(() => {
		if (!thisRecord) return;
		setStep(thisRecord.tags.progress || 0);
		setThisComplainants(thisRecord.complainants);
		setThisComplainees(thisRecord.complainees);
		pushToCache('students', thisRecord.complainants, false);
		pushToCache('students', thisRecord.complainees.map(c => c.student), false);
	}, [thisRecord, refresh]);

	const [exportLoading, setExportLoading] = React.useState(false);

	const handleExport = async (format) => {
		if (thisRecord?.placeholder) {
			Modal.error({
				title: 'Error',
				content: 'This is a placeholder disciplinary record. Please try again later.',
				centered: true
			});
			return;
		};

		setExportLoading(true);
		try {
			const response = await authFetch(`${API_Route}/records/${id}/export/${format}`);
			if (response.ok) {
				const data = await response.json();

				// Download from the URL
				const downloadDirPath = await downloadDir();
				const tempPath = await join(downloadDirPath, data.filename);

				notification.info({
					message: 'Download started',
					description: `Downloading ${data.filename}...`,
					duration: 2
				});

				const downloadTask = download(data.url, tempPath, {
					onProgress: (progress) => {
						console.log(`Progress: ${Math.round(progress * 100)}%`);
					}
				});

				await downloadTask;

				notification.success({
					message: 'Export Successful',
					description: `${data.filename} has been downloaded to your Downloads folder.`,
					duration: 5
				});
			} else {
				const error = await response.json();
				Modal.error({
					title: 'Export Failed',
					content: error.message || 'Failed to export record',
					centered: true
				});
			};
		} catch (error) {
			console.error('Export error:', error);
			Modal.error({
				title: 'Export Failed',
				content: 'An error occurred while exporting the record',
				centered: true
			});
		} finally {
			setExportLoading(false);
		};
	};

	const exportMenuItems = [
		{
			key: 'pdf',
			label: 'Export to PDF',
			icon: <FileOutlined />,
			onClick: () => handleExport('pdf')
		},
		{
			key: 'json',
			label: 'Export to JSON',
			icon: <FileOutlined />,
			onClick: () => handleExport('json')
		}
	];

	React.useLayoutEffect(() => {
		setHeader({
			title: `Disciplinary Case ${thisRecord?.id || ''}`,
			actions: [
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate(-1)}
				>
					Back
				</Button>
			]
		});
	}, [setHeader, exportLoading, thisRecord]);
	React.useEffect(() => {
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	/** @type {[import('../../../classes/Repository').RepositoryProps, React.Dispatch<React.SetStateAction<import('../../../classes/Repository').RepositoryProps>>]} */
	const [repository, setRepository] = React.useState([]);
	React.useEffect(() => {
		if (!id) return setRepository([]);
		const controller = new AbortController();
		const loadRepository = async () => {
			const response = await authFetch(`${API_Route}/repositories/record/${id}`, { signal: controller.signal });
			if (!response?.ok) {
				console.error('Failed to fetch repository:', response?.statusText || response);
				return;
			};
			/** @type {import('../../../classes/Repository').RepositoryProps} */
			const data = await response.json();
			if (!data || !Array.isArray(data)) {
				setRepository([]);
				return;
			};
			setRepository(data);
		};
		loadRepository();
		return () => controller.abort();
	}, [id, refresh]);

	return (
		<Flex
			vertical
			gap={16}
		>
			<Flex gap={16} align='stretch' style={{ width: '100%' }}>
				<Flex vertical gap={16} style={{ width: '100%' }}>
					<Card styles={{ header: { padding: '8px 16px' }, body: { padding: 16 } }}>
						<Flex vertical gap={16} style={{ position: 'relative'}}>
							<Title level={1}>{thisRecord?.title} <Text type='secondary'>
								{(thisRecord?.date ? new Date(thisRecord?.date) : new Date()).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</Text></Title>
							<Flex gap={8} style={{ position: isMobile ? 'relative' : 'absolute', top: 0, right: 0 }}>
								<Tag>{thisRecord?.violation}</Tag>
								<Tag color={
									{
										minor: 'blue',
										major: 'orange',
										grave: 'red'
									}[thisRecord?.tags.severity.toLowerCase()] || 'default'
								}>
									{thisRecord?.tags.severity.charAt(0).toUpperCase() + thisRecord?.tags.severity.slice(1)}
								</Tag>
								<Tag color={
									{
										ongoing: 'blue',
										resolved: 'var(--primary)',
										dismissed: 'grey'
									}[thisRecord?.tags.status] || 'default'
								}>
									{thisRecord?.tags.status.charAt(0).toUpperCase() + thisRecord?.tags.status.slice(1)}
								</Tag>
							</Flex>
							<Card><Text>{thisRecord?.description}</Text></Card>
								<Flex gap={16}>
								<Dropdown
									placement='bottom'
									menu={{ items: exportMenuItems }}
									trigger={['click']}
									disabled={exportLoading}
								>
									<Button
										icon={<ExportOutlined />}
										loading={exportLoading}
									>
										Export
									</Button>
								</Dropdown>
									{step !== 5 && (
										<Button
											type='primary'
											icon={<EditOutlined />}
											block={isMobile}
											onClick={async () => {
												if (thisRecord?.placeholder) {
													Modal.error({
														title: 'Error',
														content: 'This is a placeholder disciplinary record. Please try again later.',
														centered: true
													});
													return;
												};
												const data = await EditCase(Modal, thisRecord);
												if (data) {
													console.log(data);

													// Fetch the full record to ensure populated fields
													const response = await authFetch(`${API_Route}/records/${id}`);
													if (response.ok) {
														const fullData = await response.json();
														pushToCache('records', fullData, true);
														setRefresh({ timestamp: Date.now() });
														notification.success({
															message: 'Record updated successfully.'
														});
													} else {
														pushToCache('records', data, true);
														setRefresh({ timestamp: Date.now() });
														notification.success({
															message: 'Record updated successfully.'
														});
													};
												};
											}}
										>
											Edit Record
										</Button>
									)}
								{step !== 5 && (
									<Button
										type='primary'
										disabled={thisRecord?.tags.status === 'dismissed' || thisRecord?.tags.status === 'resolved'}
										danger
										icon={<InboxOutlined />}
										block={isMobile}
										onClick={() => {
											if (thisRecord?.placeholder) {
												Modal.error({
													title: 'Error',
													content: 'This is a placeholder disciplinary record. Please try again later.',
													centered: true
												});
											} else {
												Modal.confirm({
													title: 'Confirm Dismissal',
													content: 'Are you sure you want to dismiss this record? This action cannot be undone.',
													centered: true,
													okButtonProps: { danger: true },
													okText: 'Dismiss Record',
													onOk: async () => {
														const response = await authFetch(`${API_Route}/records/${id}`, { method: 'DELETE' }).catch(() => null);
														if (!response?.ok) {
															notification.error({
																message: 'Error dismissing record.'
															});
															return;
														};
														/** @type {import('../../../classes/Record.js').RecordProps} */
														const data = await response.json();
														const newRecord = { ...thisRecord, tags: { ...thisRecord.tags, status: data.tags?.status } }
														pushToCache('records', newRecord, true);
														setRefresh({ timestamp: Date.now() });
														notification.success({
															message: 'Record dismissed successfully.'
														});
													}
												});
											};
										}}
									>
										{thisRecord?.tags.status === 'dismissed' ? 'Record Dismissed' : 'Dismiss Record'}
									</Button>
								)}
							</Flex>
						</Flex>
					</Card>
					<Flex vertical={isMobile} gap={16} style={{ width: '100%', height: '100%' }}>
						<div
							style={{ width: '100%', height: '100%', order: isMobile ? '2' : '' }}
						>
							<PanelCard
								title={`Complainant${thisComplainants?.length > 1 ? 's' : ''}`}
								style={{ position: 'sticky', top: 0 }}
							>
								{thisComplainants?.length > 0 && thisComplainants?.map((complainant, i) => (
									<Card
										key={complainant.id || i}
										size='small'
										hoverable={complainant.role}
										style={{ width: '100%' }}
										onClick={() => {
											if (!complainant.role) return;
											if (complainant.placeholder) {
												Modal.error({
													title: 'Error',
													content: 'This is a placeholder complainant profile. Please try again later.',
													centered: true
												});
											} else {
												navigate(`/dashboard/students/profile/${complainant.id}`, {
													state: { id: complainant.id }
												});
											};
										}}
									>
										<Flex align='flex-start' gap={8}>
											<Avatar src={complainant.profilePicture + `?random=${Math.random()}`} icon={<UserOutlined />} shape='square' size='large' style={{ width: 32, height: 32 }} />
											<Flex vertical>
												<Text>{complainant.name.first} {complainant.name.middle} {complainant.name.last}</Text>
												<Text type='secondary'>{complainant.id}</Text>
											</Flex>
										</Flex>
									</Card>
								))}
							</PanelCard>
						</div>
						<div
							style={{ width: '100%', height: '100%', order: isMobile ? '3' : '' }}
						>
							<PanelCard
								title={`Complainee${thisComplainees?.length > 1 ? 's' : ''}`}
								style={{ position: 'sticky', top: 0 }}
							>
								{thisComplainees?.length > 0 && thisComplainees?.map((complainee, i) => (
									<Card
										key={complainee.student.id || i}
										size='small'
										hoverable={complainee.student.role}
										style={{ width: '100%' }}
										onClick={() => {
											if (!complainee.student.role) return;
											if (complainee.student.placeholder) {
												Modal.error({
													title: 'Error',
													content: 'This is a placeholder complainee profile. Please try again later.',
													centered: true
												});
											} else {
												navigate(`/dashboard/students/profile/${complainee.student.id}`, {
													state: { id: complainee.student.id }
												});
											};
										}}
									>
										<Badge
											title={`${{ 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[complainee.occurrences] || `${complainee.occurrences}th`} Offense`}
											count={complainee.occurrences}
											color={['yellow', 'orange', 'red'][complainee.occurrences - 1] || 'red'}
											styles={{
												root: { position: 'absolute', top: 0, right: 0 },
												indicator: { color: 'black' }
											}}
											offset={[-8, 8]}
										/>
										<Flex align='flex-start' gap={8}>
											<Avatar src={complainee.student.profilePicture + `?random=${Math.random()}`} icon={<UserOutlined />} shape='square' size='large' style={{ width: 32, height: 32 }} />
											<Flex vertical>
												<Text>{complainee.student.name.first} {complainee.student.name.middle} {complainee.student.name.last}</Text>
												<Text type='secondary'>{complainee.student.id}</Text>
											</Flex>
										</Flex>
									</Card>
								))}
							</PanelCard>
						</div>
						<div
							style={{ width: '100%', height: '100%', order: isMobile ? '1' : '' }}
						>
							<PanelCard
								title='Progress'
								style={{ position: 'sticky', top: 0 }}
								footer={
									<Flex justify='space-between' align='center' gap={16}>
										{(() => {
											const [loading, setLoading] = React.useState(false);
											return (
												<Button
													type='default'
													icon={<LeftOutlined />}
													disabled={step === 0 || thisRecord?.tags.status === 'dismissed'}
													loading={loading}
													block
													onClick={async () => {
														setLoading(true);
														const response = await authFetch(`${API_Route}/records/${id}/degress`, { method: 'PATCH' }).catch((() => null));
														setLoading(false);
														if (!response?.ok) {
															setStep(thisRecord.tags.progress);
															notification.error({
																message: 'Error changing progress.'
															});
															return;
														};
														setStep(step - 1);

														/** @type {import('../../../classes/Record.js').RecordProps} */
														const data = await response.json();
														const newRecord = { ...thisRecord, tags: { ...thisRecord.tags, progress: data.tags?.progress } }
														pushToCache('records', newRecord, true);
														setRefresh({ timestamp: Date.now() });
													}}
												>
													Return
												</Button>
											);
										})()}
										{(() => {
											const [loading, setLoading] = React.useState(false);
											return (
												<Button
													type='primary'
													icon={<RightOutlined />}
													iconPosition='end'
													disabled={step === 5 || thisRecord?.tags.status === 'dismissed'}
													loading={loading}
													block
													onClick={async () => {
														setLoading(true);
														const response = await authFetch(`${API_Route}/records/${id}/progress`, { method: 'PATCH' }).catch((() => null));
														setLoading(false);
														if (!response?.ok) {
															setStep(thisRecord.tags.progress);
															notification.error({
																message: 'Error changing progress.'
															});
															return;
														};
														setStep(step + 1);

														/** @type {import('../../../classes/Record.js').RecordProps} */
														const data = await response.json();
														const newRecord = { ...thisRecord, tags: { ...thisRecord.tags, progress: data.tags?.progress } }
														pushToCache('records', newRecord, true);
														setRefresh({ timestamp: Date.now() });
													}}
												>
													Advance
												</Button>
											);
										})()}
									</Flex>
								}
							>
								<Steps
									current={step}
									size='small'
									direction='vertical'
									style={{ width: '100%' }}
								>
									<Steps.Step title='Case Opened' description={moment(thisRecord?.date ? new Date(thisRecord?.date) : new Date()).format('MMMM Do YYYY')} />
									<Steps.Step title='Initial Interview' description='Interview with the complaining party opening the case.' />
									<Steps.Step title='Respondent Interview' description='Interview with the complainant party.' />
									<Steps.Step title='Resolution' description='Resolution of the case.' />
									<Steps.Step title='Reconciliation' description='Reconciliation of both parties involved.' />
									<Steps.Step title='Clearance' description='Submission of clearance of the issue on hand. Finalization of the case.' />
								</Steps>
							</PanelCard>
						</div>
					</Flex>
				</Flex>
			</Flex>
			<PanelCard
				title='Repository'
				footer={
					<Flex justify='flex-end' align='center' gap={8}>
						{step !== 5 && (
							<Button
								type='primary'
								size='small'
								block={isMobile}
								disabled={thisRecord?.tags.status === 'dismissed' || thisRecord?.tags.status === 'resolved'}
								icon={<UploadOutlined />}
								onClick={async () => {
									if (thisRecord?.placeholder) {
										Modal.error({
											title: 'Error',
											content: 'This is a placeholder disciplinary record. Please try again later.',
											centered: true
										});
										return;
									};

									await UploadRecordFiles(Modal, notification, id);
									setRefresh({ timestamp: Date.now() });
								}}
							>
								Upload
							</Button>
						)}
					</Flex>
				}
			>
				{repository.length > 0 && repository.map((file, i) => (
					<Card
						key={file.id || i}
						size='small'
						style={{ width: '100%' }}
					>
						<Flex align='center' gap={16}>
							<Avatar
								src={file.thumbnailUrl || (file.metadata?.mimetype?.includes('image/') ? file.publicUrl : null)}
								icon={!(file.metadata?.mimetype?.includes && file.metadata?.mimetype.includes('image/')) && <FileOutlined />}
								size='large'
								shape='square'
								style={{ width: 64, height: 64 }}
							/>
							<Flex vertical style={{ flex: 1 }}>
								<Text>{file.name}</Text>
								<Text type='secondary'>{(file.metadata.size / 1024).toFixed(2)} KB • {file.metadata.mimetype}</Text>
							</Flex>
							<Flex gap={8}>
								<Button
									type='default'
									size='small'
									danger
									icon={<DeleteOutlined />}
									onClick={async () => {
										if (thisRecord?.placeholder) {
											Modal.error({
												title: 'Error',
												content: 'This is a placeholder disciplinary record. Please try again later.',
												centered: true
											});
											return;
										};
										Modal.confirm({
											title: 'Confirm Deletion',
											content: <Text>Are you sure you want to delete <Tag>{file.name}</Tag>? This action cannot be undone.</Text>,
											centered: true,
											okButtonProps: { danger: true },
											okText: 'Delete',
											onOk: async () => {
												const response = await authFetch(`${API_Route}/repositories/record/${id}/files/${file.name}`, { method: 'DELETE' }).catch(() => null);
												if (!response?.ok) {
													notification.error({
														message: 'Error deleting file.'
													});
													return;
												};
												removeFromCache('records', 'id', id);
												setRefresh({ timestamp: Date.now() });
												notification.success({
													message: 'File deleted successfully.'
												});
											}
										});
									}}
								/>
								<Button
									type='default'
									size='small'
									icon={<DownloadOutlined />}
									onClick={async () => {
										const downloadDirPath = await downloadDir();
										const tempPath = await join(downloadDirPath, file.name);
										const downloadTask = download(file.publicUrl, tempPath, {
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
								/>
							</Flex>
						</Flex>
					</Card>
				))}
			</PanelCard>
		</Flex>
	);
};

export default Record;


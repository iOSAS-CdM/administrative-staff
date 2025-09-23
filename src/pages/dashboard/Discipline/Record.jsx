import React from 'react';
import { useParams, useNavigate } from 'react-router';
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
	Alert,
	Steps
} from 'antd';

import {
	EditOutlined,
	InboxOutlined,
	LeftOutlined,
	RightOutlined,
	PlusOutlined,
	FileAddOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import PanelCard from '../../../components/PanelCard';

import { useCache } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import EditCase from '../../../modals/EditCase.jsx';

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

	const { id } = useParams();

	const [refreshToken, setRefreshToken] = React.useState(0);

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
			if (!response || !response.ok) {
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
	}, [id, cache.records, refreshToken]);

	const [thisComplainants, setThisComplainants] = React.useState([]);
	const [thisComplainees, setThisComplainees] = React.useState([]);
	React.useEffect(() => {
		if (!thisRecord) return;
		setThisComplainants(thisRecord.complainants);
		setThisComplainees(thisRecord.complainees);
		pushToCache('students', thisRecord.complainants, false);
		pushToCache('students', thisRecord.complainees.map(c => c.student), false);
	}, [thisRecord]);

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
	}, [setHeader]);
	React.useEffect(() => {
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	const [repository, setRepository] = React.useState([]);
	React.useEffect(() => {
		if (thisRecord?.placeholder) {
			setRepository([]);
		} else {
			setRepository([
				{
					name: 'Document 1',
					extension: 'pdf',
					id: 'doc-1',
					thumbnail: '/Placeholder Image.svg'
				},
				{
					name: 'Document 2',
					extension: 'pdf',
					id: 'doc-2',
					thumbnail: '/Placeholder Image.svg'
				},
				{
					name: 'Image 1',
					extension: 'jpg',
					id: 'img-1',
					thumbnail: '/Placeholder Image.svg'
				},
				{
					name: 'Image 2',
					extension: 'png',
					id: 'img-2',
					thumbnail: '/Placeholder Image.svg'
				}
			]);
		};
	}, [thisRecord]);

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
										severe: 'red'
									}[thisRecord?.tags.severity.toLowerCase()] || 'default'
								}>
									{thisRecord?.tags.severity.charAt(0).toUpperCase() + thisRecord?.tags.severity.slice(1)}
								</Tag>
								<Tag color={
									{
										ongoing: 'blue',
										resolved: 'var(--primary)',
										archived: 'grey'
									}[thisRecord?.tags.status] || 'default'
								}>
									{thisRecord?.tags.status.charAt(0).toUpperCase() + thisRecord?.tags.status.slice(1)}
								</Tag>
							</Flex>
							<Card><Text>{thisRecord?.description}</Text></Card>
							<Flex gap={16}>
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
											setThisRecord(data);
											pushToCache('records', data, true);
											notification.success({
												message: 'Record updated successfully.'
											});
										};
									}}
								>
									Edit Record
								</Button>
								<Button
									type='primary'
									danger
									icon={<InboxOutlined />}
									onClick={() => {
										if (thisRecord?.placeholder) {
											Modal.error({
												title: 'Error',
												content: 'This is a placeholder disciplinary record. Please try again later.',
												centered: true
											});
										} else {
										};
									}}
								>
									Archive Record
								</Button>
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
										hoverable
										style={{ width: '100%' }}
										onClick={() => {
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
											<Avatar src={complainant.profilePicture} size='large' style={{ width: 32, height: 32 }} />
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
										hoverable
										style={{ width: '100%' }}
										onClick={() => {
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
											<Avatar src={complainee.student.profilePicture} size='large' style={{ width: 32, height: 32 }} />
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
										<Button
											type='default'
											icon={<LeftOutlined />}
											disabled={step === 0}
											block
											onClick={async () => {
												setStep(step - 1);
												const response = await authFetch(`${API_Route}/records/${id}/degress`, { method: 'PATCH' }).catch((() => null));
												if (!response?.ok) {
													setStep(thisRecord.tags.progress);
													notification.error({
														message: 'Error changing progress.'
													});
													return;
												};

												/** @type {import('../../../classes/Record.js').RecordProps} */
												const data = await response.json();
												const newRecord = { ...thisRecord, tags: { ...thisRecord.tags, progress: data.tags?.progress } }
												pushToCache('records', newRecord, true);
												setTimeout(() => setRefreshToken(Math.floor(Math.random() * 10000)), 500);
											}}
										>
											Return
										</Button>
										{step < 5 ? (
											<Button
												type='primary'
												icon={<RightOutlined />}
												iconPosition='end'
												disabled={step === 5}
												block
												onClick={async () => {
													setStep(step + 1);
													const response = await authFetch(`${API_Route}/records/${id}/progress`, { method: 'PATCH' }).catch((() => null));
													if (!response?.ok) {
														setStep(thisRecord.tags.progress);
														notification.error({
															message: 'Error changing progress.'
														});
														return;
													};

													/** @type {import('../../../classes/Record.js').RecordProps} */
													const data = await response.json();
													const newRecord = { ...thisRecord, tags: { ...thisRecord.tags, progress: data.tags?.progress } }
													pushToCache('records', newRecord, true);
													setTimeout(() => setRefreshToken(Math.floor(Math.random() * 10000)), 500);
												}}
											>
												Proceed
											</Button>
										) : (
											<Button
												type='primary'
												block
											>
												Generate Report
											</Button>
										)}
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
						<Button
							type='default'
							size='small'
							icon={<FileAddOutlined />}
							onClick={() => { }}
						>
							Generate Form
						</Button>
						<Button
							type='primary'
							size='small'
							icon={<PlusOutlined />}
							onClick={() => { }}
						>
							Add
						</Button>
					</Flex>
				}
			>
				{repository.length > 0 && repository.map((file, i) => (
					<Card
						key={file.id || i}
						size='small'
						hoverable
						style={{ width: '100%' }}
						onClick={() => { }}
					>
						<Flex align='flex-start' gap={8}>
							<Avatar src={file.thumbnail} size='large' shape='square' style={{ width: 32, height: 32 }} />
							<Flex vertical>
								<Text>{file.name}</Text>
								<Text type='secondary'>{file.extension.toUpperCase()}</Text>
							</Flex>
						</Flex>
					</Card>
				))}
			</PanelCard>
		</Flex>
	);
};

export default Record;


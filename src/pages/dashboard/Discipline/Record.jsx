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
	Steps
} from 'antd';

import {
	EditOutlined,
	InboxOutlined,
	LeftOutlined,
	RightOutlined,
	PlusOutlined,
	BellOutlined,
	FileAddOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import PanelCard from '../../../components/PanelCard';

import { OSASContext } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';

/**
 * @type {React.FC<{
 * 	setHeader: (header: any) => void,
 * 	setSelectedKeys: (keys: string[]) => void
 * }>}
 */
const Record = ({ setHeader, setSelectedKeys }) => {
	const navigate = useNavigate();

	const isMobile = useMobile();
	const { osas } = React.useContext(OSASContext);
	
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
		date: new Date()
	});
	React.useEffect(() => {
		if (!id) return;
		const record = osas.records.find(r => r.id === id);
		if (record)
			setThisRecord(record);
	}, [id, osas.records]);

	React.useLayoutEffect(() => {
		setHeader({
			title: `Disciplinary Case ${thisRecord.id || ''}`,
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
		if (thisRecord.placeholder) {
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

	const app = App.useApp();
	const Modal = app.modal;

	const [step, setStep] = React.useState(thisRecord.tags.progress);

	return (
		<Flex
			vertical
			gap={16}
		>
			<Flex gap={16} align='stretch' style={{ width: '100%' }}>
				<Flex vertical gap={16} style={{ width: '100%' }}>
					<Card>
						<Flex vertical gap={8}>
							<Title level={1}>{thisRecord.violation}</Title>
							<Flex align='center' gap={8}>
								<Text>
									{thisRecord.date.toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</Text>
								<div>
									<Tag color={
										{
											minor: 'blue',
											major: 'orange',
											severe: 'red'
										}[thisRecord.tags.severity.toLowerCase()] || 'default'
									}>
										{thisRecord.tags.severity.charAt(0).toUpperCase() + thisRecord.tags.severity.slice(1)}
									</Tag>
									<Tag color={
										{
											ongoing: 'blue',
											resolved: 'var(--primary)',
											archived: 'grey'
										}[thisRecord.tags.status] || 'default'
									}>
										{thisRecord.tags.status.charAt(0).toUpperCase() + thisRecord.tags.status.slice(1)}
									</Tag>
								</div>
							</Flex>
							<Text>{thisRecord.description}</Text>
							<Flex gap={8}>
								<Button
									type='primary'
									icon={<EditOutlined />}
									onClick={() => {
										if (thisRecord.placeholder) {
											Modal.error({
												title: 'Error',
												content: 'This is a placeholder disciplinary record. Please try again later.',
												centered: true
											});
											return;
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
										if (thisRecord.placeholder) {
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
								title={`Complainant${thisRecord.complainants.length > 1 ? 's' : ''}`}
								style={{ position: 'sticky', top: 0 }}
								footer={
									<Flex justify='flex-end' align='center' gap={8}>
										<Button
											type='default'
											size='small'
											icon={<BellOutlined />}
											onClick={() => { }}
										>
											Summon
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
								{thisRecord.complainants.length > 0 && thisRecord.complainants.map((complainant, i) => (
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
								title={`Complainee${thisRecord.complainees.length > 1 ? 's' : ''}`}
								style={{ position: 'sticky', top: 0 }}
								footer={
									<Flex justify='flex-end' align='center' gap={8}>
										<Button
											type='default'
											size='small'
											icon={<BellOutlined />}
											onClick={() => { }}
										>
											Summon
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
								{thisRecord.complainees.length > 0 && thisRecord.complainees.map((complainee, i) => (
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
											title={`${{ 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[complainee.occurrence] || `${complainee.occurrence}th`} Offense`}
											count={complainee.occurrence}
											color={['yellow', 'orange', 'red'][complainee.occurrence - 1] || 'red'}
											styles={{
												root: { position: 'absolute', top: 0, right: 0 }
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
									<Flex justify='space-between' align='center' gap={8}>
										<Button
											type='default'
											icon={<LeftOutlined />}
											disabled={step === 0}
											onClick={() => { setStep(step - 1); }}
											style={{ flexGrow: 1 }}
										>
											Return
										</Button>
										{step < 6 ? (
											<Button
												type='primary'
												icon={<RightOutlined />}
												iconPosition='end'
												disabled={step === 6}
												onClick={() => { setStep(step + 1); }}
												style={{ flexGrow: 1 }}
											>
												Proceed
											</Button>
										) : (
											<Button
												type='primary'
												style={{ flexGrow: 1 }}
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
									<Steps.Step title='Case Opened' description={moment(thisRecord.date).format('MMMM Do YYYY')} />
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


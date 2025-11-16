import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router';
import moment from 'moment';

import {
	Card,
	Button,
	Flex,
	Badge,
	Divider,
	Avatar,
	Image,
	Typography,
	Calendar as AntCalendar,
	Tag,
	App,
	Row,
	Col,
	Empty
} from 'antd';

import {
	CheckOutlined,
	EditOutlined,
	LockOutlined,
	LeftOutlined,
	MailOutlined,
	PhoneOutlined,
	WarningOutlined,
	BellOutlined,
	ExclamationCircleOutlined
} from '@ant-design/icons';

import EditStudent from '../../../modals/EditStudent';
import RestrictStudent from '../../../modals/RestrictStudent';
import UnrestrictStudent from '../../../modals/UnrestrictStudent';
import SummonStudent from '../../../modals/SummonStudent';

const { Title, Text } = Typography;

import PanelCard from '../../../components/PanelCard';
import ItemCard from '../../../components/ItemCard';

import { API_Route } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';
import authFetch from '../../../utils/authFetch';

// Simplified Record Display Component for Modal (no navigation)
const RecordDisplay = ({ record, onRecordClick }) => {
	return (
		<Badge.Ribbon
			text={record.tags.status.charAt(0).toUpperCase() + record.tags.status.slice(1)}
			color={
				{
					ongoing: 'blue',
					resolved: 'var(--primary)',
					dismissed: 'grey'
				}[record.tags.status] || 'transparent'
			}
			style={{ display: record.tags.status === 'dismissed' ? 'none' : '' }}
		>
			<ItemCard
				status={record.tags.status === 'dismissed' && 'dismissed'}
				onClick={onRecordClick}
			>
				<Flex vertical justify='flex-start' align='flex-start' gap={16} style={{ position: 'relative' }}>
					<Title level={4}>
						{
							{
								minor: null,
								major: <WarningOutlined style={{ color: 'orange' }} title='Major violation' />,
								severe: <ExclamationCircleOutlined style={{ color: 'red' }} title='Severe violation' />
							}[record.tags.severity.toLowerCase()] || ''
						} {record.title}
					</Title>
					<Text type='secondary'>{record.description}</Text>
					<Flex wrap gap={8}>
						<Tag>
							{record.violation?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
						</Tag>
						<Tag>
							{new Date(record.date).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</Tag>
					</Flex>
				</Flex>
			</ItemCard>
		</Badge.Ribbon>
	);
};

const Calendar = ({ events }) => {
	const [value, setValue] = React.useState(moment());
	const isMobile = useMobile();

	const navigate = useNavigate();

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<AntCalendar
			fullscreen={false}
			onPanelChange={(date) => setValue(date)}
			onSelect={(date, info) => {
				if (info.source === 'date') {
					const eventsForDate =
						events.find(
							(event) =>
								event.date.getDate() === date.date() &&
								event.date.getMonth() === date.month() &&
								event.date.getFullYear() === date.year()
						)?.events || [];
					const modal = Modal.info({
						title: `Events for ${date.format('MMMM D, YYYY')}`,
						centered: true,
						closable: { 'aria-label': 'Close' },
						content: (
							<>
								{eventsForDate.length !== 0 ? (
									<Row gutter={[16, 16]}>
										{eventsForDate.map((event, index) =>
											event.type === 'disciplinary' ? (
												<Col
													key={event.id}
													span={!isMobile ? 12 : 12}
												>
													<RecordDisplay
														record={event.content}
														onRecordClick={() => {
															modal.destroy();
															navigate(`/dashboard/discipline/record/${event.content.id}`);
														}}
													/>
												</Col>
											) : null
										)}
									</Row>
								) : (
									<Empty description='No events found' />
								)}
							</>
						),
						width: {
							xs: '100%',
							sm: '100%',
							md: '100%',
							lg: 512, // 2^9
							xl: 1024, // 2^10
							xxl: 1024 // 2^10
						}
					});
				} else {
					const eventsForMonth = events
						.filter(
							(event) =>
								event.date.getMonth() === date.month() &&
								event.date.getFullYear() === date.year()
						)
						.flatMap((day) => day.events)
						.sort((a, b) => a.content.date - b.content.date);
					const modal = Modal.info({
						title: `Events for ${date.format('MMMM YYYY')}`,
						centered: true,
						closable: { 'aria-label': 'Close' },
						content: (
							<>
								{eventsForMonth.length !== 0 ? (
									<Row gutter={[16, 16]}>
										{eventsForMonth.map((event, index) =>
											event.type === 'disciplinary' ? (
												<Col
													key={event.id}
													span={!isMobile ? 12 : 12}
												>
													<RecordDisplay
														record={event.content}
														onRecordClick={() => {
															modal.destroy();
															navigate(`/dashboard/discipline/record/${event.content.id}`);
														}}
													/>
												</Col>
											) : null
										)}
									</Row>
								) : (
									<Empty description='No events found' />
								)}
							</>
						),
						width: {
							xs: '100%',
							sm: '100%',
							md: '100%',
							lg: 512, // 2^9
							xl: 1024, // 2^10
							xxl: 1024 // 2^10
						}
					});
				}
			}}
			fullCellRender={(date, info) => {
				if (info.type === 'date') {
					const eventsForDate =
						events.find(
							(event) =>
								event.date.getDate() === date.date() &&
								event.date.getMonth() === date.month() &&
								event.date.getFullYear() === date.year()
						)?.events || [];
					return (
						<Badge
							color={
								date.month() === value.month() &&
								date.year() === value.year()
									? ['yellow', 'orange', 'red'][
											eventsForDate.length - 1
									  ] || 'red'
									: 'grey'
							}
							size='small'
							count={eventsForDate.length}
							style={{
								opacity:
									date.month() === value.month() &&
									date.year() === value.year()
										? 1
										: 0.5
							}}
						>
							<Button
								type={
									date.date() === value.date() &&
									date.month() === value.month() &&
									date.year() === value.year()
										? 'primary'
										: 'text'
								}
								style={{
									opacity:
										date.month() === value.month() &&
										date.year() === value.year()
											? 1
											: 0.5
								}}
								size='small'
							>
								{`${date.date()}`.padStart(2, '0')}
							</Button>
						</Badge>
					);
				} else {
					const months = [
						'Jan',
						'Feb',
						'Mar',
						'Apr',
						'May',
						'Jun',
						'Jul',
						'Aug',
						'Sep',
						'Oct',
						'Nov',
						'Dec'
					];
					let eventCount = 0;
					const eventsForMonth = events.filter(
						(event) =>
							event.date.getMonth() === date.month() &&
							event.date.getFullYear() === date.year()
					);
					for (const day of eventsForMonth)
						eventCount += day.events.length;
					return (
						<Badge count={eventCount}>
							<Button
								type={
									date.month() === value.month() &&
									date.year() === value.year()
										? 'primary'
										: 'text'
								}
							>
								{months[date.month()]}
							</Button>
						</Badge>
					);
				}
			}}
			style={{ minWidth: 256 }}
		/>
	);
};

/**
 * @type {React.FC}
 */
const Profile = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const location = useLocation();
	const navigate = useNavigate();
	const Modal = App.useApp().modal;

	const isMobile = useMobile();
	const { getFromCache, pushToCache, updateCacheItem } = useCache();

	React.useLayoutEffect(() => {
		setHeader({
			title: `Student ${location.state?.student?.id || 'Profile'}`,
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

	const { id } = useParams();

	/** @type {[import('../../../classes/Student').StudentProps, React.Dispatch<React.SetStateAction<import('../../../classes/Student').StudentProps>>]} */
	const [thisStudent, setThisStudent] = React.useState({
		placeholder: true,
		name: {
			first: '',
			middle: '',
			last: ''
		},
		id: '',
		email: '',
		profilePicture: '',
		institute: '',
		role: ''
	});
	/** @type {[import('../../../classes/Record').RecordProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Record').RecordProps[]>>]} */
	const [thisRecords, setThisRecords] = React.useState();
	/** @type {[import('../../../classes/Organization').Organization[], React.Dispatch<React.SetStateAction<import('../../../classes/Organization').Organization[]>>]} */
	const [organizations, setOrganizations] = React.useState([]);
	React.useLayoutEffect(() => {
		if (!id) return;

		const controller = new AbortController();
		// Try to get student from cache first
		const cachedStudent = getFromCache('students', 'id', id);
		if (cachedStudent && cachedStudent.id)
			setThisStudent(cachedStudent);

		const fetchStudent = async () => {
			const requests = await Promise.all([
				authFetch(
					`${API_Route}/users/student/${id}`,
					{ signal: controller.signal }
				),
				authFetch(
					`${API_Route}/users/student/${id}/records`,
					{ signal: controller.signal }
				),
				authFetch(
					`${API_Route}/users/student/${id}/organizations`,
					{ signal: controller.signal }
				)
			]);

			for (const request of requests) {
				if (!request?.ok) {
					Modal.error({
						title: 'Error',
						content:
							'Failed to fetch student data. Please try again later.',
						centered: true,
						onOk: () => navigate(-1)
					});
					return;
				};
			};

			/** @type {import('../../../types').Student} */
			const studentData = await requests[0].json();
			/** @type {import('../../../types').Record[]} */
			const recordsData = await requests[1].json();
			/** @type {import('../../../types').Organization[]} */
			const organizationsData = await requests[2].json();

			if (!studentData || !studentData.id) return;
			pushToCache('students', studentData, true);
			setThisStudent(studentData);
			setThisRecords(recordsData.records);
			setOrganizations(organizationsData.organizations);
		};

		fetchStudent();
		return () => controller.abort();
	}, [id]);
	React.useEffect(() => {
		if (thisStudent.role === 'student') setSelectedKeys(['verified']);
		else setSelectedKeys(['unverified']);
	}, [thisStudent]);

	/** @type {[import('../../../classes/Event').EventProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Event').EventProps[]>>]} */
	const [events, setEvents] = React.useState([]);

	// Transform records into calendar events
	React.useEffect(() => {
		if (!thisRecords || thisRecords.length === 0) {
			setEvents([]);
			return;
		};

		// Group records by date
		const eventsByDate = {};

		for (const record of thisRecords) {
			const recordDate = new Date(record.date);
			const dateKey = `${recordDate.getFullYear()}-${recordDate.getMonth()}-${recordDate.getDate()}`;

			if (!eventsByDate[dateKey]) {
				eventsByDate[dateKey] = {
					date: recordDate,
					events: []
				};
			};

			eventsByDate[dateKey].events.push({
				id: record.id,
				type: 'disciplinary',
				content: record
			});
		};

		// Convert to array format expected by Calendar
		const eventsArray = Object.values(eventsByDate);
		setEvents(eventsArray);
	}, [thisRecords]);

	return (
		<Flex vertical gap={16}>
			<Badge.Ribbon
				text={
					thisStudent.status === 'restricted'
						? 'Restricted'
						: thisStudent.role === 'unverified-student'
							? 'Unverified'
							: null
				}
				color={
					thisStudent.status === 'restricted'
						? 'red'
						: thisStudent.role === 'unverified-student'
							? 'orange'
							: null
				}
				style={{
					display:
						thisStudent.status === 'restricted' || thisStudent.role === 'unverified-student' ? '' : 'none'
				}}
			>
				<Card size='small' style={{ width: '100%' }}>
					<Flex
						vertical={isMobile}
						gap={32}
						align='center'
						style={{ position: 'relative', width: '100%' }}
					>
						<Image
							preview={false}
							src={thisStudent.profilePicture + `?random=${Math.random()}`}
							fallback='/Placeholder Image.svg'
							alt='Profile Picture'
							shape='square'
							style={{
								width: 256,
								height: 256,
								border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)',
								objectFit: 'cover',
								filter: thisStudent.role === 'unverified-student' ? 'grayscale(100%)' : ''
							}}
						/>
						<Flex
							vertical
							gap={8}
							justify='center'
							align={isMobile ? 'center' : ''}
							style={{ height: '100%' }}
						>
							<Title level={1} style={{ textAlign: isMobile ? 'center' : '' }}>
								{thisStudent.name.first}{' '}
								{thisStudent.name.middle}{' '}
								{thisStudent.name.last}
							</Title>
							<Flex align='center' gap={8} wrap>
								<Tag>{thisStudent.id}</Tag>
								<Tag
									color={
										thisStudent.institute === 'ics'
											? 'orange'
											: thisStudent.institute === 'ite'
											? 'blue'
											: thisStudent.institute === 'ibe'
											? 'yellow'
											: 'gray'
									}
								>
									{thisStudent.institute === 'ics'
										? 'Institute of Computing Studies'
										: thisStudent.institute === 'ite'
										? 'Institute of Teacher Education'
										: thisStudent.institute === 'ibe'
										? 'Institute of Business Entrepreneurship'
										: ''}
								</Tag>
							</Flex>
							<Flex gap={16}>
								<Tag icon={<MailOutlined />} color='green'>
									{thisStudent.email}
								</Tag>
								{thisStudent.phone && (
									<Tag icon={<PhoneOutlined />} color='green'>
										{thisStudent.phone}
									</Tag>
								)}
							</Flex>
							<Divider />
							{thisStudent.status === 'restricted' && thisStudent.reason && (
								<>
									<Flex vertical gap={4}>
										<Text strong style={{ color: 'red' }}>Restriction Reason:</Text>
										<Text type='secondary' style={{ fontStyle: 'italic' }}>
											{thisStudent.reason}
										</Text>
									</Flex>
									<Divider />
								</>
							)}
							<Flex justify='flex-start' align='stretch' gap={16}>
								<Button
									type={thisStudent.role === 'student' ? 'primary' : 'default'}
									icon={<EditOutlined />}
									onClick={() => {
										if (thisStudent.placeholder) {
											Modal.error({
												title: 'Error',
												content:
													'This is a placeholder student profile. Please try again later.',
												centered: true
											});
										} else {
											EditStudent(
												Modal,
												thisStudent,
												setThisStudent
											);
										};
									}}
								>
									Edit
								</Button>
								<Button
									icon={<BellOutlined />}
									onClick={() => {
										if (thisStudent.placeholder) {
											Modal.error({
												title: 'Error',
												content:
													'This is a placeholder student profile. Please try again later.',
												centered: true
											});
											return;
										};
										SummonStudent(Modal, thisStudent);
									}}
								>
									Summon
								</Button>
								{thisStudent.role === 'unverified-student' &&
									<Button
										type='primary'
										icon={<CheckOutlined />}
										onClick={async () => {
											if (thisStudent.placeholder) {
												Modal.error({
													title: 'Error',
													content:
														'This is a placeholder student profile. Please try again later.',
													centered: true
												});
												return;
											};

											await Modal.confirm({
												title: 'Are you sure you want to verify this student?',
												content: 'This action cannot be undone.',
												centered: true,
												okText: 'Yes, Verify',
												okType: 'primary',
												cancelText: 'Cancel',
												onOk: () => new Promise(async (resolve) => {
													const request = await authFetch(
														`${API_Route}/users/student/${thisStudent.id}/verify`,
														{
															method: 'POST'
														}
													);
													if (!request?.ok) {
														Modal.error({
															title: 'Error',
															content:
																'Failed to verify student. Please try again later.',
															centered: true
														});
														return;
													};
													const data = await request.json();
													if (!data || !data.id) {
														Modal.error({
															title: 'Error',
															content:
																'Failed to verify student. Please try again later.',
															centered: true
														});
														return;
													};

													updateCacheItem('students', 'id', data.id, data);

													setThisStudent(data);
													Modal.success({
														title: 'Success',
														content:
															'Student has been verified successfully.',
														centered: true
													});
												})
											});
										}}
									>
										Verify
									</Button>
								}
								{thisStudent.status === 'restricted' ? (
									<Button
										type='primary'
										icon={<LockOutlined />}
										onClick={() => {
											if (thisStudent.placeholder) {
												Modal.error({
													title: 'Error',
													content:
														'This is a placeholder student profile. Please try again later.',
													centered: true
												});
											} else {
												UnrestrictStudent(Modal, thisStudent, setThisStudent);
											};
										}}
									>
										Unrestrict
									</Button>
								) : (
										<Button
											type={thisStudent.role === 'student' ? 'primary' : 'default'}
											danger
											icon={<LockOutlined />}
											onClick={() => {
												if (thisStudent.placeholder) {
													Modal.error({
														title: 'Error',
														content:
															'This is a placeholder student profile. Please try again later.',
														centered: true
													});
												} else {
													RestrictStudent(Modal, thisStudent, setThisStudent);
												};
											}}
										>
											Restrict
										</Button>
								)}
							</Flex>
						</Flex>
					</Flex>
				</Card>
			</Badge.Ribbon>
			<Flex
				vertical={isMobile}
				align='stretch'
				gap={16}
				style={{ position: 'relative', width: '100%' }}
			>
				<div style={{ flex: 0 }}>
					<Flex
						vertical
						gap={16}
						style={{ position: 'sticky', top: 0 }}
					>
						<PanelCard title='Organizations' style={{ minWidth: 256 }}>
							{organizations.length > 0 && (
								<Flex
									vertical
									gap={16}
									style={{
										maxHeight: 'calc(var(--space-XL) * 20)'
									}}
								>
									{organizations.map(
										(organization, index) => (
											<Card
												key={index}
												size='small'
												hoverable
												onClick={() => {
													navigate(
														`/dashboard/students/organization/${organization.id}`,
														{
															state: {
																id: organization.id
															}
														}
													);
												}}
											>
												<Flex
													justify='flex-start'
													align='center'
													gap={16}
												>
													<Avatar
														src={organization.logo}
														size='large'
													/>
													<Flex vertical>
														<Text strong>
															{
																organization.shortName
															}
														</Text>
														<Text type='secondary'>
															{
																organization.members.find(
																	(member) =>
																		member
																			.student
																			.id ===
																		thisStudent.id
																).role
															}
														</Text>
													</Flex>
												</Flex>
											</Card>
										)
									)}
								</Flex>
							)}
						</PanelCard>
					</Flex>
				</div>
				<Flex style={{ width: '100%', flex: 1 }}>
					<PanelCard title='Calendar' style={{ width: '100%' }}>
						<Calendar events={events} />
					</PanelCard>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default Profile;

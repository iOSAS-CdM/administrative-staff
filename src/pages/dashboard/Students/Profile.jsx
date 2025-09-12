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
	FileOutlined,
	EditOutlined,
	LockOutlined,
	LeftOutlined,
	MailOutlined,
	PhoneOutlined
} from '@ant-design/icons';

import EditStudent from '../../../modals/EditStudent';
import RestrictStudent from '../../../modals/RestrictStudent';

const { Title, Text } = Typography;

import PanelCard from '../../../components/PanelCard';
// import { RecordCard } from '../Discipline/Records';

import { MobileContext, API_Route } from '../../../main';
import { useCache } from '../../../contexts/CacheContext';
import authFetch from '../../../utils/authFetch';

const Calendar = ({ events }) => {
	const [value, setValue] = React.useState(moment());
	const { mobile } = React.useContext(MobileContext);

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
													span={!mobile ? 12 : 12}
													onClick={() =>
														modal.destroy()
													}
												>
													<RecordCard
														record={event.content}
														loading={false}
														navigate={navigate}
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
													span={!mobile ? 12 : 12}
													onClick={() =>
														modal.destroy()
													}
												>
													<RecordCard
														record={event.content}
														loading={false}
														navigate={navigate}
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

const Profile = ({ setHeader, setSelectedKeys, navigate }) => {
	const location = useLocation();

	const { mobile } = React.useContext(MobileContext);
	const { cache, getFromCache, pushToCache } = useCache();

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
		email: ''
	});
	React.useEffect(() => {
		const controller = new AbortController();
		if (id) {
			// Try to get student from cache first
			const cachedStudent = getFromCache('peers', 'id', id);
			if (cachedStudent) {
				setThisStudent(cachedStudent);
			} else {
				const fetchStudent = async () => {
					// Fetch student from the backend
					const request = await authFetch(
						`${API_Route}/users/student/${id}`,
						{ signal: controller.signal }
					);
					if (!request.ok) return;

					/** @type {import('../../../types').Student} */
					const data = await request.json();
					if (!data || !data.id) return;
					pushToCache('peers', data, true);
					setThisStudent(data);
				};
				fetchStudent();
			}
		}
		return () => controller.abort('Clear Memory');
	}, [id, getFromCache]);
	React.useEffect(() => {
		if (thisStudent.role === 'student') setSelectedKeys(['verified']);
		else setSelectedKeys(['unverified']);
	}, [thisStudent]);

	const [organizations, setOrganizations] = React.useState([]);

	/** @type {[import('../../../main').OSASData['events'], React.Dispatch<React.SetStateAction<import('../../../main').OSASData['events']>>]} */
	const [events, setEvents] = React.useState([]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex vertical gap={16}>
			<Badge.Ribbon
				text={thisStudent.role === 'unverified-student' && 'Unverified'}
				color='orange'
				style={{
					display:
						thisStudent.role === 'unverified-student' ? '' : 'none'
				}}
			>
				<Card size='small' style={{ width: '100%' }}>
					<Flex
						vertical={mobile}
						gap={32}
						align='center'
						style={{ position: 'relative', width: '100%' }}
					>
						<Image
							preview={false}
							src={thisStudent.profilePicture}
							fallback='/Placeholder Image.svg'
							alt='Profile Picture'
							shape='square'
							style={{
								width: 256,
								height: 256,
								border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)',
								objectFit: 'cover'
							}}
						/>
						<Flex
							vertical
							gap={8}
							justify='center'
							align={mobile ? 'center' : ''}
							style={{ height: '100%' }}
						>
							<Title level={1}>
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
										}
									}}
								>
									Edit
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

											const confirm = await Modal.confirm({
												title: 'Are you sure you want to verify this student?',
												content: 'This action cannot be undone.',
												centered: true,
												okText: 'Yes, Verify',
												okType: 'primary',
												cancelText: 'Cancel'
											});
											if (!confirm) return;

											const request = await authFetch(
												`${API_Route}/users/student/${thisStudent.id}/verify`,
												{
													method: 'POST'
												}
											);
											if (!request.ok) {
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
											pushToCache('peers', data, true);
											setThisStudent(data);
											Modal.success({
												title: 'Success',
												content:
													'Student has been verified successfully.',
												centered: true
											});
										}}
									>
										Verify
									</Button>
								}
								<Button
									type={thisStudent.role === 'student' ? 'primary' : 'default'}
									icon={<FileOutlined />}
									onClick={() => {}}
								>
									Generate Clearance
								</Button>
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
											RestrictStudent(Modal, thisStudent);
										}
									}}
								>
									Restrict
								</Button>
							</Flex>
						</Flex>
					</Flex>
				</Card>
			</Badge.Ribbon>
			<Flex
				vertical={mobile}
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
						<PanelCard title='Calendar'>
							<Calendar events={events} />
						</PanelCard>

						<PanelCard title='Organizations'>
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
					<PanelCard
						title='Disciplinary Events'
						style={{ width: '100%' }}
					>
						{events.length > 0 &&
							events.map((event, index) => (
								<Flex key={index} vertical gap={8}>
									<Text strong>
										{moment(event.date).format(
											'MMMM D, YYYY'
										)}
									</Text>
									{event.events.map((e, idx) => (
										<Flex
											key={idx}
											justify='flex-start'
											align='flex-start'
											style={{
												cursor: 'pointer',
												width: '100%'
											}}
											onClick={() => {
												navigate(
													`/dashboard/discipline/record/${e.id}`,
													{
														state: { id: e.id }
													}
												);
											}}
										>
											<Badge
												color={
													['yellow', 'orange', 'red'][
														e.content.complainees.find(
															(c) =>
																c.student.id ===
																thisStudent.id
														)?.occurrence - 1
													] || 'red'
												}
												size='small'
												count={
													e.content.complainees.some(
														(c) =>
															c.student.id ===
															thisStudent.id
													)
														? e.content.complainees.find(
																(c) =>
																	c.student
																		.id ===
																	thisStudent.id
														  ).occurrence
														: 0
												}
												offset={[-8, 0]}
											>
												<Tag
													color={
														e.content.tags
															.status ===
														'ongoing'
															? 'yellow'
															: 'var(--primary)'
													}
												>
													{e.content.tags.status}
												</Tag>
											</Badge>
											<Text>{e.content.violation}</Text>
										</Flex>
									))}
								</Flex>
							))}
					</PanelCard>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default Profile;

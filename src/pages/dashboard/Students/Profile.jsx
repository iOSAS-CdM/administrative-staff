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
import { RecordCard } from './Records';

import { MobileContext, OSASContext } from '../../../main';

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
					const eventsForDate = events.find(event =>
						event.date.getDate() === date.date()
						&& event.date.getMonth() === date.month()
						&& event.date.getFullYear() === date.year()
					)?.events || [];
					const modal = Modal.info({
						title: `Events for ${date.format('MMMM D, YYYY')}`,
						centered: true,
						closable: { 'aria-label': 'Close' },
						content: (
							<>
								{
									eventsForDate.length !== 0 ? (
										<Row gutter={[16, 16]}>
											{eventsForDate.map((event, index) => (
												event.type === 'disciplinary' ? (
													<Col key={event.id} span={!mobile ? 12 : 12} onClick={() => modal.destroy()}>
														<RecordCard record={event.content} loading={false} navigate={navigate} />
													</Col>
												) : null
											))}
										</Row>
									) : (
										<Empty description='No events found' />
									)
								}
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
					const eventsForMonth = events.filter(event =>
						event.date.getMonth() === date.month()
						&& event.date.getFullYear() === date.year()
					).flatMap(day => day.events).sort((a, b) => a.content.date - b.content.date);
					const modal = Modal.info({
						title: `Events for ${date.format('MMMM YYYY')}`,
						centered: true,
						closable: { 'aria-label': 'Close' },
						content: (
							<>
								{
									eventsForMonth.length !== 0 ? (
										<Row gutter={[16, 16]}>
											{eventsForMonth.map((event, index) => (
												event.type === 'disciplinary' ? (
													<Col key={event.id} span={!mobile ? 12 : 12} onClick={() => modal.destroy()}>
														<RecordCard record={event.content} loading={false} navigate={navigate} />
													</Col>
												) : null
											))}
										</Row>
									) : (
										<Empty description='No events found' />
									)
								}
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
				};
			}}
			fullCellRender={(date, info) => {
				if (info.type === 'date') {
					const eventsForDate = events.find(event =>
						event.date.getDate() === date.date()
						&& event.date.getMonth() === date.month()
						&& event.date.getFullYear() === date.year()
					)?.events || [];
					return (
						<Badge
							color={
								date.month() === value.month()
									&& date.year() === value.year() ? (['yellow', 'orange', 'red'][eventsForDate.length - 1] || 'red') : 'grey'
							}
							size='small'
							count={eventsForDate.length}
							style={{
								opacity: date.month() === value.month()
									&& date.year() === value.year() ? 1 : 0.5
							}}
						>
							<Button
								type={
									date.date() === value.date()
										&& date.month() === value.month()
										&& date.year() === value.year() ? 'primary' : 'text'
								}
								style={{
									opacity: date.month() === value.month()
										&& date.year() === value.year() ? 1 : 0.5
								}}
								size='small'
							>
								{`${date.date()}`.padStart(2, '0')}
							</Button>
						</Badge>
					);
				} else {
					const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
					let eventCount = 0;
					const eventsForMonth = events.filter(event =>
						event.date.getMonth() === date.month()
						&& event.date.getFullYear() === date.year()
					);
					for (const day of eventsForMonth)
						eventCount += day.events.length;
					return (
						<Badge
							count={eventCount}
						>
							<Button
								type={
									date.month() === value.month()
										&& date.year() === value.year() ? 'primary' : 'text'
								}
							>
								{months[date.month()]}
							</Button>
						</Badge>
					);
				};
			}}
			style={{ minWidth: 256 }}
		/>
	);
};

const Profile = ({ setHeader, setSelectedKeys, navigate }) => {
	const location = useLocation();

	const { mobile } = React.useContext(MobileContext);
	const { osas } = React.useContext(OSASContext);

	React.useLayoutEffect(() => {
		setHeader({
			title: `Student ${location.state?.student?.studentId || 'Profile'}`,
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
		setSelectedKeys(['profiles']);
	}, [setSelectedKeys]);

	const { studentId } = useParams();

	/** @type {[import('../../../classes/Student').StudentProps, React.Dispatch<React.SetStateAction<import('../../../classes/Student').StudentProps>>]} */
	const [thisStudent, setThisStudent] = React.useState({
		placeholder: true,
		name: {
			first: '',
			middle: '',
			last: ''
		},
		studentId: '',
		email: ''
	});
	React.useEffect(() => {
		if (!studentId) return;
		const student = osas.students.find(s => s.studentId === studentId);
		if (student)
			setThisStudent(student);
	}, [studentId, osas.students]);

	const [organizations, setOrganizations] = React.useState([]);
	React.useEffect(() => {
		if (!thisStudent || !thisStudent.studentId) return;
		// Find organizations for the student that match the student id
		const fetchedOrganizations = osas.organizations.filter(org => org.members.some(member => member.student.studentId === thisStudent.studentId));
		setOrganizations(fetchedOrganizations);
	}, [thisStudent, osas.organizations]);

	/** @type {[import('../../../main').OSASData['events'], React.Dispatch<React.SetStateAction<import('../../../main').OSASData['events']>>]} */
	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		if (!thisStudent || !thisStudent.studentId) return;
		// Filter events that are related to the student
		const studentEvents = [];
		for (const day of osas.events) {
			const eventsOnDay = day.events.filter(event =>
				event.type === 'disciplinary' && (
					event.content.complainants.some(c => c.studentId === thisStudent.studentId)
					|| event.content.complainees.some(c => c.student.studentId === thisStudent.studentId)
				)
			);
			if (eventsOnDay.length > 0)
				studentEvents.push({
					date: day.date,
					events: eventsOnDay
				});
		};
		setEvents(studentEvents);
	}, [thisStudent, osas.events]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex vertical gap={16}>
			<Card size='small' style={{ width: '100%' }}>
				<Flex vertical={mobile} gap={32} align='center' style={{ position: 'relative', width: '100%' }}>
					<Image
						preview={false}
						src={thisStudent.profilePicture || '/Placeholder Image.svg'}
						alt='Profile Picture'
						shape='square'
						style={{
							width: 256,
							height: 256,
							border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
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
							{thisStudent.name.first} {thisStudent.name.middle} {thisStudent.name.last} <Text type='secondary' style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}> {thisStudent.studentId} </Text>
						</Title>
						<Text>
							{
								thisStudent.institute === 'ics' ? 'Institute of Computing Studies' :
									thisStudent.institute === 'ite' ? 'Institute of Teacher Education' :
										thisStudent.institute === 'ibe' ? 'Institute of Business Entrepreneurship' : ''
							}
						</Text>

						<Flex gap={16}>
							<Button
								type='link'
								icon={<MailOutlined />}
								style={{ padding: 0 }}
							>
								{thisStudent.email}
							</Button>

							{thisStudent.phone &&
								<Button
									type='link'
									icon={<PhoneOutlined />}
									style={{ padding: 0 }}
								>
									{thisStudent.phone}
								</Button>
							}
						</Flex>

						<Divider />

						<Flex justify='flex-start' align='stretch' gap={16}>
							<Button
								type='primary'
								icon={<EditOutlined />}
								onClick={() => {
									if (thisStudent.placeholder) {
										Modal.error({
											title: 'Error',
											content: 'This is a placeholder student profile. Please try again later.',
											centered: true
										});
									} else {
										EditStudent(Modal, thisStudent, setThisStudent);
									};
								}}
							>
								Edit
							</Button>
							<Button
								type='primary'
								icon={<FileOutlined />}
								onClick={() => { }}
							>
								Generate Clearance
							</Button>
							<Button
								type='primary'
								danger
								icon={<LockOutlined />}
								onClick={() => {
									if (thisStudent.placeholder) {
										Modal.error({
											title: 'Error',
											content: 'This is a placeholder student profile. Please try again later.',
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
			<Flex vertical={mobile} align='stretch' gap={16} style={{ position: 'relative', width: '100%' }}>
				<div style={{ flex: 0 }}>
					<Flex vertical gap={16} style={{ position: 'sticky', top: 0 }}>
						<PanelCard title='Calendar'>
							<Calendar events={events} />
						</PanelCard>

						<PanelCard title='Organizations'>
							{organizations.length > 0 && (
								<Flex vertical gap={16} style={{ maxHeight: 'calc(var(--space-XL) * 20)' }}>
									{organizations.map((organization, index) => (
										<Card
											key={index}
											size='small'
											hoverable
											onClick={() => {
												navigate(`/dashboard/students/organization/${organization.id}`, {
													state: { id: organization.id }
												});
											}}
										>
											<Flex justify='flex-start' align='center' gap={16}>
												<Avatar src={organization.logo} size='large' />
												<Flex vertical>
													<Text strong>{organization.shortName}</Text>
													<Text type='secondary'>{organization.members.find(member => member.student.studentId === thisStudent.studentId).role}</Text>
												</Flex>
											</Flex>
										</Card>
									))}
								</Flex>
							)}
						</PanelCard>
					</Flex>
				</div>
				<Flex style={{ width: '100%', flex: 1 }}>
					<PanelCard title='Disciplinary Events' style={{ width: '100%' }}>
						{events.length > 0 && (
							events.map((event, index) => (
								<Flex key={index} vertical gap={8}>
									<Text strong>{moment(event.date).format('MMMM D, YYYY')}</Text>
									{event.events.map((e, idx) => (
										<Flex
											key={idx}
											justify='flex-start'
											align='flex-start'
											style={{ cursor: 'pointer', width: '100%' }}
											onClick={() => {
												navigate(`/dashboard/students/record/${e.id}`, {
													state: { id: e.id }
												});
											}}
										>
											<Badge
												color={['yellow', 'orange', 'red'][e.content.complainees.find(c => c.student.studentId === thisStudent.studentId)?.occurrence - 1] || 'red'}
												size='small'
												count={e.content.complainees.some(c => c.student.studentId === thisStudent.studentId) ? e.content.complainees.find(c => c.student.studentId === thisStudent.studentId).occurrence : 0}
												offset={[-8, 0]}
											>
												<Tag color={e.content.tags.status === 'ongoing' ? 'yellow' : 'var(--primary)'}>{e.content.tags.status}</Tag>
											</Badge>
											<Text>{e.content.violation}</Text>
										</Flex>
									))}
								</Flex>
							))
						)}
					</PanelCard>
				</Flex>
			</Flex>
		</Flex>
	);
};

export default Profile;


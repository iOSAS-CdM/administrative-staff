import React from 'react';
import { useLocation } from 'react-router';
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
	App
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

import { MobileContext, OSASContext } from '../../../main';

const Calendar = ({ events }) => {
	const [value, setValue] = React.useState(moment());
	return (
		<AntCalendar
			fullscreen={false}
			onPanelChange={(date) => {
				setValue(date);
			}}
			fullCellRender={(date) => {
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
				)
			}}
		/>
	);
};

const Profile = ({ setHeader, setSelectedKeys, navigate }) => {
	const location = useLocation();

	const { mobile } = React.useContext(MobileContext);
	const { osas } = React.useContext(OSASContext);

	React.useEffect(() => {
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

	/** @type {[import('../../../classes/Student').StudentProps, React.Dispatch<React.SetStateAction<import('../../../classes/Student').StudentProps>>]} */
	const [thisStudent, setThisStudent] = React.useState({
		placeholder: true,
		name: {
			first: 'Placeholder',
			middle: 'Student',
			last: 'Profile'
		},
		studentId: '00000000',
		email: 'placeholder@student.com'
	});
	React.useEffect(() => {
		if (!location.state?.studentId) return;
		const student = osas.students.find(s => s.studentId === location.state.studentId);
		if (student)
			setThisStudent(student);
	}, [location.state?.studentId]);

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
							width: 'calc(var(--space-XL) * 16)',
							height: 'calc(var(--space-XL) * 16)',
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
											onClick={() => {
												navigate(`/dashboard/students/organizations/${organization.id}`, {
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
												navigate(`/dashboard/students/records/${e.id}`, {
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
												<Tag color={e.content.tags.status === 'ongoing' ? 'yellow' : 'green'}>{e.content.tags.status}</Tag>
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


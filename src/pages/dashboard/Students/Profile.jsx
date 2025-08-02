import React from 'react';
import { useLocation } from 'react-router';
import moment from 'moment';

import {
	Card,
	Button,
	Flex,
	Row,
	Col,
	Divider,
	Avatar,
	Image,
	Typography,
	Calendar,
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

const Profile = ({ setHeader, setSelectedKeys, navigate }) => {
	const location = useLocation();

	const { mobile, setMobile } = React.useContext(MobileContext);
	const { osas, setOsas } = React.useContext(OSASContext);

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
		console.log('Fetched Organizations:', fetchedOrganizations);
		setOrganizations(fetchedOrganizations);
	}, [thisStudent, osas.organizations]);

	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		if (!thisStudent || !thisStudent.studentId) return;
		const fetchedRecords = [
			...osas.records.filter(record => {
				return record.complainees.some(complainee => complainee.student.studentId === thisStudent.studentId);
			}),
			...osas.records.filter(record => {
				return record.complainants.some(complainant => complainant.studentId === thisStudent.studentId);
			})
		];
		const eventsMap = fetchedRecords.reduce((acc, record) => {
			const dateKey = moment(record.date).format('YYYY-MM-DD');
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push({
				title: record.violation,
				tag: record.tags.status,
				type: 'disciplinary',
				id: record.id
			});
			return acc;
		}, {});
		console.log('Fetched Events:', eventsMap);
		const groupedEvents = Object.entries(eventsMap).reduce((acc, [date, events]) => {
			const formattedDate = moment(date).format('YYYY-MM-DD');
			acc[formattedDate] = events;
			return acc;
		}, {});
		console.log('Grouped Events:', groupedEvents);
		setEvents(groupedEvents);
	}, [thisStudent, osas.records]);

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
				<div style={{ position: 'sticky', top: 0 }}>
					<Flex vertical gap={16} style={{ position: 'sticky', top: 0 }}>
						<PanelCard title='Calendar'>
							<Calendar
								fullscreen={false}
								style={{ width: mobile ? '100%' : 'calc(var(--space-XL) * 20)' }}
							/>
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
				<Flex style={{ width: '100%' }}>
					<PanelCard title='Disciplinary Events' style={{ width: '100%' }}>
						{Object.keys(events).length > 0 && (
							Object.entries(events).map(([date, events]) => (
								<Flex key={date} vertical gap={8}>
									<Text strong>{date}</Text>
									{events.map((event, index) => (
										<Flex
											key={index}
											justify='flex-start'
											align='flex-start'
											style={{ cursor: 'pointer' }}
											onClick={() => {
												if (event.type === 'disciplinary') {
													navigate(`/dashboard/students/records/${event.id}`, {
														state: { id: event.id }
													});
												};
											}}
										>
											<Tag color={event.tag === 'ongoing' ? 'yellow' : 'green'}>{event.tag}</Tag>
											<Text>{event.title}</Text>
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


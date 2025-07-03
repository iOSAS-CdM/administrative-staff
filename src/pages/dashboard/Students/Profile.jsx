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

const Profile = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	const location = useLocation();

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

	const [thisStudent, setThisStudent] = React.useState(location.state?.student || {
		id: '12345',
		name: {
			first: 'John',
			middle: 'A.',
			last: 'Doe'
		},
		email: 'email@mail.com',
		studentId: '22-00250',
		institute: 'head',
		profilePicture: 'https://via.placeholder.com/150'
	});

	const [organizations, setOrganizations] = React.useState([]);
	React.useEffect(() => {
		const fetchedOrganizations = [
			{
				name: 'Student Council',
				role: 'Member',
				profilePicture: 'https://picsum.photos/200'
			},
			{
				name: 'Debate Club',
				role: 'President',
				profilePicture: 'https://picsum.photos/200'
			},
			{
				name: 'Science Society',
				role: 'Member',
				profilePicture: 'https://picsum.photos/200'
			}
		].sort((a, b) => a.name.localeCompare(b.name));

		setOrganizations(fetchedOrganizations);
	}, []);

	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		const fetchedEvents = [
			{
				title: 'Disobedience to the proper dress code.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Loitering in the school premises.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Bullying and harassment of fellow students.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Vandalism of school property.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Unauthorized use of school facilities.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Excessive absences without valid reasons.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			}
		].sort((a, b) => new Date(b.date) - new Date(a.date));

		// Group by day
		const groupedEvents = fetchedEvents.reduce((acc, event) => {
			const eventDate = moment(event.date).clone().startOf('day').fromNow();
			if (!acc[eventDate])
				acc[eventDate] = [];
			acc[eventDate].push(event);
			return acc;
		}, {});


		setEvents(groupedEvents);
	}, []);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex
			vertical
			gap={16}
		>
			<Row gutter={[16, 16]}>
				<Col span={!mobile ? 4 : 24} style={{ height: '100%' }}>
					{!mobile ? (
						<Flex
							justify='center'
							align='center'
							style={{ width: '100%', height: '100%' }}
						>
							<Avatar
								src={thisStudent.profilePicture || 'https://via.placeholder.com/150'}
								alt='Profile Picture'
								shape='square'
								style={{ width: '100%', height: '100%' }}
							/>
						</Flex>
					) : (
						<Card size='small'>
							<Flex
								justify='center'
								align='center'
								style={{ width: '100%', height: '100%' }}
							>
								<Avatar
									src={thisStudent.profilePicture || 'https://via.placeholder.com/150'}
									alt='Profile Picture'
									shape='square'
									style={{ width: 'calc(var(--space-XL) * 12)', height: 'calc(var(--space-XL) * 12)' }}
								/>
							</Flex>
						</Card>
					)}
				</Col>

				<Col span={!mobile ? 20 : 24}>
					<Card style={{ height: '100%' }}>
						<Flex
							vertical
							gap={16}
							justify='center'
							align='stretch'
							style={{ height: '100%' }}
						>
							<Title level={4}>
								{thisStudent.name.first} {thisStudent.name.middle} {thisStudent.name.last} <Text type='secondary' style={{ unicodeBidi: 'bidi-override' }}> {thisStudent.studentId} </Text>
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
					</Card>
				</Col>

				<Col span={!mobile ? 6 : 24}>
					<Flex vertical gap={16} style={{ width: '100%' }}>
						<PanelCard title='Calendar'>
							<Calendar
								style={{ width: '100%' }}
								fullscreen={false}
							/>
						</PanelCard>

						<PanelCard title='Organizations'>
							<Flex vertical gap={16} className='scrollable-content' style={{ maxHeight: 'calc(var(--space-XL) * 8)' }}>
								{organizations.length > 0 && (
									organizations.map((org, index) => (
										<Card key={index} size='small' style={{ width: '100%' }}>
											<Flex justify='flex-start' align='center' gap={16}>
												<Avatar src={org.profilePicture} size='large' />
												<Flex vertical>
													<Text strong>{org.name}</Text>
													<Text type='secondary'>{org.role}</Text>
												</Flex>
											</Flex>
										</Card>
									))
								)}
							</Flex>
						</PanelCard>
					</Flex>
				</Col>

				<Col span={!mobile ? 18 : 24}>
					<PanelCard title='Disciplinary Events'>
						{Object.keys(events).length > 0 && (
							Object.entries(events).map(([date, events]) => (
								<Flex key={date} vertical gap={8}>
									<Text strong>{date}</Text>

									{events.map((event, index) => (
										<Flex key={index} justify='flex-start' align='flex-start'>
											<Tag color={event.tag === 'ongoing' ? 'yellow' : 'green'}>{event.tag}</Tag>
											<Text>{event.title}</Text>
										</Flex>
									))}
								</Flex>
							))
						)}
					</PanelCard>
				</Col>
			</Row>
		</Flex>
	);
};

export default Profile;


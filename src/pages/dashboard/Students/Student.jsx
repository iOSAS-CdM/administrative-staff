import React from 'react';
import { useLocation } from 'react-router';

import {
	App,
	Form,
	Input,
	Card,
	Button,
	Segmented,
	Dropdown,
	Flex,
	Image,
	Row,
	Col,
	Divider,
	Avatar,
	Typography
} from 'antd';

import {
	SearchOutlined,
	FilterOutlined,
	EditOutlined,
	LockOutlined,
	LeftOutlined,
	MailOutlined,
	PhoneOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

import '../../../styles/pages/Dashboard.css';

const StudentProfile = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	React.useEffect(() => {
		setHeader({
			title: 'Student Profiles',
			actions: (
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate(-1)}
				>
					Back
				</Button>
			)
		});
	}, [setHeader]);
	React.useEffect(() => {
		setSelectedKeys(['profiles']);
	}, [setSelectedKeys]);

	const location = useLocation();

	const [thisStudent, setThisStudent] = React.useState(location.state?.student || {
		id: '12345',
		name: {
			first: 'John',
			middle: 'A.',
			last: 'Doe'
		},
		email: 'email@mail.com',
		employeeId: '22-00250',
		position: 'head',
		profilePicture: 'https://via.placeholder.com/150'
	});


	return (
		<Flex
			vertical
			gap={16}
		>
			<Flex justify='flex-start' align='stretch' gap={16}>
				{!mobile && <Avatar
					src={thisStudent.profilePicture || 'https://via.placeholder.com/150'}
					alt='Profile Picture'
					shape='square'
					style={{
						height: 'calc(var(--space-XL) * 12)',
						width: 'calc(var(--space-XL) * 12)'
					}}
				/>}

				<Card style={{ flex: 1 }}>
					<Flex
						vertical
						gap={16}
						justify='center'
						align={!mobile ? 'stretch' : 'center'}
						style={{ height: '100%', ...mobile ? { textAlign: 'center' } : {} }}
					>
						{mobile && <Avatar
							src={thisStudent.profilePicture || 'https://via.placeholder.com/150'}
							objectFit='cover'
							alt='Profile Picture'
							shape='square'
							style={{
								height: 'calc(var(--space-XL) * 12)',
								width: 'calc(var(--space-XL) * 12)'
							}}
						/>}

						<Title level={4}>{thisStudent.name.first} {thisStudent.name.middle} {thisStudent.name.last} <Text type='secondary' style={{ unicodeBidi: 'bidi-override' }}>{thisStudent.studentId}</Text></Title>
						<Text>{
							thisStudent.institute === 'ics' ? 'Institute of Computing Studies' :
								thisStudent.institute === 'ite' ? 'Institute of Teacher Education' :
									thisStudent.institute === 'ibe' ? 'Institute of Business Entrepreneurship' : ''
						}</Text>

						<Flex gap={16} >
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
								onClick={() => { }}
							>
								Edit Profile
							</Button>
							<Button
								type='primary'
								danger
								icon={<LockOutlined />}
							>
								Restrict Access
							</Button>
						</Flex>
					</Flex>
				</Card>
			</Flex>
		</Flex>
	);
};

export default StudentProfile;


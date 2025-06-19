import React from 'react';
import { useNavigate } from 'react-router';

import {
	Card,
	Flex,
	Avatar,
	Typography,
	Button,
	Menu,
	Empty
} from 'antd';

import {
	HomeOutlined,
	NotificationOutlined,
	LeftOutlined,
	RightOutlined,
	LogoutOutlined,
	SmileOutlined,
	ToolOutlined,
	RobotOutlined
} from '@ant-design/icons';

import { MobileContext } from '../main';

import remToPx from '../utils/remToPx';

const { Text, Title, Link, Paragraph } = Typography;

const Menubar = ({ Title, Actions, children }) => {
	const navigate = useNavigate();
	const { mobile, setMobile } = React.useContext(MobileContext);

	const [minimized, setMinimized] = React.useState(true);

	const [staff, setStaff] = React.useState({
		name: '',
		role: '',
		profilePicture: ''
	});

	React.useEffect(() => {
		fetch('https://randomuser.me/api/?results=1&inc=name,%20picture')
			.then(response => response.json())
			.then(data => {
				const user = data.results[0];
				setStaff({
					name: `${user.name.first} ${user.name.last}`,
					role: 'Head',
					profilePicture: user.picture.large
				});
			})
			.catch(error => {
				console.error('Error fetching staff data:', error);
			});
	}, []);

	const menuItems = [
		{
			key: 'home',
			label: 'Home',
			icon: <HomeOutlined />
		},
		{
			key: 'notifications',
			label: 'Notifications',
			icon: <NotificationOutlined />
		},
		{
			key: 'students',
			label: 'Students',
			icon: <SmileOutlined />,
			children: [
				{
					key: 'profiles',
					label: 'Profiles'
				},
				{
					key: 'disciplinary',
					label: 'Disciplinary Records'
				},
				{
					key: 'organization',
					label: 'Organizations'
				}
			]
		},
		{
			key: 'utilities',
			label: 'Utilities',
			icon: <ToolOutlined />,
			children: [
				{
					key: 'calendar',
					label: 'Event Calendar'
				},
				{
					key: 'faqs',
					label: 'FAQs'
				},
				{
					key: 'announcements',
					label: 'Announcements'
				},
				{
					key: 'repository',
					label: 'Repository'
				}
			]
		},
		{
			key: 'helpbot',
			label: 'Helpbot',
			icon: <RobotOutlined />
		}
	];

	return (
		<Flex
			className='page-container'
		>
			{/*************************** Sidebar ***************************/}
			<Flex
				vertical
				justify='space-between'
				align='center'
				style={{
					width: minimized ? '' : 'calc(var(--space-XL) * 20)'
				}}
			>
				<Card
					size='small'
					style={{
						position: 'relative',
						width: '100%',
						height: '100%',
						padding: 0,
						borderRadius: 0
					}}
				>
					<Flex
						vertical
						justify='space-between'
						align='center'
						gap='large'
						style={{ width: '100%', height: '100%' }}
					>
						<Button
							type='primary'
							icon={minimized ? <RightOutlined /> : <LeftOutlined />}
							onClick={() => setMinimized(!minimized)}
							size={minimized ? 'default' : 'large'}
							style=
							{
								minimized ? {
									position: 'unset',
									width: '100%'
								} : {
									position: 'absolute',
										right: 'calc((var(--space-XL) * -1) / 2)',
									zIndex: 1
								}
							}
						/>

						<Flex
							vertical
							justify='center'
							align='center'
							gap='small'
							style={{ width: '100%', height: '100%' }}
						>
							{
								minimized ? (
									<Avatar
										src={staff.profilePicture}
										shape='square'
										size='large'
									/>
								) : (
									<Flex
										align='center'
										gap='small'
										style={{ width: '100%' }}
									>
										<Avatar
											src={staff.profilePicture}
											shape='square'
											size='large'
										/>
										<Flex vertical>
											<Text strong style={{ marginLeft: '8px' }}>{staff.name}</Text>
											<Text type='secondary' style={{ marginLeft: '8px' }}>{staff.role}</Text>
										</Flex>
									</Flex>
								)
							}
							<Menu
								defaultSelectedKeys={['home']}
								inlineCollapsed={minimized}
								style={{ position: 'relative', height: '100%', padding: 0, border: 'none' }}
								items={menuItems}
								mode='inline'
							/>
						</Flex>

						<Button
							type='primary'
							icon={<LogoutOutlined />}
							style={{ width: '100%' }}
							onClick={() => {
								navigate('/');
							}}
						>
							{minimized ? '' : 'Sign Out'}
						</Button>
					</Flex>
				</Card>
			</Flex>

			<Flex
				vertical
				justify='start'
				align='stretch'
				style={{
					width: '100%',
					height: '100%',
					backgroundColor: 'var(--ant-color-bg-layout)'
				}}
			>
				{/*************************** Header ***************************/}
				<Card
					size='small'
					style={{
						width: '100%',
						borderRadius: 0,
						backgroundColor: 'var(--ant-color-bg-base)'
					}}
				>
					<Flex
						justify='space-between'
						align='stretch'
						gap='large'
						style={{ width: '100%', height: '100%' }}
					>
						{Title}

						{Actions}
					</Flex>
				</Card>

				<Card
					size='small'
					style={{
						width: '100%',
						height: '100%',
						borderRadius: 0,
						backgroundColor: 'var(--ant-color-bg-layout)'
					}}
				>
					{children ? (
						children
					) : (
						<Flex
							vertical
							justify='center'
							align='center'
							style={{ width: '100%', height: '100%' }}
						>
							<Empty
								image={Empty.PRESENTED_IMAGE_DEFAULT}
								description={
									<Text type='secondary'>
										No content available.
									</Text>
								}
							/>
						</Flex>
					)}
				</Card>
			</Flex>
		</Flex>
	);
};

export default Menubar;
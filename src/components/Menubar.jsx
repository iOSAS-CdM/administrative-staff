import React from 'react';
import { useNavigate, Routes, Route, useLocation, useRoutes } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Card,
    Flex,
    Avatar,
    Typography,
    Button,
	Menu,
	Popover
} from 'antd';

import {
    HomeOutlined,
    NotificationOutlined,
    LeftOutlined,
    RightOutlined,
    LogoutOutlined,
    SmileOutlined,
    ToolOutlined,
	RobotOutlined,
	UserOutlined,
	MenuOutlined,
	SyncOutlined
} from '@ant-design/icons';

import { MobileContext, DisplayThemeContext, SyncSeedContext } from '../main';

import Home from '../pages/dashboard/Home';
import Profiles from '../pages/dashboard/Students/Profiles';
import Profile from '../pages/dashboard/Students/Profile';
import DisciplinaryRecords from '../pages/dashboard/Students/Records';
import DisciplinaryRecord from '../pages/dashboard/Students/Record';
import Organizations from '../pages/dashboard/Students/Organizations';
import Organization from '../pages/dashboard/Students/Organization';
import CalendarPage from '../pages/dashboard/Utilities/Calendar';

import remToPx from '../utils/remToPx';

const { Text, Title } = Typography;

import '../styles/pages/Dashboard.css';

const Menubar = () => {
    const navigate = useNavigate();
	const location = useLocation();
	const [selectedKeys, setSelectedKeys] = React.useState(['home']);

	const { mobile, setMobile } = React.useContext(MobileContext);
	const { displayTheme, setDisplayTheme } = React.useContext(DisplayThemeContext);
	const { seed, setSeed } = React.useContext(SyncSeedContext);

    const [staff, setStaff] = React.useState({
        name: {
            first: '',
            middle: '',
            last: ''
        },
        role: '',
        profilePicture: ''
    });

    const [Header, setHeader] = React.useState({
		title: 'Dashboard',
		actions: []
    });

    // Fetch staff data on component mount
    React.useEffect(() => {
        fetch('https://randomuser.me/api/?results=1&inc=name,%20picture')
            .then(response => response.json())
            .then(data => {
                const user = data.results[0];
                setStaff({
                    name: {
                        first: user.name.first,
                        middle: user.name.middle || '',
                        last: user.name.last
                    },
                    role: 'Head',
                    profilePicture: user.picture.large
                });
            })
            .catch(error => {
                console.error('Error fetching staff data:', error);
            });
    }, []);

	const props = {
		setHeader,
		setSelectedKeys,
		mobile,
		staff,
		setMobile,
		displayTheme,
		setDisplayTheme,
		navigate
	};

	const routes = useRoutes([
		{ path: '/', element: <Home {...props} /> },
		{ path: '/home', element: <Home {...props} /> },
		{ path: '/notifications', element: <p>Notifications</p> },
		{ path: '/students/profiles', element: <Profiles {...props} /> },
		{ path: '/students/profiles/*', element: <Profile {...props} /> },
		{ path: '/students/records', element: <DisciplinaryRecords {...props} /> },
		{ path: '/students/records/*', element: <DisciplinaryRecord {...props} /> },
		{ path: '/students/organizations', element: <Organizations {...props} /> },
		{ path: '/students/organizations/*', element: <Organization {...props} /> },
		{ path: '/utilities/calendar', element: <CalendarPage {...props} /> },
		{ path: '/utilities/faqs', element: <p>FAQs</p> },
		{ path: '/utilities/announcements', element: <p>Announcements</p> },
		{ path: '/utilities/repository', element: <p>Repository</p> },
		{ path: '/helpbot', element: <p>Helpbot</p> }
	]);

    const [minimized, setMinimized] = React.useState(false);

	// Reference to store timeout ID
	const timeoutRef = React.useRef(null);

	const handleMouseEnter = () => {
		if (minimized) {
			timeoutRef.current = setTimeout(() => {
				setMinimized(false);
			}, remToPx(100));
		};
	};
	const handleMouseLeave = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		};
	};

	React.useEffect(() => {
		return () => {
			if (timeoutRef.current)
				clearTimeout(timeoutRef.current);
		};
	}, []);

    const menuItems = [
		{
			key: 'staff',
			label: (
				<Flex vertical>
					<Title level={5} style={{ color: minimized && 'var(--ant-color-bg-base)' }}>{staff.name.first} {staff.name.middle} {staff.name.last}</Title>
					<Text type='secondary' style={{ color: minimized && 'var(--ant-color-bg-base)' }}>{staff.role}</Text>
				</Flex>
			),
			icon: (
				minimized ?
					<UserOutlined /> :
					<Avatar
						src={staff.profilePicture}
						shape='square'
						size={minimized ? 'small' : 'large'}
						className='anticon ant-menu-item-icon'
					/>
			),
			onClick: () => { }
		},
		{
			key: 'divider',
			type: 'divider'
		},
		{
            key: 'home',
            label: 'Home',
            icon: <HomeOutlined />,
            onClick: () => navigate('/dashboard/home')
        },
        {
            key: 'notifications',
            label: 'Notifications',
            icon: <NotificationOutlined />,
            onClick: () => navigate('/dashboard/notifications')
        },
        {
            key: 'students',
            label: 'Students',
            icon: <SmileOutlined />,
            children: [
                {
                    key: 'profiles',
                    label: 'Profiles',
                    onClick: () => navigate('/dashboard/students/profiles')
                },
                {
                    key: 'records',
                    label: 'Disciplinary Records',
                    onClick: () => navigate('/dashboard/students/records')
                },
                {
                    key: 'organizations',
                    label: 'Organizations',
                    onClick: () => navigate('/dashboard/students/organizations')
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
                    label: 'Event Calendar',
                    onClick: () => navigate('/dashboard/utilities/calendar')
                },
                {
                    key: 'faqs',
                    label: 'FAQs',
                    onClick: () => navigate('/dashboard/utilities/faqs')
                },
                {
                    key: 'announcements',
                    label: 'Announcements',
                    onClick: () => navigate('/dashboard/utilities/announcements')
                },
                {
                    key: 'repository',
                    label: 'Repository',
                    onClick: () => navigate('/dashboard/utilities/repository')
                }
            ]
        },
        {
            key: 'helpbot',
            label: 'Helpbot',
            icon: <RobotOutlined />,
            onClick: () => navigate('/dashboard/helpbot')
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
				align='flex-start'
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
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
                >
                    <Flex
                        vertical
                        justify='space-between'
						align='center'
						style={{ width: '100%', height: '100%' }}
					>
						<div
							id='sidebar-toggle'
							style={{
								position: 'relative',
								width: '100%',
								height: minimized ? (() => {
									const button = document.querySelector('.ant-btn');
									if (button)
										return button.offsetHeight + 'px';
								})() : '0px',
								transition: 'height var(--transition)',
							}}
						>
							<Button
								type={minimized ? 'default' : 'primary'}
								icon={minimized ? <RightOutlined /> : <LeftOutlined />}
								onClick={() => setMinimized(!minimized)}
								size={minimized ? 'default' : 'large'}
								style={{
									position: 'absolute',
									top: 0,
									left: minimized ? '50%' : 'calc(100% - var(--space-XL))',
									transform: minimized ? 'translateX(-50%)' : 'none',
									transition: 'left var(--transition), transform var(--transition)',
									zIndex: 1000
								}}
							/>
						</div>
                        <Flex
                            vertical
                            justify='center'
                            align='center'
							gap={16}
                            style={{ width: '100%', height: '100%' }}
						>
                            <Menu
                                selectedKeys={selectedKeys}
                                inlineCollapsed={minimized}
								style={{
									position: 'relative',
									height: '100%',
									padding: 0,
									border: 'none'
								}}
                                items={menuItems}
                                mode='inline'
                            />
                        </Flex>

                        <Button
                            type='primary'
							icon={<LogoutOutlined />}
                            onClick={() => {
                                navigate('/');
                            }}
							style={{ width: '100%' }}
                        >
                            {minimized ? '' : 'Sign Out'}
                        </Button>
                    </Flex>
                </Card>
            </Flex>

            {/*************************** Main Content Area ***************************/}
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
						gap={mobile ? 16 : 32}
                        style={{ width: '100%', height: '100%' }}
					>
						<Title level={4}>{Header.title}</Title>
						{!mobile ? (
							<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
								<Button
									type='default'
									icon={<SyncOutlined />}
									onClick={() => {
										setSeed(prev => prev + 1);
									}}
								/>
								{Header.actions && Header.actions.map((action, index) => (
									{
										...action,
										key: index
									}
								))}
							</Flex>
						) : (
								Header.actions && Header.actions.length > 2 ? (
									<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
										<Button
											type='default'
											icon={<SyncOutlined />}
											onClick={() => {
												setSeed(prev => prev + 1);
											}}
										/>
										<Popover
											trigger={['click']}
											placement='bottom'
											content={(menu) => (
												<Flex vertical justify='flex-start' gap={16} flex={1} align='stretch'>
													{Header.actions && Header.actions.map((action, index) => (
														{
															...action,
															key: index
														}
													))}
												</Flex>
											)}
										>
											<Button type='default' icon={<MenuOutlined />} />
										</Popover>
									</Flex>
							) : (
								<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
									<Button
										type='default'
										icon={<SyncOutlined />}
										onClick={() => {
											setSeed(prev => prev + 1);
										}}
									/>
									{Header.actions && Header.actions.map((action, index) => (
										{
											...action,
											key: index
										}
									))}
								</Flex>
							)
						)}
                    </Flex>
                </Card>

                {/*************************** Page Content ***************************/}
                <Card
					size='small'
					className='scrollable-content'
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 0,
                        backgroundColor: 'var(--ant-color-bg-layout)'
                    }}
                >
                    <AnimatePresence mode='wait'>
						<motion.div
							key={location.pathname}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
						>
							{routes}
						</motion.div>
					</AnimatePresence>
                </Card>
            </Flex>
        </Flex>
    );
};

export default Menubar;

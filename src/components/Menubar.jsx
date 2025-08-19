import React from 'react';
import { useNavigate, useLocation, useRoutes, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import {
	Card,
	Flex,
	Avatar,
	Typography,
	Button,
	Menu,
	Badge,
	Skeleton,
	Popover,
	Segmented
} from 'antd';

import {
	HomeOutlined,
	NotificationOutlined,
	DoubleLeftOutlined,
	DoubleRightOutlined,
	LogoutOutlined,
	SmileOutlined,
	ToolOutlined,
	RobotOutlined,
	UserOutlined,
	MenuOutlined,
	SyncOutlined,
	MoonOutlined,
	SunOutlined
} from '@ant-design/icons';

import { MobileContext, DisplayThemeContext, SyncSeedContext, LoadingStatesContext, OSASContext } from '../main';

import Home from '../pages/dashboard/Home';
import Profiles from '../pages/dashboard/Students/Profiles';
import Profile from '../pages/dashboard/Students/Profile';
import DisciplinaryRecords from '../pages/dashboard/Students/Records';
import DisciplinaryRecord from '../pages/dashboard/Students/Record';
import Organizations from '../pages/dashboard/Students/Organizations';
import Organization from '../pages/dashboard/Students/Organization';
import CalendarPage from '../pages/dashboard/Utilities/Calendar';

const { Text, Title } = Typography;

import '../styles/pages/Dashboard.css';

/**
 * @typedef {{
 * 	setHeader: React.Dispatch<React.SetStateAction<Header>>,
 * 	setSelectedKeys: React.Dispatch<React.SetStateAction<string[]>>,
 * 	mobile: boolean,
 * 	staff: Staff,
 * 	setMobile: React.Dispatch<React.SetStateAction<boolean>>,
 * 	displayTheme: 'light' | 'dark',
 * 	setDisplayTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>,
 * 	navigate: (path: string) => void
 * }} PageProps
 */

const ReloadButton = ({ setSeed }) => {
	const [shiftPressed, setShiftPressed] = React.useState(false);
	React.useEffect(() => {
		const handleKeyDown = (event) => {
			if (event.key === 'Shift' || event.key === 'Control')
				setShiftPressed(true);
		};
		const handleKeyUp = (event) => {
			if (event.key === 'Shift' || event.key === 'Control')
				setShiftPressed(false);
		};
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);
	return (
		<Badge color='blue' dot={shiftPressed}>
			<Button
				type='default'
				icon={<SyncOutlined />}
				onClick={() => {
					if (shiftPressed)
						location.reload();
					else
						setSeed(prev => prev + 1);
				}}
			/>
		</Badge>
	);
};

const Menubar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedKeys, setSelectedKeys] = React.useState(['home']);

	const { mobile, setMobile } = React.useContext(MobileContext);
	const { displayTheme, setDisplayTheme } = React.useContext(DisplayThemeContext);
	const { seed, setSeed } = React.useContext(SyncSeedContext);
	const { loadingStates } = React.useContext(LoadingStatesContext);
	const { osas } = React.useContext(OSASContext);

	const [staff, setStaff] = React.useState({
		name: {
			first: '',
			middle: '',
			last: ''
		},
		role: '',
		profilePicture: ''
	});
	React.useEffect(() => {
		setStaff({
			name: {
				first: osas.staff.name.first,
				middle: osas.staff.name.middle,
				last: osas.staff.name.last
			},
			role: osas.staff.role,
			profilePicture: osas.staff.profilePicture || '/Placeholder Image.svg'
		});
	}, [osas.staff]);

	const [Header, setHeader] = React.useState({
		title: 'Dashboard',
		actions: []
	});

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
		{ path: '/*', element: <Navigate to='/dashboard/home' replace /> },
		{ path: '/home', element: <Home {...props} /> },
		{ path: '/notifications', element: <p>Notifications</p> },

		{
			path: '/students/profiles/*',
			element: <Profiles {...props} />,
			children: [
				{ path: 'active', element: <Profiles {...props} /> },
				{ path: 'ics', element: <Profiles {...props} /> },
				{ path: 'ite', element: <Profiles {...props} /> },
				{ path: 'ibe', element: <Profiles {...props} /> },
				{ path: 'restricted', element: <Profiles {...props} /> },
				{ path: 'archived', element: <Profiles {...props} /> }
			]
		},
		{ path: '/students/profile/*', element: <Profile {...props} /> },

		{
			path: '/students/records/*',
			element: <DisciplinaryRecords {...props} />,
			children: [
				{ path: 'active', element: <DisciplinaryRecords {...props} /> },
				{ path: 'ongoing', element: <DisciplinaryRecords {...props} /> },
				{ path: 'resolved', element: <DisciplinaryRecords {...props} /> },
				{ path: 'archived', element: <DisciplinaryRecords {...props} /> }
			]
		},
		{ path: '/students/record/*', element: <DisciplinaryRecord {...props} /> },

		{
			path: '/students/organizations/*',
			element: <Organizations {...props} />,
			children: [
				{ path: 'active', element: <DisciplinaryRecord {...props} /> },
				{ path: 'college-wide', element: <DisciplinaryRecord {...props} /> },
				{ path: 'institute-wide', element: <DisciplinaryRecord {...props} /> },
				{ path: 'restricted', element: <DisciplinaryRecord {...props} /> },
				{ path: 'archived', element: <DisciplinaryRecord {...props} /> }
			]
		},
		{ path: '/students/organization/*', element: <Organization {...props} /> },

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
			}, 1024); // 2^10
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

	/**
	 * @type {import('antd').MenuProps['items']}
	 */
	const menuItems = [
		{
			key: 'staff',
			label: (
				<Flex justify='space-between' align='center' style={{ width: '100%' }}>
					<div style={{ flez: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
						{loadingStates.staff ? (
							<Flex vertical>
								<Title level={5} style={{ color: 'currentColor' }}>{staff.name.first} {staff.name.middle} {staff.name.last}</Title>
								<Text type='secondary' style={{ color: 'currentColor' }}>{staff.role}</Text>
							</Flex>
						) : (
							<Skeleton.Node
								active
								shape='square'
									style={{ width: '100%' }}
							/>
						)}
					</div>

					{!minimized && (
						<div style={{ width: 32 }}>
							<Button
								type='default'
								icon={minimized ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
								onClick={() => setMinimized(!minimized)}
								style={{ minWidth: '128x !important', height: 32 }}
							/>
						</div>
					)}
				</Flex>
			),
			icon: (
				minimized ?
					<UserOutlined /> :
					loadingStates.staff ? (
						<Avatar
							src={staff.profilePicture}
							shape='square'
							size={minimized ? 'small' : 'large'}
							className='anticon ant-menu-item-icon'
						/>
					) : (
						<Skeleton.Avatar
							active
							shape='square'
							size={minimized ? 'small' : 'large'}
							className='anticon ant-menu-item-icon'
						/>
					)
			),
			onClick: () => { }
		},
		{
			key: 'divider',
			type: 'divider',
			style: {
				margin: '16px 0'
			}
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
					label: 'Calendar',
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
						{minimized && (
							<Button
								type='default'
								icon={minimized ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
								onClick={() => setMinimized(!minimized)}
							/>
						)}
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
									width: minimized ? 64 : 256,
									padding: 0,
									border: 'none'
								}}
								items={menuItems}
								mode='inline'
							/>
						</Flex>

						<Flex gap={16} align='center' style={{ width: '100%' }}>
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

							{!minimized && (
								<Segmented
									options={[
										{ value: 'light', icon: <SunOutlined /> },
										{ value: 'dark', icon: <MoonOutlined /> }
									]}
									value={displayTheme}
									onChange={(value) => {
										localStorage.setItem('displayTheme', value);
										setDisplayTheme(value);
									}}
									size='small'
								/>
							)}
						</Flex>
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
						align='center'
						gap={mobile ? 16 : 32}
						style={{ width: '100%', height: '100%' }}
					>
						<Title level={4}>{Header.title}</Title>
						{!mobile ? (
							<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
								<ReloadButton setSeed={setSeed} />
								{Header.actions && Header.actions.map((action, index) =>
									React.cloneElement(action, { key: index })
								)}
							</Flex>
						) : (
							Header.actions && Header.actions.length > 1 ? (
								<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
									<ReloadButton setSeed={setSeed} />
									<Popover
										trigger={['click']}
										placement='bottom'
										content={(menu) => (
											<Flex vertical justify='flex-start' gap={16} flex={1} align='stretch'>
												{Header.actions && Header.actions.map((action, index) =>
													React.cloneElement(action, { key: index })
												)}
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
				<div
					className='scrollable-content'
					style={{
						width: '100%',
						height: '100%',
						padding: 16
					}}
				>
					<AnimatePresence mode='wait'>
						<motion.div
							key={location.pathname}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							style={{ width: '100%', minHeight: '100%' }}
						>
							{routes}
						</motion.div>
					</AnimatePresence>
				</div>
			</Flex>
		</Flex>
	);
};

export default Menubar;

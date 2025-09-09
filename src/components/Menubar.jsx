import React from 'react';
import { useNavigate, useLocation, useRoutes, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../utils/supabase';

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
	Segmented,
	App
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
	SunOutlined,
	SolutionOutlined
} from '@ant-design/icons';

import { MobileContext, DisplayThemeContext, API_Route } from '../main';

// import Home from '../pages/dashboard/Home';
// import Profiles from '../pages/dashboard/Students/Profiles';
// import Profile from '../pages/dashboard/Students/Profile';
// import DisciplinaryRecords from '../pages/dashboard/Discipline/Records';
// import DisciplinaryRecord from '../pages/dashboard/Discipline/Record';
// import Organizations from '../pages/dashboard/Students/Organizations';
// import Organization from '../pages/dashboard/Students/Organization';
// import CalendarPage from '../pages/dashboard/Utilities/Calendar';
// import FAQsPage from '../pages/dashboard/Utilities/FAQs';
// import Announcements from '../pages/dashboard/Utilities/Announements';
// import NewAnnouncement from '../pages/dashboard/Utilities/NewAnnouncement';
// import Repository from '../pages/dashboard/Utilities/Repository';
// import Helpbot from '../pages/dashboard/Utilities/Helpbot';

const { Text, Title } = Typography;

import '../styles/pages/Dashboard.css';

import { useCache } from '../contexts/CacheContext';
import authFetch from '../utils/authFetch';

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
				}}
			/>
		</Badge>
	);
};

const Menubar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedKeys, setSelectedKeys] = React.useState(['home']);
	const { cache, updateCache } = useCache();

	const { mobile, setMobile } = React.useContext(MobileContext);
	const { displayTheme, setDisplayTheme } = React.useContext(DisplayThemeContext);

	const { notification } = App.useApp();

	React.useLayoutEffect(() => {
		if (cache.staff?.id) return;
		const controller = new AbortController();
		const getStaff = async () => {
			const request = await authFetch(`${API_Route}/auth/me`, { signal: controller.signal });
			if (!request.ok) {
				notification.error({
					message: 'Error',
					description: 'Failed to fetch user data. Please sign in again.',
					duration: 5
				});
				supabase.auth.signOut()
					.then(() => {
						window.location.href = '/authentication';
					})
					.catch((error) => {
						console.error('Sign Out Error:', error);
					});
				return;
			};
			/** @type {import('../classes/Staff').StaffProps} */
			const staff = await request.json();
			if (!staff || !staff.id) {
				notification.error({
					message: 'Error',
					description: 'Failed to fetch user data. Please sign in again.',
					duration: 5
				});
				supabase.auth.signOut()
					.then(() => {
						window.location.href = '/authentication';
					})
					.catch((error) => {
						console.error('Sign Out Error:', error);
					});
				return;
			};
			if (!['head', 'guidance', 'prefect', 'student-affairs'].includes(staff.role)) {
				supabase.auth.signOut()
					.then(() => {
						window.location.href = '/unauthorized';
					})
					.catch((error) => {
						console.error('Sign Out Error:', error);
					});
			};
			updateCache('staff', staff);
		};
		getStaff();

		return () => {
			controller.abort();
		};
	}, [cache.staff]);

	const [Header, setHeader] = React.useState({
		title: 'Dashboard',
		actions: []
	});

	const props = {
		setHeader,
		setSelectedKeys,
		mobile,
		staff: cache.staff,
		setMobile,
		displayTheme,
		setDisplayTheme,
		navigate
	};

	const routes = useRoutes([
		// { path: '/*', element: <Navigate to='/dashboard/home' replace /> },
		{ path: '/', element: <p>Dashboard</p> },
		// { path: '/home', element: <Home {...props} /> },
		// { path: '/notifications', element: <p>Notifications</p> },

		// {
		// 	path: '/students/profiles/*',
		// 	element: <Profiles {...props} />,
		// 	children: [
		// 		{ path: 'active', element: <Profiles {...props} /> },
		// 		{ path: 'ics', element: <Profiles {...props} /> },
		// 		{ path: 'ite', element: <Profiles {...props} /> },
		// 		{ path: 'ibe', element: <Profiles {...props} /> },
		// 		{ path: 'restricted', element: <Profiles {...props} /> },
		// 		{ path: 'archived', element: <Profiles {...props} /> }
		// 	]
		// },
		// { path: '/students/profile/:id', element: <Profile {...props} /> },

		// { path: '/students/unverified/*', element: <p>Unverified</p> },

		// {
		// 	path: '/students/organizations/*',
		// 	element: <Organizations {...props} />,
		// 	children: [
		// 		{ path: 'active', element: <Organizations {...props} /> },
		// 		{ path: 'college-wide', element: <Organizations {...props} /> },
		// 		{ path: 'institute-wide', element: <Organizations {...props} /> },
		// 		{ path: 'restricted', element: <Organizations {...props} /> },
		// 		{ path: 'archived', element: <Organizations {...props} /> }
		// 	]
		// },
		// { path: '/students/organization/:id', element: <Organization {...props} /> },

		// {
		// 	path: '/discipline/records/*',
		// 	element: <DisciplinaryRecords {...props} />,
		// 	children: [
		// 		{ path: 'active', element: <DisciplinaryRecords {...props} /> },
		// 		{ path: 'ongoing', element: <DisciplinaryRecords {...props} /> },
		// 		{ path: 'resolved', element: <DisciplinaryRecords {...props} /> },
		// 		{ path: 'archived', element: <DisciplinaryRecords {...props} /> }
		// 	]
		// },
		// { path: '/discipline/record/:id', element: <DisciplinaryRecord {...props} /> },

		// { path: '/discipline/reports/*', element: <p>Reports</p> },

		// { path: '/utilities/calendar', element: <CalendarPage {...props} /> },
		// { path: '/utilities/faqs', element: <FAQsPage {...props} /> },

		// { path: '/utilities/announcements', element: <Announcements {...props} /> },
		// { path: '/utilities/announcements/new', element: <NewAnnouncement {...props} /> },

		// { path: '/utilities/repository', element: <Repository {...props} /> },
		// { path: '/helpbot', element: <Helpbot {...props} /> }
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
		...minimized ? [] : [
			{
				key: 'staff',
				label: (
					<Flex justify='space-between' align='center' style={{ width: '100%' }}>
						<div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
							{cache.staff ? (
								<Flex vertical>
									<Title level={5} style={{ color: 'currentColor' }}>{cache.staff?.name.first} {cache.staff?.name.last}</Title>
									<Text type='secondary' style={{ color: 'currentColor' }}>{cache.staff?.role}</Text>
								</Flex>
							) : (
								<Skeleton.Node
									active
									shape='square'
									style={{ width: '100%' }}
								/>
							)}
						</div>

						<div style={{ width: 32 }}>
							<Button
								type='default'
								icon={<DoubleLeftOutlined />}
								onClick={() => setMinimized(!minimized)}
								style={{ minWidth: '128px !important', height: 32 }}
							/>
						</div>
					</Flex>
				),
				icon: (
					cache.staff ? (
						<Avatar
							src={cache.staff?.profilePicture}
							shape='square'
							size='large'
							className='anticon ant-menu-item-icon'
						/>
					) : (
						<Skeleton.Avatar
							active
							shape='square'
								size='large'
							className='anticon ant-menu-item-icon'
						/>
					)
				),
				onClick: () => { },
				style: {
					height: 32
				}
			},
			{
				key: 'divider',
				type: 'divider',
				style: {
					margin: '16px 0'
				}
			}
		],
		{
			key: 'home',
			label: 'Home',
			icon: <HomeOutlined />,
			onClick: () => navigate('/dashboard/home', { replace: true })
		},
		{
			key: 'notifications',
			label: 'Notifications',
			icon: <NotificationOutlined />,
			onClick: () => navigate('/dashboard/notifications', { replace: true })
		},
		{
			key: 'students',
			label: 'Students',
			icon: <SmileOutlined />,
			children: [
				{
					key: 'profiles',
					label: 'Profiles',
					onClick: () => navigate('/dashboard/students/profiles/active', { replace: true })
				},
				{
					key: 'unverified',
					label: 'Unverified Profiles',
					onClick: () => navigate('/dashboard/students/unverified/active', { replace: true })
				},
				{
					key: 'organizations',
					label: 'Organizations',
					onClick: () => navigate('/dashboard/students/organizations/active', { replace: true })
				}
			]
		},
		{
			key: 'discipline',
			label: 'Discipline',
			icon: <SolutionOutlined />,
			children: [
				{
					key: 'records',
					label: 'Records',
					onClick: () => navigate('/dashboard/discipline/records/ongoing', { replace: true })
				},
				{
					key: 'reports',
					label: 'Reports',
					onClick: () => navigate('/dashboard/discipline/reports', { replace: true })
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
					onClick: () => navigate('/dashboard/utilities/calendar', { replace: true })
				},
				{
					key: 'faqs',
					label: 'FAQs',
					onClick: () => navigate('/dashboard/utilities/faqs', { replace: true })
				},
				{
					key: 'announcements',
					label: 'Announcements',
					onClick: () => navigate('/dashboard/utilities/announcements', { replace: true })
				},
				{
					key: 'repository',
					label: 'Repository',
					onClick: () => navigate('/dashboard/utilities/repository', { replace: true })
				}
			]
		},
		{
			key: 'helpbot',
			label: 'Helpbot',
			icon: <RobotOutlined />,
			onClick: () => navigate('/dashboard/helpbot', { replace: true })
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
					className='scrollable-content'
				>
					<Flex
						vertical
						justify='space-between'
						align='center'
						style={{ width: '100%', minHeight: '100%' }}
					>
						{minimized && (
							<Flex
								vertical
								justify='center'
								align='center'
								gap={16}
								style={{ width: '100%' }}
							>
								<Button
									type='default'
									icon={minimized ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
									onClick={() => setMinimized(!minimized)}
								/>
								{cache.staff ? (
									<Avatar
										src={cache.staff?.profilePicture}
										shape='square'
										size='small'
										className='anticon ant-menu-item-icon'
									/>
								) : (
									<Skeleton.Avatar
										active
										shape='square'
										size='small'
										className='anticon ant-menu-item-icon'
									/>
								)}
							</Flex>
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
									width: minimized ? 64 : 256 + (128 / 2),
									padding: 0,
									border: 'none'
								}}
								items={menuItems}
								mode='inline'
							/>
						</Flex>

						<Flex gap={16} vertical align='center' style={{ width: '100%' }}>
							<Segmented
								vertical={minimized}
								options={[
									{ value: 'light', icon: <SunOutlined /> },
									{ value: 'dark', icon: <MoonOutlined /> }
								]}
								value={displayTheme}
								onChange={(value) => {
									localStorage.setItem('displayTheme', value);
									setDisplayTheme(value);
								}}
							/>
							<Button
								type='primary'
								icon={<LogoutOutlined />}
								onClick={() => {
									supabase.auth.signOut()
										.then(() => {
											window.location.href = '/authentication';
										})
										.catch((error) => {
											console.error('Sign Out Error:', error);
										});
								}}
								style={{ width: '100%' }}
							>
								{minimized ? '' : 'Sign Out'}
							</Button>
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
				<div
					style={{
						width: '100%',
						padding: 16,
						backgroundColor: 'var(--ant-color-bg-base)',
						borderBottom: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
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
								<ReloadButton setSeed={null} />
								{Header.actions && Header.actions.map((action, index) =>
									React.cloneElement(action, { key: index })
								)}
							</Flex>
						) : (
							Header.actions && Header.actions.length > 1 ? (
								<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
										<ReloadButton setSeed={null} />
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
												onClick={() => { }}
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
				</div>

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

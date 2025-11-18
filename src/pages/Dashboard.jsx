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
	Popover,
	Spin,
	App
} from 'antd';

import {
	HomeOutlined,
	DoubleLeftOutlined,
	DoubleRightOutlined,
	LogoutOutlined,
	SmileOutlined,
	ToolOutlined,
	RobotOutlined,
	MenuOutlined,
	MoonOutlined,
	SunOutlined,
	SolutionOutlined,
	ReloadOutlined,
	UserOutlined,
	FileTextOutlined
} from '@ant-design/icons';

import { DisplayThemeContext, API_Route } from '../main';
import { useMobile } from '../contexts/MobileContext';
import { RefreshProvider, useRefresh } from '../contexts/RefreshContext';
import { PagePropsProvider } from '../contexts/PagePropsContext';
import { WebSocketProvider } from '../contexts/WebSocketContext';

import Home from './dashboard/Home';
import Verified from './dashboard/Students/Verified';
import Profile from './dashboard/Students/Profile';
import Unverified from './dashboard/Students/Unverified';
import DisciplinaryRecords from './dashboard/Discipline/Records';
import DisciplinaryRecord from './dashboard/Discipline/Record';
import Reports from './dashboard/Discipline/Reports';
import Organizations from './dashboard/Students/Organizations';
import Organization from './dashboard/Students/Organization';
import CalendarPage from './dashboard/Utilities/Calendar';
import FAQsPage from './dashboard/Utilities/FAQs';
import Announcements from './dashboard/Utilities/Announcement';
import NewAnnouncement from './dashboard/Utilities/announcements/New';
import ViewAnnouncement from './dashboard/Utilities/announcements/View';
import Repository from './dashboard/Utilities/Repository';
import Requests from './dashboard/Utilities/Requests';
import AmBot from './dashboard/AmBot';
import StaffProfile from './dashboard/StaffProfile';

const { Text, Title } = Typography;

import { useCache } from '../contexts/CacheContext';
import authFetch from '../utils/authFetch';

/**
 * @type {React.FC<>}
 */
const Dashboard = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [selectedKeys, setSelectedKeys] = React.useState(['home']);
	const { cache, updateCache, pushToCache } = useCache();
	const { refresh, setRefresh } = useRefresh();

	const isMobile = useMobile();
	const { displayTheme, setDisplayTheme } = React.useContext(DisplayThemeContext);

	const { notification } = App.useApp();

	React.useLayoutEffect(() => {
		if (cache?.staff?.id) return;
		const controller = new AbortController();
		const getStaff = async () => {
			const request = await authFetch(`${API_Route}/auth/me`, { signal: controller.signal });
			if (!request?.ok) return;

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
			pushToCache('peers', staff, true);
		};
		getStaff();

		return () => controller.abort();
	}, [cache?.staff, refresh]);

	const [Header, setHeader] = React.useState({
		title: 'Dashboard',
		actions: []
	});

	const pageProps = {
		setHeader,
		setSelectedKeys,
		staff: cache?.staff,
		displayTheme,
		setDisplayTheme
	};

	const routes = useRoutes([
		{ path: '/*', element: <Navigate to='/dashboard/home' replace /> },
		{ path: '/', element: <Navigate to='/dashboard/home' replace /> },
		{ path: '/home', element: <Home /> },
		{ path: '/profile', element: <StaffProfile /> },

		{ path: '/students/verified/*', element: <Verified /> },
		{ path: '/students/unverified/*', element: <Unverified /> },
		{ path: '/students/profile/:id', element: <Profile /> },

		{
			path: '/students/organizations/*',
			element: <Organizations />,
			children: [
				{ path: 'active', element: <Organizations /> },
				{ path: 'college-wide', element: <Organizations /> },
				{ path: 'institute-wide', element: <Organizations /> },
				{ path: 'restricted', element: <Organizations /> },
				{ path: 'dismissed', element: <Organizations /> }
			]
		},
		{ path: '/students/organization/:id', element: <Organization /> },

		{
			path: '/discipline/records',
			element: <DisciplinaryRecords />
		},
		{ path: '/discipline/record/:id', element: <DisciplinaryRecord /> },

		{ path: '/discipline/reports', element: <Reports /> },

		{ path: '/utilities/calendar', element: <CalendarPage /> },
		{ path: '/utilities/faqs', element: <FAQsPage /> },

		{ path: '/utilities/announcements', element: <Announcements /> },
		{ path: '/utilities/announcements/:id', element: <ViewAnnouncement /> },
		{ path: '/utilities/announcements/new', element: <NewAnnouncement /> },

		{ path: '/utilities/repository', element: <Repository /> },
		{ path: '/utilities/requests', element: <Requests /> },
		{ path: '/ambot', element: <AmBot /> }
	]);	const [minimized, setMinimized] = React.useState(false);

	/**
	 * @type {import('antd').MenuProps['items']}
	 */
	const menuItems = React.useMemo(() => [
	// Guidance:
	//  - Verified (View Only)
	//  - Unverified (View Only)
	//  - Records (View Only)
	//  - Calendar
	//  - Faqs
	//  - Announcements
	//  - Repositories
	//  - AmBot
	// Prefect of Discipline:
	//  - Verified (View Only)
	//  - Unverified (View Only)
	//  - Records
	//  - Reports
	//  - Calendar
	//  - Repositories
	//  - AmBot
	// Student Affairs
	//  - Verified
	//  - Unverified
	//  - Organizations
	//  - Records (View Only)
	//  - Reports (View Only)
	//  - Calendar
	//  - FAQs
	//  - Announcements
	//  - Repositories
	//  - AmBot
	// Head
	//  - All (Read and Write)

		...minimized ? [] : [
			{
				key: 'staff',
				label: (
					<Flex justify='space-between' align='center' style={{ width: '100%' }}>
						<div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
							<Flex vertical>
								<Title level={5} style={{ color: 'currentColor' }}>{cache?.staff?.name.first} {cache?.staff?.name.last}</Title>
								<Text type='secondary' style={{ color: 'currentColor' }}>{{
									'head': 'Head',
									'guidance': 'Guidance Officer',
									'prefect': 'Prefect of Discipline Officer',
									'student-affairs': 'Student Affairs Officer'
								}[cache?.staff?.role]}</Text>
							</Flex>
						</div>

						<div style={{ width: 32 }}>
							<Button
								type='default'
								icon={<DoubleLeftOutlined />}
								onClick={(e) => {
									e.stopPropagation();
									setMinimized(!minimized);
								}}
								style={{ minWidth: '128px !important', height: 32 }}
							/>
						</div>
					</Flex>
				),
				icon: (
					<Avatar
						src={cache?.staff?.profilePicture + `?random=${Math.random()}`}
						alt={cache?.staff?.name}
						fallback={<UserOutlined />}
						shape='square'
						size='small'
						style={{ width: 32, height: 32 }}
					/>
				),
				onClick: () => navigate('/dashboard/profile', { replace: true }),
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
			key: 'requests',
			label: 'Requests',
			icon: <FileTextOutlined />,
			onClick: () => navigate('/dashboard/utilities/requests', { replace: true })
		},
		{
			key: 'students',
			label: 'Students',
			icon: <SmileOutlined />,
			children: [
				{
					key: 'verified',
					label: 'Verified Students',
					onClick: () => navigate('/dashboard/students/verified/active', { replace: true })
				},
				{
					key: 'unverified',
					label: 'Unverified Students',
					onClick: () => navigate('/dashboard/students/unverified', { replace: true })
				},
				['head', 'student-affairs'].includes(cache?.staff?.role) ? {
					key: 'organizations',
					label: 'Organizations',
					onClick: () => navigate('/dashboard/students/organizations/active', { replace: true })
				} : null
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
					onClick: () => navigate('/dashboard/discipline/records', { replace: true })
				},
				cache?.staff && ['head', 'prefect'].includes(cache?.staff?.role) ? {
					key: 'reports',
					label: 'Reports',
					onClick: () => navigate('/dashboard/discipline/reports', { replace: true })
				} : null
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
				cache?.staff && ['head', 'student-affairs', 'guidance'].includes(cache?.staff?.role) ? {
					key: 'faqs',
					label: 'FAQs',
					onClick: () => navigate('/dashboard/utilities/faqs', { replace: true })
				} : null,
				cache?.staff && ['head', 'student-affairs', 'guidance'].includes(cache?.staff?.role) ? {
					key: 'announcements',
					label: 'Announcements',
					onClick: () => navigate('/dashboard/utilities/announcements', { replace: true })
				} : null,
				{
					key: 'repository',
					label: 'Public Forms',
					onClick: () => navigate('/dashboard/utilities/repository', { replace: true })
				}
			]
		},
		{
			key: 'ambot',
			label: 'AmBot',
			icon: <RobotOutlined />,
			onClick: () => navigate('/dashboard/ambot', { replace: true })
		}
	], [cache?.staff, minimized, refresh]);

	return (
		<Flex
			className='page-container'
		>
			{/*************************** Splash Screen ***************************/}
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100vw',
					height: '100vh',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 16,
					backgroundColor: 'var(--ant-color-bg-layout)',
					pointerEvents: cache?.staff?.id ? 'none' : 'all',
					opacity: cache?.staff?.id ? 0 : 1,
					transition: 'opacity 0.3s ease-in-out',
					zIndex: 1000
				}}
			>
				<svg width='232' height='232' viewBox='0 0 232 232' fill='transparent' xmlns='http://www.w3.org/2000/svg' style={{ width: 128, height: 128 }}>
					<path
						d='M193 129.667C193 94.3206 164.346 65.6669 129 65.6669C93.6538 65.6669 65 94.3206 65 129.667C65 165.013 93.6538 193.667 129 193.667C164.346 193.667 193 165.013 193 129.667Z'
						stroke='var(--ant-color-primary)' stroke-width='8' />
					<path d='M145 156.667C145 161.085 137.837 164.667 129 164.667C120.163 164.667 113 161.085 113 156.667'
						stroke='var(--ant-color-primary)' stroke-width='8' stroke-linecap='round' />
					<path
						d='M117 121.667C117 115.039 111.627 109.667 105 109.667C98.3726 109.667 93 115.039 93 121.667C93 128.294 98.3726 133.667 105 133.667C111.627 133.667 117 128.294 117 121.667Z'
						fill='var(--ant-color-primary)' stroke='var(--ant-color-primary)' stroke-width='8' />
					<path
						d='M41 97.6669C41 93.2486 37.4183 89.6669 33 89.6669C28.5817 89.6669 25 93.2486 25 97.6669C25 102.085 28.5817 105.667 33 105.667C37.4183 105.667 41 102.085 41 97.6669Z'
						fill='var(--ant-color-primary)' stroke='var(--ant-color-primary)' stroke-width='8' />
					<path
						d='M183 65.6669C183 64.5623 182.105 63.6669 181 63.6669C179.895 63.6669 179 64.5623 179 65.6669C179 66.7714 179.895 67.6669 181 67.6669C182.105 67.6669 183 66.7714 183 65.6669Z'
						fill='var(--ant-color-primary)' stroke='var(--ant-color-primary)' stroke-width='8' />
					<path
						d='M165.626 121.985C165 119.649 160.298 115.131 151.965 117.364C145.563 119.079 141.818 125.861 142.444 128.197'
						stroke='var(--ant-color-primary)' stroke-width='8' stroke-linecap='round' />
					<path fill-rule='evenodd' clip-rule='evenodd'
						d='M169 79.7039V51.0002L129 57.6669L89 51.0002V79.7039C99.9568 70.9206 113.865 65.6669 129 65.6669C144.135 65.6669 158.043 70.9206 169 79.7039Z'
						fill='var(--ant-color-primary)' />
					<path d='M65 43.0001L129 53.6668L193 43L129 27L65 43.0001Z' fill='var(--ant-color-primary)' />
					<path d='M181 43V65.6668' stroke='var(--ant-color-primary)' stroke-width='8' />
					<path d='M33 130V174' stroke='var(--ant-color-primary)' stroke-width='8' stroke-linecap='round' />
				</svg>
				<Spin />
			</div>

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
									style={{ width: '100%' }}
								/>
								{cache?.staff?.profilePicture ? (
									<Avatar
										src={cache?.staff?.profilePicture + `?random=${Math.random()}`}
										alt={cache?.staff?.name}
										fallback={<UserOutlined />}
										shape='square'
										size='small'
										style={{ width: 32, height: 32, cursor: 'pointer' }}
										onClick={() => navigate('/dashboard/profile', { replace: true })}
									/>
								) : (
									<Avatar
										icon={<UserOutlined />}
										shape='square'
										size='small'
										style={{ width: 32, height: 32, cursor: 'pointer' }}
										onClick={() => navigate('/dashboard/profile', { replace: true })}
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

						<Flex gap={16} vertical={minimized} align='center' style={{ width: '100%' }}>
							<Button
								type='primary'
								icon={displayTheme === 'light' ? <MoonOutlined /> : <SunOutlined />}
								onClick={() => {
									const newTheme = displayTheme === 'light' ? 'dark' : 'light';
									localStorage.setItem('displayTheme', newTheme);
									setDisplayTheme(newTheme);
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
						gap={isMobile ? 16 : 32}
						style={{ width: '100%', height: '100%' }}
					>
						<Title level={4}>{Header.title}</Title>
						{!isMobile ? (
							<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
								<Button
									type='default'
									icon={<ReloadOutlined />}
									onClick={() => {
										setRefresh({ timestamp: Date.now() });
									}}
								/>
								{Header.actions && Header.actions.map((action, index) =>
									React.cloneElement(action, { key: index })
								)}
							</Flex>
						) : (
							Header.actions && Header.actions.length > 1 ? (
								<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
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
					id='page-content'
					className='scrollable-content'
					style={{
						width: '100%',
						height: '100%',
						padding: 16
					}}
				>
					<PagePropsProvider value={pageProps}>
						<WebSocketProvider>
							<AnimatePresence mode='wait'>
								<motion.div
									key={location.pathname}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
									transition={{ duration: 0.2 }}
									style={{ width: '100%', minHeight: '100%' }}
								>
									{routes}
								</motion.div>
							</AnimatePresence>
						</WebSocketProvider>
					</PagePropsProvider>
				</div>
			</Flex>
		</Flex>
	);
};

const Entry = () => (
	<RefreshProvider>
		<Dashboard />
	</RefreshProvider>
);

export default Entry;

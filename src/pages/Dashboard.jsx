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
	MenuOutlined,
	MoonOutlined,
	SunOutlined,
	SolutionOutlined
} from '@ant-design/icons';

import { DisplayThemeContext, API_Route } from '../main';
import { useMobile } from '../contexts/MobileContext';
import { PagePropsProvider } from '../contexts/PagePropsContext';

import Home from './dashboard/Home';
import Verified from './dashboard/Students/Verified';
import Profile from './dashboard/Students/Profile';
import Unverified from './dashboard/Students/Unverified';
import DisciplinaryRecords from './dashboard/Discipline/Records';
import DisciplinaryRecord from './dashboard/Discipline/Record';
import Organizations from './dashboard/Students/Organizations';
import Organization from './dashboard/Students/Organization';
import CalendarPage from './dashboard/Utilities/Calendar';
import FAQsPage from './dashboard/Utilities/FAQs';
import Announcements from './dashboard/Utilities/Announements';
import NewAnnouncement from './dashboard/Utilities/NewAnnouncement';
import Repository from './dashboard/Utilities/Repository';
import AmBot from './dashboard/AmBot';

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
			// if (!['head', 'guidance', 'prefect', 'student-affairs'].includes(staff.role)) {
			// 	supabase.auth.signOut()
			// 		.then(() => {
			// 			window.location.href = '/unauthorized';
			// 		})
			// 		.catch((error) => {
			// 			console.error('Sign Out Error:', error);
			// 		});
			// };
			updateCache('staff', staff);
			pushToCache('peers', staff, true);
		};
		getStaff();

		return () => controller.abort();
	}, [cache?.staff]);

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
		{ path: '/notifications', element: <p>Notifications</p> },

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
			path: '/discipline/records/*',
			element: <DisciplinaryRecords />,
			children: [
				{ path: 'active', element: <DisciplinaryRecords /> },
				{ path: 'ongoing', element: <DisciplinaryRecords /> },
				{ path: 'resolved', element: <DisciplinaryRecords /> },
				{ path: 'dismissed', element: <DisciplinaryRecords /> }
			]
		},
		{ path: '/discipline/record/:id', element: <DisciplinaryRecord /> },

		{ path: '/discipline/reports/*', element: <p>Reports</p> },

		{ path: '/utilities/calendar', element: <CalendarPage /> },
		{ path: '/utilities/faqs', element: <FAQsPage /> },

		{ path: '/utilities/announcements', element: <Announcements /> },
		{ path: '/utilities/announcements/new', element: <NewAnnouncement /> },

		{ path: '/utilities/repository', element: <Repository /> },
		{ path: '/ambot', element: <AmBot /> }
	]);

	const [minimized, setMinimized] = React.useState(false);

	/**
	 * Helper function to check if a menu item should be visible based on staff role
	 * @param {string} itemKey - The key of the menu item
	 * @param {string} role - The staff role
	 * @returns {boolean} - Whether the item should be visible
	 */
	const isMenuItemVisible = (itemKey, role) => {
		// Head has access to everything
		if (role === 'head') return true;

		const roleAccess = {
			'guidance': ['home', 'notifications', 'verified', 'records', 'calendar', 'faqs', 'announcements', 'repository', 'ambot'],
			'prefect': ['home', 'notifications', 'records', 'reports', 'calendar', 'repository', 'ambot'],
			'student-affairs': ['home', 'notifications', 'verified', 'unverified', 'organizations', 'records', 'reports', 'calendar', 'faqs', 'announcements', 'repository', 'ambot']
		};

		return roleAccess[role]?.includes(itemKey) || false;
	};

	/**
	 * Helper function to check if a staff member has read-only access
	 * @param {string} itemKey - The key of the menu item
	 * @param {string} role - The staff role
	 * @returns {boolean} - Whether the access is read-only
	 */
	const isReadOnly = (itemKey, role) => {
		if (role === 'head') return false;
		if (role === 'guidance' && itemKey === 'records') return true;
		if (role === 'student-affairs' && (itemKey === 'records' || itemKey === 'reports')) return true;
		return false;
	};

	/**
	 * @type {import('antd').MenuProps['items']}
	 */
	const getMenuItems = () => {
		const role = cache?.staff?.role;
		if (!role) return [];

		const items = [
			...minimized ? [] : [
				{
					key: 'staff',
					label: (
						<Flex justify='space-between' align='center' style={{ width: '100%' }}>
							<div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
								{cache?.staff ? (
									<Flex vertical>
										<Title level={5} style={{ color: 'currentColor' }}>{cache?.staff?.name.first} {cache?.staff?.name.last}</Title>
										<Text type='secondary' style={{ color: 'currentColor' }}>{{
											'head': 'Head',
											'guidance': 'Guidance Officer',
											'prefect': 'Prefect of Discipline Officer',
											'student-affairs': 'Student Affairs Officer'
										}[cache?.staff?.role]}</Text>
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
						cache?.staff ? (
							<Avatar
								src={cache?.staff?.profilePicture}
								shape='square'
								size='small'
								style={{ width: 32, height: 32 }}
							/>
						) : (
							<Skeleton.Avatar
								active
								shape='square'
								size='small'
								style={{ width: 32, height: 32 }}
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
			}
		];

		// Students submenu
		const studentsChildren = [];
		if (isMenuItemVisible('verified', role)) {
			studentsChildren.push({
				key: 'verified',
				label: 'Verified',
				onClick: () => navigate('/dashboard/students/verified', { replace: true })
			});
		}
		if (isMenuItemVisible('unverified', role)) {
			studentsChildren.push({
				key: 'unverified',
				label: 'Unverified',
				onClick: () => navigate('/dashboard/students/unverified', { replace: true })
			});
		}
		if (isMenuItemVisible('organizations', role)) {
			studentsChildren.push({
				key: 'organizations',
				label: 'Organizations',
				onClick: () => navigate('/dashboard/students/organizations/active', { replace: true })
			});
		}

		if (studentsChildren.length > 0) {
			items.push({
				key: 'students',
				label: 'Students',
				icon: <SmileOutlined />,
				children: studentsChildren
			});
		}

		// Discipline submenu
		const disciplineChildren = [];
		if (isMenuItemVisible('records', role)) {
			disciplineChildren.push({
				key: 'records',
				label: isReadOnly('records', role) ? 'Records (View Only)' : 'Records',
				onClick: () => navigate('/dashboard/discipline/records/ongoing', { replace: true })
			});
		}
		if (isMenuItemVisible('reports', role)) {
			disciplineChildren.push({
				key: 'reports',
				label: isReadOnly('reports', role) ? 'Reports (View Only)' : 'Reports',
				onClick: () => navigate('/dashboard/discipline/reports', { replace: true })
			});
		}

		if (disciplineChildren.length > 0) {
			items.push({
				key: 'discipline',
				label: 'Discipline',
				icon: <SolutionOutlined />,
				children: disciplineChildren
			});
		}

		// Utilities submenu
		const utilitiesChildren = [];
		if (isMenuItemVisible('calendar', role)) {
			utilitiesChildren.push({
				key: 'calendar',
				label: 'Calendar',
				onClick: () => navigate('/dashboard/utilities/calendar', { replace: true })
			});
		}
		if (isMenuItemVisible('faqs', role)) {
			utilitiesChildren.push({
				key: 'faqs',
				label: 'FAQs',
				onClick: () => navigate('/dashboard/utilities/faqs', { replace: true })
			});
		}
		if (isMenuItemVisible('announcements', role)) {
			utilitiesChildren.push({
				key: 'announcements',
				label: 'Announcements',
				onClick: () => navigate('/dashboard/utilities/announcements', { replace: true })
			});
		}
		if (isMenuItemVisible('repository', role)) {
			utilitiesChildren.push({
				key: 'repository',
				label: 'Repository',
				onClick: () => navigate('/dashboard/utilities/repository', { replace: true })
			});
		}

		if (utilitiesChildren.length > 0) {
			items.push({
				key: 'utilities',
				label: 'Utilities',
				icon: <ToolOutlined />,
				children: utilitiesChildren
			});
		}

		// AmBot
		if (isMenuItemVisible('ambot', role)) {
			items.push({
				key: 'ambot',
				label: 'AmBot',
				icon: <RobotOutlined />,
				onClick: () => navigate('/dashboard/ambot', { replace: true })
			});
		}

		return items;
	};

	const menuItems = getMenuItems();

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
								{cache?.staff ? (
									<Avatar
										src={cache?.staff?.profilePicture}
										shape='square'
										size='small'
										style={{ width: 32, height: 32 }}
									/>
								) : (
									<Skeleton.Avatar
										active
										shape='square'
										size='small'
										style={{ width: 32, height: 32 }}
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
						gap={isMobile ? 16 : 32}
						style={{ width: '100%', height: '100%' }}
					>
						<Title level={4}>{Header.title}</Title>
						{!isMobile ? (
							<Flex justify='flex-end' gap={16} wrap={true} flex={1} align='center'>
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
					<AnimatePresence mode='wait'>
						<motion.div
							key={location.pathname}
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -20 }}
							transition={{ duration: 0.2 }}
							style={{ width: '100%', minHeight: '100%' }}
						>
							<PagePropsProvider value={pageProps}>
								{routes}
							</PagePropsProvider>
						</motion.div>
					</AnimatePresence>
				</div>
			</Flex>
		</Flex>
	);
};

export default Dashboard;

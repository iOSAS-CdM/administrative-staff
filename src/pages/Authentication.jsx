import React from 'react';
import { useNavigate, Routes, Route, useLocation, useRoutes } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import { getVersion } from '@tauri-apps/api/app';

import {
	Form,
	Card,
	Flex,
	Button,
	Divider,
	Input,
	Image,
	Typography
} from 'antd';

import { GoogleOutlined } from '@ant-design/icons';

import { MobileContext } from '../main';

const { Text, Title, Link } = Typography;

import SignIn from './authentication/SignIn';
import SignUp from './authentication/SignUp';
import ForgotPassword from './authentication/ForgotPassword';

import '../styles/pages/Authentication.css';

const Authentication = () => {
	const [version, setVersion] = React.useState('');

	const { mobile, setMobile } = React.useContext(MobileContext);

	const navigate = useNavigate();

	React.useEffect(() => {
		const fetchVersion = async () => {
			const appVersion = await getVersion();
			setVersion(appVersion);
		};

		fetchVersion();
	}, []);

	const routes = useRoutes([
		{ path: '/', element: <SignIn navigate={navigate} /> },
		{ path: '/sign-in', element: <SignIn navigate={navigate} /> },
		{ path: '/sign-up', element: <SignUp navigate={navigate} /> },
		{ path: '/forgot-password', element: <ForgotPassword navigate={navigate} /> }
	]);

	return (
		<>
			<div id='auth-background'></div>

			<Flex
				layout='vertical'
				justify='center'
				align='center'
				className={`page-container${mobile ? ' mobile' : ''}`}
				style={{
					minHeight: '100vh',
					height: '100%',
					padding: mobile && 'calc(var(--space-XL) * 2'
				}}
			>
				<Card className='authentication-card scrollable-content'>
					<Flex vertical justify='space-between' align='center' gap='large' style={{ height: '100%' }}>
						<Flex vertical justify='center' align='center' gap='large' style={{ height: '100%' }}>
							<Image
								src='/CdM-OSAS Banner.png'
								alt='Logo Colegio de Montalban'
								width='75%'
								preview={false}
							/>
							<Divider />

							<AnimatePresence mode='wait'>
								<motion.div
									key={location.pathname}
									initial={{ opacity: 0, x: 20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -20 }}
								>

									<Flex vertical justify='center' align='center' gap='large' style={{ height: '100%' }}>
										{routes}
									</Flex>
								</motion.div>
							</AnimatePresence>

							<Divider>or</Divider>
							<Button
								icon={<GoogleOutlined />}
							>
								Sign In with Google
							</Button>
						</Flex>
						<Text style={{ display: 'block', textAlign: 'center' }}>Copyright © Colegio de Montalban 2025.</Text>
					</Flex>
				</Card>
			</Flex>

			<Flex vertical id='version-info-panel' justify='center' align='flex-start'>
				<Text>
					Version {version}
				</Text>
				<Text>
					For support, contact us via <Link href='mailto:danieljohnbyns@gmail.com' style={{ color: 'var(--ant-color-bg-base)' }}>danieljohnbyns@gmail.com</Link>.
				</Text>
			</Flex>
		</>
	);
};

export default Authentication;
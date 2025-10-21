import React from 'react';
import { useNavigate, useRoutes } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../utils/supabase';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-shell';
import { start, cancel } from '@fabianlars/tauri-plugin-oauth';
import { isTauri } from '@tauri-apps/api/core';

import { getVersion } from '@tauri-apps/api/app';

import {
	Card,
	Flex,
	Button,
	Divider,
	Image,
	Typography
} from 'antd';

import { GoogleOutlined, LoadingOutlined } from '@ant-design/icons';

import { DisplayThemeContext } from '../main';
import { useMobile } from '../contexts/MobileContext';

const { Text, Title, Link } = Typography;

import SignIn from './authentication/SignIn';
import SignUp from './authentication/SignUp';
import ForgotPassword from './authentication/ForgotPassword';

import '../styles/pages/Authentication.css';

const Authentication = () => {
	const [version, setVersion] = React.useState('');

	const isMobile = useMobile();
	const { displayTheme, setDisplayTheme } = React.useContext(DisplayThemeContext);
	const [signingIn, setSigningIn] = React.useState(false);

	const navigate = useNavigate();

	React.useEffect(() => {
		const fetchVersion = async () => {
			const appVersion = await getVersion();
			setVersion(appVersion);
		};

		fetchVersion();
	}, []);

	const routes = useRoutes([
		{ path: '/', element: <SignIn /> },
		{ path: '/sign-in', element: <SignIn /> },
		{ path: '/sign-up', element: <SignUp /> },
		{ path: '/forgot-password', element: <ForgotPassword /> }
	]);

	const signInWithGoogle = React.useCallback(async () => {
		setSigningIn(true);
		if (isTauri()) {
		// Tauri desktop OAuth flow
			let port;

			const unlisten = await listen('oauth://url', (data) => {
				if (!data.payload) return;

				const url = new URL(data.payload);
				const code = new URLSearchParams(url.search).get('code');

				if (code) {
					supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
						if (error) {
							alert(error.message);
							console.error(error);
							return;
						};
						console.log(data);
						location.reload();

						unlisten();
						cancel(port)
							.catch((e) => console.error(`Error cancelling OAuth listener for port ${port}:`, e));
					});
				};
			});

			await start({
				ports: [8000, 8001, 8002, 8003, 8004],
				response: `<script>window.location.href = 'http://${window.location.hostname}:${window.location.port}/auth-return';</script>`,
			})
				.then(async (p) => {
					console.log(`OAuth listener started on port ${p}`);
					port = p;
				})
				.catch((e) => console.error('Error starting OAuth listener:', e));

			if (!port) return;

			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: `http://localhost:${port}`,
					skipBrowserRedirect: true
				}
			});
			console.log(data, error);

			if (data.url)
				open(data.url);
			else if (error)
				console.error('Error signing in with Google:', error.message);
		} else {
			// Web browser OAuth flow
			const { data, error } = await supabase.auth.signInWithOAuth({
				provider: 'google',
				options: {
					redirectTo: window.location.origin + '/auth-return',
				}
			});
			if (error) {
				alert(error.message);
				setSigningIn(false);
				return;
			}
			// Supabase will handle the redirect, so no further action needed
		};
	}, []);

	return (
		<>
			<div id='auth-background' className={displayTheme}>
				<svg width='560' height='960' viewBox='0 0 560 960' fill='transparent'>
					<path d='M200 120L160 80L240 80L200 120Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 120L320 80L400 80L360 120Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 120L0 80L80 80L40 120Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 600L160 560H240L200 600Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 600L320 560H400L360 600Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 600L0 560H80L40 600Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 360L160 320H240L200 360Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 360L320 320H400L360 360Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 360L0 320H80L40 360Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 840L160 800H240L200 840Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 840L320 800H400L360 840Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 840L0 800H80L40 840Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 240L240 200H320L280 240Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 240L400 200H480L440 240Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 240L80 200H160L120 240Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 720L240 680H320L280 720Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 720L400 680H480L440 720Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 720L80 680H160L120 720Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 480L240 440H320L280 480Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 480L400 440H480L440 480Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 480L80 440H160L120 480Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 960L240 920H320L280 960Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 960L400 920H480L440 960Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 960L80 920H160L120 960Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 40L160 0L240 4.03789e-06L200 40Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 40L320 0L400 4.03789e-06L360 40Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 40L0 0L80 4.03789e-06L40 40Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 520L160 480H240L200 520Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 520L320 480H400L360 520Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 520L0 480H80L40 520Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 280L160 240H240L200 280Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 280L320 240H400L360 280Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 280L0 240H80L40 280Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M200 760L160 720H240L200 760Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M360 760L320 720H400L360 760Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M40 760L0 720H80L40 760Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 160L240 120L320 120L280 160Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 160L400 120L480 120L440 160Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 160L80 120L160 120L120 160Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 640L240 600H320L280 640Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 640L400 600H480L440 640Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 640L80 600H160L120 640Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 400L240 360H320L280 400Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 400L400 360H480L440 400Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 400L80 360H160L120 400Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 880L240 840H320L280 880Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M440 880L400 840H480L440 880Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M120 880L80 840H160L120 880Z' opacity={0.5} fill='var(--ant-color-primary-text-active)' />
					<path d='M280 80L240 40L320 40L280 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 80L400 40L480 40L440 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 80L80 40L160 40L120 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 560L240 520H320L280 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 560L400 520H480L440 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 560L80 520H160L120 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 320L240 280H320L280 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 320L400 280H480L440 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 320L80 280H160L120 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 800L240 760H320L280 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M440 800L400 760H480L440 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 800L80 760H160L120 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 200L320 160H400L360 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 200L480 160H560L520 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 200L160 160H240L200 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 680L320 640H400L360 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 680L480 640H560L520 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 680L160 640H240L200 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 440L320 400H400L360 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 440L480 400H560L520 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 440L160 400H240L200 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 920L320 880H400L360 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M520 920L480 880H560L520 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 920L160 880H240L200 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 80L80 40L160 40L120 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 80L240 40L320 40L280 80Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 560L80 520H160L120 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 560L240 520H320L280 560Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 320L80 280H160L120 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 320L240 280H320L280 320Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M120 800L80 760H160L120 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M280 800L240 760H320L280 800Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 200L160 160H240L200 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 200L320 160H400L360 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 200L0 160H80L40 200Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 680L160 640H240L200 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 680L320 640H400L360 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 680L0 640H80L40 680Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 440L160 400H240L200 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 440L320 400H400L360 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 440L0 400H80L40 440Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M200 920L160 880H240L200 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M360 920L320 880H400L360 920Z' fill='var(--ant-color-primary-text-active)' />
					<path d='M40 920L0 880H80L40 920Z' fill='var(--ant-color-primary-text-active)' />
				</svg>
			</div>

			<Flex
				layout='vertical'
				justify='center'
				align='center'
				className={`page-container${isMobile ? ' mobile' : ''}`}
				style={{
					minHeight: '100vh',
					height: '100%',
					padding: 16
				}}
			>
				<Card className='authentication-card scrollable-content'>
					<Flex vertical justify='space-between' align='center' gap={32} style={{ height: '100%' }}>
						<Flex vertical justify='center' align='center' gap={32} style={{ height: '100%' }}>
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
									style={{ width: 256 }}
								>

									<Flex vertical justify='center' align='center' gap={32} style={{ height: '100%' }}>
										{routes}
									</Flex>
								</motion.div>
							</AnimatePresence>

							<Divider>or</Divider>
							<Button
								icon={signingIn ? <LoadingOutlined /> : <GoogleOutlined />}
								onClick={signInWithGoogle}
								loading={signingIn}
							>
								Sign In with Google
							</Button>
						</Flex>
						<Text style={{ display: 'block', textAlign: 'center' }}>Copyright © Colegio de Montalban 2025.</Text>
					</Flex>
				</Card>
			</Flex>

			<Flex vertical id='version-info-panel' className={`${displayTheme}${isMobile ? ' mobile' : ''}`} justify='center' align='flex-start'>
				<Text>
					Version {version}
				</Text>
				<Text>
					For support, contact us via <Link href='mailto:danieljohnbyns@gmail.com'>danieljohnbyns@gmail.com</Link>.
				</Text>
			</Flex>
		</>
	);
};

export default Authentication;
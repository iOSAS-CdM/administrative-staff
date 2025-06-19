import React from 'react';
import { useNavigate } from 'react-router';

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

import { LoginOutlined, GoogleOutlined, LoadingOutlined } from '@ant-design/icons';

import { MobileContext } from '../../main';

import remToPx from '../../utils/remToPx';

const { Text, Title, Link } = Typography;

import '../../styles/pages/Authentication.css';

const SignIn = () => {
	const [signingIn, setSigningIn] = React.useState(false);
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

	const signIn = () => {
		setSigningIn(true);

		setTimeout(() => {
			setSigningIn(false);
			navigate('/dashboard');
		}, remToPx(20));
	};

	return (
		<>
			<div id='auth-background'></div>

			<Flex
				layout='vertical'
				justify='center'
				align='center'
				className={`page-container ${mobile ? 'mobile' : ''}`}
			>
				<Card className='authentication-card'>
					<Flex vertical justify='space-between' align='center' gap='large' style={{ height: '100%' }}>
						<Flex vertical justify='center' align='center' gap='large' style={{ height: '100%' }}>
							<Image
								src='/CdM-OSAS Banner.png'
								alt='Logo Colegio de Montalban'
								width='75%'
								preview={false}
							/>
							<Divider />
							<Flex vertical justify='center' align='center'>
								<Text>Welcome back,</Text>
								<Title level={1} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Staff</Title>
							</Flex>
							<Form
								id='authentication-form'
								layout='vertical'
								onFinish={(values) => {
									signIn();
								}}
							>
								<Form.Item
									name='email'
									rules={[{ required: true, message: 'Please input your email!' }]}
								>
									<Input placeholder='Email Address' type='email' />
								</Form.Item>
								<Form.Item
									name='password'
									rules={[{ required: true, message: 'Please input your password!' }]}
								>
									<Input.Password placeholder='Password' type='password' />
								</Form.Item>
								<Flex justify='space-between' align='center' gap='small'>
									<Link href='/forgot-password'>
										Forgot Password?
									</Link>
									<Button
										type='primary'
										htmlType='submit'
										icon={signingIn ? <LoadingOutlined /> : <LoginOutlined />}
										disabled={signingIn}
									>
										Sign In
									</Button>
								</Flex>
							</Form>

							<Text>
								Don't have an account? <Link href='/sign-up'>Sign Up</Link>
							</Text>

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

export default SignIn;
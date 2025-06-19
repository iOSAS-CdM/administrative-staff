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

import { MailOutlined, GoogleOutlined, LoadingOutlined } from '@ant-design/icons';

import { MobileContext } from '../../main';

import remToPx from '../../utils/remToPx';

const { Text, Title, Link } = Typography;

import '../../styles/pages/authentication/SignIn.css';

const SignIn = () => {
	const [sending, setSending] = React.useState(false);
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

	const send = () => {
		setSending(true);

		setTimeout(() => {
			setSending(false);
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
				<Card className='auth-card'>
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
								<Text>We're here to help you,</Text>
								<Title level={1} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Staff</Title>
							</Flex>
							<Form
								layout='vertical'
								onFinish={(values) => {
									send();
								}}
							>
								<Form.Item
									name='employeeId'
									rules={[{ required: true, message: 'Please input your Employee ID!' }]}
								>
									<Input placeholder='Employee ID' type='text' />
								</Form.Item>
								<Form.Item
									name='email'
									rules={[{ required: true, message: 'Please input your email!' }]}
								>
									<Input placeholder='Email Address' type='email' />
								</Form.Item>
								<Flex vertical align='stretch'>
									<Button
										type='primary'
										htmlType='submit'
										icon={sending ? <LoadingOutlined /> : <MailOutlined />}
										disabled={sending}
									>
										Send OTP
									</Button>
								</Flex>
							</Form>

							<Text>
								Remembered your password? <Link href='/sign-in'>Sign In</Link>
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
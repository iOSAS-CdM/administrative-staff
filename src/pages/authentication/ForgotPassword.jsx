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
	Typography,
	Space
} from 'antd';

import {
	MailOutlined,
	GoogleOutlined,
	LoadingOutlined,
	CheckOutlined,
	KeyOutlined
} from '@ant-design/icons';

import { MobileContext } from '../../main';

import remToPx from '../../utils/remToPx';

const { Text, Title, Link, Paragraph } = Typography;

import '../../styles/pages/Authentication.css';

const ForgotPassword = () => {
	const [sending, setSending] = React.useState(false);
	const [verifying, setVerifying] = React.useState(false);
	const [resetting, setResetting] = React.useState(false);
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

	const StaffInfoForm = React.createRef();
	const OTPForm = React.createRef();
	const ResetPasswordForm = React.createRef();

	// 0 = Send OTP, 1 = Verify OTP, 2 = Reset Password
	const [step, setStep] = React.useState(0);
	const [name, setName] = React.useState('');



	const send = () => {
		setSending(true);

		setTimeout(() => {
			setSending(false);
			setStep(1);
			setName('John Doe'); // Simulate fetching name from server
		}, remToPx(20));
	};
	const verify = (otp) => {
		setVerifying(true);

		setTimeout(() => {
			setVerifying(false);
			setStep(2); // Simulate successful verification
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
								<Text>We're here to help you,</Text>
								<Title level={1} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
									{step === 0 ? 'Staff' : name}
								</Title>
							</Flex>



							{step === 0 && (
								<Form
									id='authentication-form'
									layout='vertical'
									ref={StaffInfoForm}
									onFinish={(values) => { }}
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
											icon={sending ? <LoadingOutlined /> : <MailOutlined />}
											disabled={sending}

											onClick={() => {
												StaffInfoForm.current
													.validateFields()
													.then((values) => {
														send();
													})
													.catch((errorInfo) => {
														console.error('Validation Failed:', errorInfo);
													});
											}}
										>
											Send OTP
										</Button>
									</Flex>
								</Form>
							)}

							{step === 1 && (
								<Form
									id='authentication-form'
									layout='vertical'
									ref={OTPForm}
									onFinish={(values) => { }}
								>
									<Paragraph style={{ textAlign: 'center' }}>
										An OTP has been sent to your email.<br /> Please enter it below to verify your identity
									</Paragraph>

									<Form.Item
										name='otp'
										rules={[
											{ required: true, message: 'Please input the OTP sent to your email!' },
											{ pattern: /^\d{6}$/, message: 'OTP must be a 6-digit number!' },
											{ len: 6, message: 'OTP must be exactly 6 digits long!' }
										]}
									>
										<Input placeholder='OTP' addonBefore='O-' />
									</Form.Item>

									<Paragraph style={{ textAlign: 'center' }}>
										Did not receive the OTP? <Link onClick={() => { send() }}>{sending && <LoadingOutlined />} Resend OTP</Link>
									</Paragraph>

									<Flex vertical align='stretch'>
										<Button
											type='primary'
											icon={verifying ? <LoadingOutlined /> : <CheckOutlined />}
											disabled={verifying}

											onClick={() => {
												OTPForm.current
													.validateFields()
													.then((values) => {
														verify(values.otp);
													})
													.catch((errorInfo) => {
														console.error('Validation Failed:', errorInfo);
													});
											}}
										>
											Verify OTP
										</Button>
									</Flex>
								</Form>
							)}

							{step === 2 && (
								<Form
									id='authentication-form'
									layout='vertical'
									ref={ResetPasswordForm}
									onFinish={(values) => { }}
								>
									<Form.Item
										name='password'
										rules={[
											{ required: true, message: 'Please input your new password!' },
											{ min: 8, message: 'Password must be at least 8 characters long!' },
											{ pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/, message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number, and one special character!' }
										]}
									>
										<Input.Password placeholder='New Password' />
									</Form.Item>
									<Form.Item
										name='confirmPassword'
										rules={[
											{ required: true, message: 'Please confirm your new password!' },
											({ getFieldValue }) => ({
												validator(_, value) {
													if (!value || getFieldValue('password') === value) {
														return Promise.resolve();
													};
													return Promise.reject(new Error('The two passwords that you entered do not match!'));
												}
											})
										]}
									>
										<Input.Password placeholder='Confirm New Password' />
									</Form.Item>
									<Flex vertical align='stretch'>
										<Button
											type='primary'
											icon={sending ? <LoadingOutlined /> : <KeyOutlined />}
											disabled={sending}

											onClick={() => {
												ResetPasswordForm.current
													.validateFields()
													.then((values) => {
														// Simulate password reset
														setResetting(true);
														setTimeout(() => {
															setResetting(false);
															navigate('/sign-in'); // Redirect to sign-in page after reset
														}, remToPx(20));
													})
													.catch((errorInfo) => {
														console.error('Validation Failed:', errorInfo);
													});
											}}
										>
											Reset Password
										</Button>
									</Flex>
								</Form>
							)}


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

export default ForgotPassword;
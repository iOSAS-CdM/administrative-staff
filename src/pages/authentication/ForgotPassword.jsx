import React from 'react';
import { useNavigate } from 'react-router';

import {
	Form,
	Flex,
	Button,
	Input,
	Typography,
	App
} from 'antd';

import {
	MailOutlined,
	LoadingOutlined,
	CheckOutlined,
	KeyOutlined
} from '@ant-design/icons';

const { Text, Title, Link, Paragraph } = Typography;

import '../../styles/pages/Authentication.css';

import { API_Route } from '../../main';

/**
 * @param {{
 * 		navigate: import('react-router').NavigateFunction
 * }} props
 * @returns {JSX.Element}
 */
const ForgotPassword = ({ navigate }) => {
	const [sending, setSending] = React.useState(false);
	const [verifying, setVerifying] = React.useState(false);
	const [resetting, setResetting] = React.useState(false);

	const StaffInfoForm = React.useRef(null);
	const OTPForm = React.useRef(null);
	const ResetPasswordForm = React.useRef(null);

	// 0 = Send OTP, 1 = Verify OTP, 2 = Reset Password
	const [step, setStep] = React.useState(0);
	const [user, setUser] = React.useState({});
	const [otp, setOtp] = React.useState(null);



	const send = async (values) => {
		setSending(true);

		const { id, email } = values;

		const request = await fetch(`${API_Route}/auth/staff/password-recovery`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id, email })
		}).catch((error) => {
			console.error('Error sending OTP:', error);
		});

		if (!request.ok) {
			const errorData = await request.json();
			StaffInfoForm.current.setFields([
				{
					name: 'id',
					errors: ' '
				},
				{
					name: 'email',
					errors: [errorData.message]
				}
			]);
			setSending(false);
			return;
		};

		const data = await request.json();
		setUser(data);
		setSending(false);
		setStep(1); // Move to OTP verification step
	};
	const verify = async (values) => {
		setVerifying(true);

		const { otp } = values;

		const request = await fetch(`${API_Route}/auth/staff/verify-otp`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: user.id, email: user.email, otp })
		}).catch((error) => {
			console.error('Error verifying OTP:', error);
		});

		if (!request.ok) {
			OTPForm.current.setFields([
				{
					name: 'otp',
					errors: ['Invalid OTP']
				}
			]);
			setVerifying(false);
			return;
		};

		setOtp(otp);
		setVerifying(false);
		setStep(2); // Move to password reset step
	};

	const resetPassword = async (password) => {
		setResetting(true);

		const request = await fetch(`${API_Route}/auth/staff/reset-password`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: user.id, email: user.email, otp, password })
		}).catch((error) => {
			console.error('Error resetting password:', error);
		});

		if (!request.ok) {
			const errorData = await request.json();
			ResetPasswordForm.current.setFields([
				{
					name: 'password',
					errors: [errorData.message]
				}
			]);
			setResetting(false);
			return;
		};

		setResetting(false);
		navigate('/authentication/sign-in'); // Redirect to sign-in page after resetting password
	};

	return (
		<>
			<Flex vertical justify='center' align='center'>
				<Text>We're here to help you{step > 1 ? ',' : ''}</Text>
				<Title level={1} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
					{step === 0 ? 'Reset Password' : user?.name?.first}
				</Title>
			</Flex>



			{step === 0 && (
				<Form
					id='authentication-form'
					layout='vertical'
					ref={StaffInfoForm}
					onFinish={(values) => {
						send(values);
					}}
				>
					<Form.Item
						name='id'
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
							htmlType='submit'
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
					onFinish={(values) => {
						verify(values);
					}}
				>
					<Paragraph style={{ textAlign: 'center' }}>
						An OTP has been sent to your email.<br /> Please enter it below to verify your identity.
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
						Did not receive the OTP? <Link onClick={() => { send({ id: user.id, email: user.email }) }}>{sending && <LoadingOutlined />} Resend OTP</Link>
					</Paragraph>

					<Flex vertical align='stretch'>
						<Button
							type='primary'
							icon={verifying ? <LoadingOutlined /> : <CheckOutlined />}
							disabled={verifying}
							htmlType='submit'
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
					onFinish={(values) => {
						resetPassword(values.password);
					}}
				>
					<Form.Item
						name='password'
						rules={[
							{ required: true, message: 'Please input your password!' },
							() => ({
								validator(_, value) {
									if (value.length < 8)
										return Promise.reject(new Error('Password must be at least 8 characters!'));
									return Promise.resolve();
								}
							}),
							() => ({
								validator(_, value) {
									if (value.search(/[a-z]/i) < 0)
										return Promise.reject(new Error('Password must contain at least one letter!'));
									return Promise.resolve();
								}
							}),
							() => ({
								validator(_, value) {
									if (value.search(/[0-9]/) < 0)
										return Promise.reject(new Error('Password must contain at least one number!'));
									return Promise.resolve();
								}
							})
						]}
					>
						<Input.Password placeholder='New Password' />
					</Form.Item>
					<Form.Item
						name='confirmPassword'
						rules={[
							{ required: true, message: 'Please confirm your password!' },
							({ getFieldValue }) => ({
								validator(_, value) {
									if (!value || getFieldValue('password') === value)
										return Promise.resolve();
									return Promise.reject(new Error('Passwords do not match!'));
								}
							})
						]}
					>
						<Input.Password placeholder='Confirm New Password' />
					</Form.Item>
					<Flex vertical align='stretch'>
						<Button
							type='primary'
							icon={resetting ? <LoadingOutlined /> : <KeyOutlined />}
							disabled={resetting}
							htmlType='submit'
						>
							Reset Password
						</Button>
					</Flex>
				</Form>
			)}


			<Text style={{ textWrap: 'nowrap' }}>
				Remembered your password? <Link onClick={() => navigate('/authentication/sign-in')}>Sign In</Link>
			</Text>
		</>
	);
};

export default ForgotPassword;
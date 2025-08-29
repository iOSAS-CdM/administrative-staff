import React from 'react';
import { useNavigate } from 'react-router';

import {
	Form,
	Flex,
	Button,
	Input,
	Typography,
	Checkbox,
	App
} from 'antd';

import { LoginOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text, Title, Link } = Typography;

import '../../styles/pages/Authentication.css';

import { API_Route } from '../../main';
import { i } from 'framer-motion/client';

/**
 * @param {{
 * 		navigate: import('react-router').NavigateFunction
 * }} props
 * @returns {JSX.Element}
 */
const SignUp = ({ navigate }) => {
	const [signingUp, setSigningUp] = React.useState(false);

	const [showPassword, setShowPassword] = React.useState(false);

	const app = App.useApp();
	const Notification = app.notification;

	const SignUpForm = React.useRef(null);
	const signUp = async (values) => {
		setSigningUp(true);

		const { id, email, password } = values;

		const response = await fetch(`${API_Route}/auth/staff/sign-up`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id, email, password })
		});

		if (!response.ok) {
			const error = await response.json();
			SignUpForm.current.setFields([
				{
					name: 'id',
					errors: ' '
				},
				{
					name: 'email',
					errors: ' '
				},
				{
					name: 'password',
					errors: ' '
				},
				{
					name: 'confirmPassword',
					errors: [error.message]
				}
			]);
		} else {
			navigate('/authentication/sign-in');
		};
		setSigningUp(false);
	};

	return (
		<>
			<Flex vertical justify='center' align='center'>
				<Text>Welcome to CdM-OSAS!</Text>
				<Title level={1} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign Up</Title>
			</Flex>
			<Form
				id='authentication-form'
				layout='vertical'
				ref={SignUpForm}
				onFinish={(values) => {
					signUp(values);
				}}
			>
				<Form.Item
					name='id'
					rules={[{ required: true, message: 'Please input your employee ID!' }]}
				>
					<Input placeholder='Employee ID' type='text' />
				</Form.Item>
				<Form.Item
					name='email'
					rules={[{ required: true, message: 'Please input your email!' }]}
				>
					<Input placeholder='Email Address' type='email' />
				</Form.Item>
				<Form.Item
					name='password'
					rules={[
						{ required: true, message: 'Please input your password!' },
						() => ({ validator(_, value) {
								if (value.length < 8)
									return Promise.reject(new Error('Password must be at least 8 characters!'));
								return Promise.resolve();
							}}),
						() => ({ validator(_, value) {
								if (value.search(/[a-z]/i) < 0)
									return Promise.reject(new Error('Password must contain at least one letter!'));
								return Promise.resolve();
							}}),
						() => ({ validator(_, value) {
								if (value.search(/[0-9]/) < 0)
									return Promise.reject(new Error('Password must contain at least one number!'));
								return Promise.resolve();
							}})
					]}
				>
					<Input.Password placeholder='Password' type='password' visibilityToggle={{ visible: showPassword, onVisibleChange: (visible) => setShowPassword(visible) }} />
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
					<Input.Password placeholder='Confirm Password' type='password' visibilityToggle={{ visible: showPassword, onVisibleChange: (visible) => setShowPassword(visible) }} />
				</Form.Item>
				<Flex justify='space-between' align='center' gap={16}>
					<Checkbox
						checked={showPassword}
						onChange={(e) => setShowPassword(e.target.checked)}
					>
						Show Password
					</Checkbox>
					<Button
						type='primary'
						htmlType='submit'
						icon={signingUp ? <LoadingOutlined /> : <LoginOutlined />}
						disabled={signingUp}
					>
						Sign Up
					</Button>
				</Flex>
			</Form>

			<Text>
				Already have an account? <Link onClick={() => navigate('/authentication/sign-in')}>Sign In</Link>
			</Text>
		</>
	);
};

export default SignUp;
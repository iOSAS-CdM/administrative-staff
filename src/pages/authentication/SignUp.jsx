import React from 'react';
import { useNavigate } from 'react-router';

import {
	Form,
	Flex,
	Button,
	Input,
	Typography,
	Checkbox
} from 'antd';

import { LoginOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text, Title, Link } = Typography;

import '../../styles/pages/Authentication.css';

/**
 * @param {{
 * 		navigate: import('react-router').NavigateFunction
 * }} props
 * @returns {JSX.Element}
 */
const SignUp = ({ navigate }) => {
	const [signingUp, setSigningUp] = React.useState(false);

	const [showPassword, setShowPassword] = React.useState(false);

	const signUp = () => {
		setSigningUp(true);

		setTimeout(() => {
			setSigningUp(false);
			navigate('/dashboard');
		}, 1024); // 2^10
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
				onFinish={(values) => {
					signUp();
				}}
			>
				<Form.Item
					name='employeeId'
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
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Input.Password placeholder='Password' type='password' visibilityToggle={{ visible: showPassword, onVisibleChange: (visible) => setShowPassword(visible) }} />
				</Form.Item>
				<Form.Item
					name='confirmPassword'
					rules={[{ required: true, message: 'Please confirm your password!' }]}
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
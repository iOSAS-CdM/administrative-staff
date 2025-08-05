import React from 'react';

import {
	Form,
	Flex,
	Button,
	Input,
	Typography
} from 'antd';

import { LoginOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text, Title, Link } = Typography;

/**
 * @param {{
 * 		navigate: import('react-router').NavigateFunction
 * }} param0
 * @returns {JSX.Element}
 */
const SignIn = ({ navigate }) => {
	const [signingIn, setSigningIn] = React.useState(false);

	const signIn = () => {
		setSigningIn(true);

		setTimeout(() => {
			setSigningIn(false);
			window.location.href = '/dashboard';
		}, 1024); // 2^10
	};

	return (
		<>
			<Flex vertical justify='center' align='center'>
				<Text>Welcome to CdM-OSAS</Text>
				<Title level={1} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign In</Title>
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
				<Flex justify='space-between' align='center' gap={16}>
					<Link onClick={() => navigate('/authentication/forgot-password')}>
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
				Don't have an account? <Link onClick={() => navigate('/authentication/sign-up')}>Sign Up</Link>
			</Text>
		</>
	);
};

export default SignIn;
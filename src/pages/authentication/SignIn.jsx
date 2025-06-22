import React from 'react';
import { useNavigate } from 'react-router';

import { getVersion } from '@tauri-apps/api/app';

import {
	Form,
	Flex,
	Button,
	Input,
	Typography
} from 'antd';

import { LoginOutlined, GoogleOutlined, LoadingOutlined } from '@ant-design/icons';

import { MobileContext } from '../../main';

import remToPx from '../../utils/remToPx';

const { Text, Title, Link } = Typography;

const SignIn = ({ navigate }) => {
	const [signingIn, setSigningIn] = React.useState(false);

	return (
		<>
			<Flex vertical justify='center' align='center'>
				<Text>Welcome back,</Text>
				<Title level={1} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Staff</Title>
			</Flex>
			<Form
				id='authentication-form'
				layout='vertical'
				onFinish={(values) => {
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
import React from 'react';
import supabase from '../../utils/supabaseClient';

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
 * }} props
 * @returns {JSX.Element}
 */
const SignIn = ({ navigate }) => {
	const [signingIn, setSigningIn] = React.useState(false);

	const SignInForm = React.useRef(null);
	const signIn = async (values) => {
		setSigningIn(true);

		const { email, password } = values;
		const { data, error } = await supabase.auth.signInWithPassword({ email, password });
		if (error) {
			SignInForm.current.setFields([
				{
					name: 'email',
					errors: ' '
				},
				{
					name: 'password',
					errors: [error.message]
				}
			]);
		};

		setSigningIn(false);
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
				ref={SignInForm}
				onFinish={(values) => {
					signIn(values);
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
					<Link style={{ textWrap: 'nowrap' }} onClick={() => navigate('/authentication/forgot-password')}>
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
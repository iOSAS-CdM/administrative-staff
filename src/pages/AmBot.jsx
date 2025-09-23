import React from 'react';
import { useNavigate } from 'react-router';
import { marked } from 'marked';

import { Flex, Button, Card, Avatar, Input, Form } from 'antd';

import { ClearOutlined, UserOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';

import { useCache } from '../contexts/CacheContext';
import { usePageProps } from '../contexts/PagePropsContext';

/**
 * @typedef {{
 * 	sender: 'user' | 'bot',
 * 	content: String
 * }} Message
 */

/**
 * @type {React.FC}
 */
const AmBot = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	React.useLayoutEffect(() => {
		setHeader({
			title: 'Helpbot',
			actions: [
				<Button
					type='primary'
					icon={<ClearOutlined />}
				>
					Clear Conversation
				</Button>
			]
		});
	}, [setHeader]);
	React.useEffect(() => {
		setSelectedKeys(['helpbot']);
	}, [setSelectedKeys]);

	const { cache } = useCache();

	/** @type {[Message[], React.Dispatch<React.SetStateAction<Message[]>>]} */
	const [messages, setMessages] = React.useState([]);

	React.useEffect(() => {
		const sampleContent = [
			{ sender: 'bot', content: 'Hello! How may I help you today?' },
			{ sender: 'user', content: 'How can I open a case?' },
			{
				sender: 'bot', content: `Opening a case is a very simple task, and I am here to help you out!

Here are the steps:
 - First navigate to the [Disciplinary Records](/dashboard/discipline/records/ongoing) tab on your Side Panel, there you will see the list of all existing Disciplinary Records.
 - Click on the “Open a New Case” button on the top-right corner of your screen and a modal will popup.
 - Fill up the required values depending on your case.
 - You may also click the “Open OCR” and use your mobile phone to scan a document for easier input.

And there you have it! You have successfully opened up a case.

You may now modify it as you please by editing its main description, adding complainants and complainees, uploading documents, or proceeding to the next step of the process.` },
			{ sender: 'user', content: 'Thank you! That was very helpful.' },
			{ sender: 'bot', content: 'You are welcome! If you have any other questions, feel free to ask.' }
		];
		setMessages(sampleContent);
	}, []);

	React.useEffect(() => {
		const spacer = document.getElementById('spacer');
		if (!spacer) return;
		const parent = spacer.parentElement;
		parent.scrollTo({
			top: parent.scrollHeight,
			behavior: 'smooth'
		});
	}, [messages]);

	const SendForm = React.useRef(null);

	return (
		<Flex vertical justify='end' gap={16} style={{ position: 'absolute', height: '100%', width: '100%', top: 0, left: 0, padding: 16 }}>
			<Flex vertical gap={16} className='scrollable-content' style={{ height: '100%', width: '100%', flex: 1 }}>
				<p id='spacer' style={{ marginTop: 'auto' }} />
				{messages.map((message, index) => (
					<Flex key={index} justify={message.sender === 'user' ? 'end' : 'start'} align='flex-start' gap={16}>
						{message.sender === 'bot' && <Avatar icon={<RobotOutlined />} style={{ backgroundColor: 'var(--primary)' }} />}
						<Card style={{ maxWidth: '60%' }}>
							<p dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
						</Card>
						{message.sender === 'user' && (
							cache.staff?.profilePicture ?
								<Avatar src={cache.staff.profilePicture} style={{ backgroundColor: 'var(--primary)' }} />
								: <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary)' }} />
						)}
					</Flex>
				))}
			</Flex>

			<Form
				ref={SendForm}
				style={{ width: '100%' }}
				onFinish={(values) => {
					if (!values.message || values.message.trim() === '') return;
					setMessages([...messages, { sender: 'user', content: values.message }]);
					// Simulate bot response
					setTimeout(() => {
						setMessages(prev => [...prev, { sender: 'bot', content: `You said: ${values.message}` }]);
					}, 1000);
					SendForm.current.resetFields();
				}}
			>
				<Card style={{ width: '100%' }}>
					<Flex align='flex-start' gap={16} style={{ width: '100%' }}>
						<Form.Item
							name='message'
							rules={[{ max: 2048, message: 'Message must be at most 2048 characters' }]}
							style={{ width: '100%' }}
						>
							<Input.TextArea
								rows={1}
								autoSize={{ maxRows: 4 }}
								placeholder='Enter your message'
							/>
						</Form.Item>
						<Button
							type='primary'
							icon={<SendOutlined />}
							htmlType='submit'
						/>
					</Flex>
				</Card>
			</Form>
		</Flex>
	);
};

export default AmBot;
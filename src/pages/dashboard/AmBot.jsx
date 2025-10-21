import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { marked } from 'marked';

import { Flex, Button, Card, Avatar, Input, Form } from 'antd';

import { ClearOutlined, UserOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';

import { useCache } from '../../contexts/CacheContext';
import { usePageProps } from '../../contexts/PagePropsContext';
import { API_Route } from '../../main';
import authFetch from '../../utils/authFetch';

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

	/** @type {[Message[], React.Dispatch<React.SetStateAction<Message[]>>]} */
	const [messages, setMessages] = React.useState([]);
	const [isLoading, setIsLoading] = React.useState(false);
	const [sessionId] = React.useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

	const clearConversation = React.useCallback(() => {
		setMessages([]);
	}, []);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'AmBot',
			actions: [
				<Button
					type='primary'
					icon={<ClearOutlined />}
					onClick={clearConversation}
				>
					Clear Conversation
				</Button>
			]
		});
	}, [setHeader, clearConversation]);
	React.useEffect(() => {
		setSelectedKeys(['ambot']);
	}, [setSelectedKeys]);

	const { cache } = useCache();

	const [suggestedQuestions, setSuggestedQuestions] = React.useState([
		'How do I open a new disciplinary case?',
		'How can I upload documents to a case?',
		'How do I verify a student account?',
		'What are the different case statuses?',
		'How do I search for a student?'
	]);

	// Initialize with welcome message
	React.useEffect(() => {
		setMessages([{ sender: 'bot', content: 'Hello! How may I help you today?' }]);
	}, []);

	// Fetch suggested questions from backend
	React.useEffect(() => {
		const fetchSuggestions = async () => {
			try {
				const response = await authFetch(`${API_Route}/ambot/suggestions`);
				if (response.ok) {
					const data = await response.json();
					if (data.suggestions && Array.isArray(data.suggestions))
						setSuggestedQuestions(data.suggestions);
				};
			} catch (error) {
				console.error('Error fetching suggestions:', error);
				// Keep default suggestions on error
			};
		};

		fetchSuggestions();
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
	const textAreaRef = React.useRef(null);

	const handleSendMessage = async (values, directMessage = null) => {
		const userMessage = directMessage || values?.message?.trim();
		if (!userMessage) return;

		// Add user message to chat
		setMessages(prev => [...prev, { sender: 'user', content: userMessage }]);
		if (SendForm.current)
			SendForm.current.resetFields();

		// Set loading state
		setIsLoading(true);

		// Add empty bot message that will be filled with streaming response
		const botMessageIndex = messages.length + 1;
		setMessages(prev => [...prev, { sender: 'bot', content: '' }]);

		try {
			const response = await authFetch(`${API_Route}/ambot/${sessionId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ message: userMessage })
			});

			if (!response.ok)
				throw new Error('Failed to get response from chatbot');

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let botResponse = '';

			while (true) {
				const { done, value } = await reader.read();

				if (done) break;

				const chunk = decoder.decode(value, { stream: true });
				botResponse += chunk;

				// Update the bot message with accumulated response
				setMessages(prev => {
					const newMessages = [...prev];
					newMessages[botMessageIndex] = { sender: 'bot', content: botResponse };
					return newMessages;
				});
			}
		} catch (error) {
			console.error('Error sending message:', error);
			// Update bot message with error
			setMessages(prev => {
				const newMessages = [...prev];
				newMessages[botMessageIndex] = {
					sender: 'bot',
					content: 'Sorry, I encountered an error processing your message. Please try again.'
				};
				return newMessages;
			});
		} finally {
			setIsLoading(false);
			// Focus on the input after generation completes
			setTimeout(() => {
				textAreaRef.current?.focus();
			}, 0);
		};
	};

	return (
		<Flex vertical justify='end' gap={16} style={{ position: 'absolute', height: '100%', width: '100%', top: 0, left: 0, padding: 16 }}>
			<Flex vertical gap={16} className='scrollable-content' style={{ height: '100%', width: '100%', flex: 1 }}>
				<p id='spacer' style={{ marginTop: 'auto' }} />
				{messages.map((message, index) => (
					<Flex key={index} justify={message.sender === 'user' ? 'end' : 'start'} align='flex-start' gap={16}>
						{message.sender === 'bot' && <Avatar icon={<RobotOutlined />} style={{ backgroundColor: 'var(--primary)' }} />}
						<motion.div
							style={{ maxWidth: '60%' }}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.2 }}
						>
							<Card>
								<p dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
							</Card>
						</motion.div>
						{message.sender === 'user' && (
							cache.staff?.profilePicture ?
								<Avatar src={cache.staff.profilePicture} style={{ backgroundColor: 'var(--primary)' }} />
								: <Avatar icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary)' }} />
						)}
					</Flex>
				))}

				{messages.length === 1 && !isLoading && (
					<Flex vertical gap={8} style={{ padding: '0 48px' }}>
						{suggestedQuestions.map((question, index) => (
							<motion.div
								key={index}
								style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
							>
								<Button
									onClick={() => handleSendMessage({}, question)}
									disabled={isLoading}
									style={{ textAlign: 'left', height: 'auto' }}
								>
									{question}
								</Button>
							</motion.div>
						))}
					</Flex>
				)}
			</Flex>

			<Form
				ref={SendForm}
				style={{ width: '100%' }}
				onFinish={handleSendMessage}
			>
				<Card style={{ width: '100%' }}>
					<Flex align='flex-start' gap={16} style={{ width: '100%' }}>
						<Form.Item
							name='message'
							rules={[{ max: 2048, message: 'Message must be at most 2048 characters' }]}
							style={{ width: '100%', marginBottom: 0 }}
						>
							<Input.TextArea
								ref={textAreaRef}
								rows={1}
								autoSize={{ maxRows: 4 }}
								placeholder='Enter your message'
								disabled={isLoading}
								onKeyDown={(e) => {
									if (e.key === 'Enter' && !e.shiftKey) {
										e.preventDefault();
										SendForm.current.submit();
									}
								}}
							/>
						</Form.Item>
						<Button
							type='primary'
							icon={<SendOutlined />}
							htmlType='submit'
							loading={isLoading}
							disabled={isLoading}
						/>
					</Flex>
				</Card>
			</Form>
		</Flex>
	);
};

export default AmBot;
import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Form,
	Input,
	Row,
	Col,
	Button,
	Typography
} from 'antd';

import {
	QuestionCircleOutlined,
	DeleteOutlined
} from '@ant-design/icons';

import ItemCard from '../../../components/ItemCard';
import ContentPage from '../../../components/ContentPage';

import { usePageProps } from '../../../contexts/PagePropsContext';
import { useRefresh } from '../../../contexts/RefreshContext';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

const { Paragraph, Title } = Typography;

/**
 * @type {React.FC}
 */
const FAQsPage = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const { setRefresh } = useRefresh();

	const { modal: Modal, notification } = App.useApp();

	const FAQFormRef = React.useRef(null);

	React.useEffect(() => {
		setHeader({
			title: 'Frequently Asked Questions',
			actions: [
				<Button
					type='primary'
					icon={<QuestionCircleOutlined />}
					onClick={() => {
						Modal.confirm({
							title: 'Add FAQ',
							okText: 'Add FAQ',
							content: (
								<Form
									layout='vertical'
									ref={FAQFormRef}
								>
									<Form.Item
										label='Question'
										name='question'
										rules={[{ required: true, message: 'Please enter the question' }]}
									>
										<Input />
									</Form.Item>
									<Form.Item
										label='Answer'
										name='answer'
										rules={[{ required: true, message: 'Please enter the answer' }]}
									>
										<Input.TextArea rows={4} />
									</Form.Item>
								</Form>
							),
							onOk: () => FAQFormRef.current.validateFields()
								.then(async (values) => {
									const request = await authFetch(`${API_Route}/faqs`, {
										method: 'POST',
										headers: {
											'Content-Type': 'application/json'
										},
										body: JSON.stringify(values)
									});

									if (!request?.ok) {
										notification.error({
											message: 'Error',
											description: 'Failed to add FAQ. Please try again.'
										});
										return;
									};

									notification.success({
										message: 'Success',
										description: 'FAQ added successfully.'
									});

									setRefresh({ timestamp: Date.now() });
								})
						});
					}}
				>
					Add FAQ
				</Button>
			]
		});
	}, [setHeader, Modal]);

	React.useEffect(() => {
		setSelectedKeys(['faqs']);
	}, [setSelectedKeys]);

	return (
		<ContentPage
			fetchUrl={`${API_Route}/faqs`}
			cacheKey='faqs'
			emptyText='No FAQs available'
			columnSpan={8}
			pageSize={24}
			transformData={(data) => data.faqs || []}
			renderItem={(faq, index) => (
				<ItemCard key={index} hoverable={false} style={{ width: '100%' }}>
					<Title level={4}>{faq.question}</Title>
					<Paragraph>{faq.answer}</Paragraph>

					<Button
						danger
						block
						icon={<DeleteOutlined />}
						onClick={() => {
							Modal.confirm({
								title: 'Delete FAQ',
								content: 'Are you sure you want to delete this FAQ?',
								okText: 'Delete',
								okType: 'danger',
								onOk: async () => {
									const request = await authFetch(`${API_Route}/faqs/${faq.id}`, {
										method: 'DELETE'
									});

									if (!request?.ok) {
										notification.error({
											message: 'Error',
											description: 'Failed to delete FAQ. Please try again.'
										});
										return;
									};

									notification.success({
										message: 'Success',
										description: 'FAQ deleted successfully.'
									});

									setRefresh({ timestamp: Date.now() });
								}
							});
						}}
					/>
				</ItemCard>
			)}
		/>
	);
};

export default FAQsPage;
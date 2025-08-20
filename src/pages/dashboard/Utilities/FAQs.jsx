import React from 'react';

import {
	Card,
	Flex,
	Row,
	Col,
	Button,
	Typography
} from 'antd';

import {
	QuestionCircleOutlined,
	EditOutlined,
	DeleteOutlined,
	SaveOutlined
} from '@ant-design/icons';

import ItemCard from '../../../components/ItemCard';

const { Paragraph, Title } = Typography;

const FAQsPage = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setHeader({
			title: 'Frequently Asked Questions',
			actions: [
				<Button
					type='primary'
					icon={<QuestionCircleOutlined />}
				>
					Add FAQ
				</Button>
			]
		});
	}, [setHeader]);

	React.useEffect(() => {
		setSelectedKeys(['faqs']);
	}, [setSelectedKeys]);

	/** @type {[{ question: String, answer: String, editMode: Boolean }[], React.Dispatch<React.SetStateAction<{ question: String, answer: String, editMode: Boolean }[]>>]} */
	const [FAQs, setFAQs] = React.useState([]);

	React.useEffect(() => {
		// Fetch FAQs from an API or define them here
		const fetchedFAQs = [
			{ question: 'What is the return policy?', answer: 'You can return any item within 30 days.', editMode: false },
			{ question: 'How do I track my order?', answer: 'You can track your order in the "My Orders" section.', editMode: false },
			{ question: 'Do you ship internationally?', answer: 'Yes, we ship to over 100 countries.', editMode: false }
		];
		setFAQs(fetchedFAQs);
	}, []);

	return (
		<Row gutter={[16, 16]}>
			{FAQs.map((FAQ, index) => (
				<Col key={index} span={8}>
					<ItemCard
						actions={!FAQ.editMode ? [
							{
								icon: <EditOutlined />,
								type: 'primary',
								content: 'Edit',
								style: { width: '100%' },
								onClick: () => {
									setFAQs(FAQs.map((f, i) => i === index ? { ...f, editMode: true } : f));
								}
							},
							{
								icon: <DeleteOutlined />,
								danger: true,
								type: 'default',
								style: { width: '100%' },
								content: 'Delete',
								onClick: () => { }
							}
						] : [
							{
								icon: <SaveOutlined />,
								type: 'primary',
								style: { width: '100%' },
								content: 'Save',
								onClick: () => {
									setFAQs(FAQs.map((f, i) => i === index ? { ...f, editMode: false } : f));
								}
							},
							{
								icon: <DeleteOutlined />,
								danger: true,
								type: 'default',
								content: 'Cancel',
								onClick: () => {
									setFAQs(FAQs.map((f, i) => i === index ? { ...f, editMode: false } : f));
								}
							}
						]}
					>
						<Title level={4}>{FAQ.question}</Title>
						<Paragraph>{FAQ.answer}</Paragraph>
					</ItemCard>
				</Col>
			))}
		</Row>
	);
};

export default FAQsPage;
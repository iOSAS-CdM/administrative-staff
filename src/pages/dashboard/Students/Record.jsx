import React from 'react';
import { useLocation } from 'react-router';
import moment from 'moment';

import {
	Card,
	Button,
	Flex,
	Row,
	Col,
	Divider,
	Avatar,
	Typography,
	Calendar,
	Tag,
	App
} from 'antd';

import {
	FileOutlined,
	EditOutlined,
	InboxOutlined,
	LeftOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

import '../../../styles/pages/Dashboard.css';

const Record = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	const location = useLocation();

	React.useEffect(() => {
		setHeader({
			title: `Disciplinary Case ${thisRecord.recordId || ''}`,
			actions: [
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate(-1)}
				>
					Back
				</Button>
			]
		});
	}, [setHeader]);
	React.useEffect(() => {
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	const [thisRecord, setThisRecord] = React.useState(location.state?.record || {
		recordId: '12345',
		title: 'Placeholder Title',
		description: 'Placeholder Description',
		tags: {
			status: 'ongoing',
			severity: 'Minor',
			occurances: 1
		},
		complainants: [],
		complainees: [],
		placeholder: true,
		date: new Date()
	});

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex
			vertical
			gap={16}
		>
			<Row gutter={[16, 16]}>
				<Col span={24}>
					<Card>
						<Flex vertical gap={8}>
							<Title level={1}>{thisRecord.title}</Title>
							<Flex align='center' gap={8}>
								<Text>
									{thisRecord.date.toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</Text>
								<div>
									<Tag color={
										{
											1: 'green',
											2: 'orange',
											3: 'red'
										}[thisRecord.tags.occurances] || 'red'
									}>
										{
											thisRecord.tags.occurances === 1 ? '1st' :
												thisRecord.tags.occurances === 2 ? '2nd' :
													thisRecord.tags.occurances === 3 ? '3rd' :
														`${thisRecord.tags.occurances}th`
										} Offense
									</Tag>
									<Tag color={
										{
											minor: 'blue',
											major: 'orange',
											severe: 'red'
										}[thisRecord.tags.severity.toLowerCase()] || 'default'
									}>
										{thisRecord.tags.severity.charAt(0).toUpperCase() + thisRecord.tags.severity.slice(1)}
									</Tag>
									<Tag color={
										{
											ongoing: 'blue',
											resolved: 'green',
											archived: 'grey'
										}[thisRecord.tags.status] || 'default'
									}>
										{thisRecord.tags.status.charAt(0).toUpperCase() + thisRecord.tags.status.slice(1)}
									</Tag>
								</div>
							</Flex>
							<Text>{thisRecord.description}</Text>
							<Flex gap={8}>
								<Button
									type='primary'
									size='small'
									icon={<EditOutlined />}
									onClick={() => {
										if (thisRecord.placeholder) {
											Modal.error({
												title: 'Error',
												content: 'This is a placeholder disciplinary record. Please try again later.',
												centered: true
											});
										} else {
											navigate(`/dashboard/students/records/${thisRecord.recordId}/edit`, {
												state: { record: thisRecord }
											});
										};
									}}
								>
									Edit Record
								</Button>
								<Button
									type='default'
									size='small'
									danger
									icon={<InboxOutlined />}
									onClick={() => {
										if (thisRecord.placeholder) {
											Modal.error({
												title: 'Error',
												content: 'This is a placeholder disciplinary record. Please try again later.',
												centered: true
											});
										} else {
										};
									}}
								>
									Archive Record
								</Button>
							</Flex>
						</Flex>
					</Card>
				</Col>
			</Row>
		</Flex>
	);
};

export default Record;


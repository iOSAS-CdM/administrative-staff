import React from 'react';
import { useLocation } from 'react-router';
import moment from 'moment';

import {
	Card,
	Button,
	Flex,
	Row,
	Col,
	Avatar,
	Typography,
	Tag,
	App
} from 'antd';

import {
	EditOutlined,
	InboxOutlined,
	LeftOutlined,
	PlusOutlined,
	BellOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import '../../../styles/pages/Dashboard.css';
import remToPx from '../../../utils/remToPx';

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

	const [repository, setRepository] = React.useState([]);
	React.useEffect(() => {
		if (thisRecord.placeholder) {
			setRepository([]);
		} else {
			setRepository([
				{
					name: 'Document 1',
					extension: 'pdf',
					id: 'doc-1',
					thumbnail: 'https://via.placeholder.com/150'
				},
				{
					name: 'Document 2',
					extension: 'pdf',
					id: 'doc-2',
					thumbnail: 'https://via.placeholder.com/150'
				},
				{
					name: 'Image 1',
					extension: 'jpg',
					id: 'img-1',
					thumbnail: 'https://via.placeholder.com/150'
				},
				{
					name: 'Image 2',
					extension: 'png',
					id: 'img-2',
					thumbnail: 'https://via.placeholder.com/150'
				}
			]);
		};
	}, [thisRecord]);

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

				<Col span={16}>
					<Flex vertical gap={16}>
						<Row gutter={[16, 16]}>
							<Col span={12}>
								<Card title={`Complainant${thisRecord.complainants.length > 1 ? 's' : ''}`} size='small'>
									<Flex vertical gap={8}>
										<Flex vertical gap={8} className='scrollable-content' style={{ maxHeight: remToPx(32) }}>
											{thisRecord.complainants.map((complainant, i) => (
												<Card
													key={complainant.studentId || i}
													size='small'
													style={{ width: '100%' }}
													onClick={() => {
														if (complainant.placeholder) {
															Modal.error({
																title: 'Error',
																content: 'This is a placeholder complainant profile. Please try again later.',
																centered: true
															});
														} else {
															navigate(`/dashboard/students/profiles/${complainant.id}`, {
																state: { student: complainant }
															});
														}
													}}
												>
													<Flex align='center' gap={8}>
														<Avatar src={complainant.profilePicture} size='large' />
														<Flex vertical>
															<Text>{complainant.name.first} {complainant.name.middle} {complainant.name.last}</Text>
															<Text type='secondary'>{complainant.studentId}</Text>
														</Flex>
													</Flex>
												</Card>
											))}
										</Flex>
										<Flex justify='flex-end' align='center' gap={8}>
											<Button
												type='default'
												size='small'
												icon={<BellOutlined />}
												onClick={() => { }}
											>
												Summon
											</Button>
											<Button
												type='primary'
												size='small'
												icon={<PlusOutlined />}
												onClick={() => { }}
											>
												Add
											</Button>
										</Flex>
									</Flex>
								</Card>
							</Col>
							<Col span={12}>
								<Card title={`Complainee${thisRecord.complainees.length > 1 ? 's' : ''}`} size='small'>
									<Flex vertical gap={8}>
										<Flex vertical gap={8} className='scrollable-content' style={{ maxHeight: remToPx(32) }}>
											{thisRecord.complainees.map((complainee, i) => (
												<Card
													key={complainee.studentId || i}
													size='small'
													style={{ width: '100%' }}
													onClick={() => {
														if (complainee.placeholder) {
															Modal.error({
																title: 'Error',
																content: 'This is a placeholder complainee profile. Please try again later.',
																centered: true
															});
														} else {
															navigate(`/dashboard/students/profiles/${complainee.id}`, {
																state: { student: complainee }
															});
														}
													}}
												>
													<Flex align='center' gap={8}>
														<Avatar src={complainee.profilePicture} size='large' />
														<Flex vertical>
															<Text>{complainee.name.first} {complainee.name.middle} {complainee.name.last}</Text>
															<Text type='secondary'>{complainee.studentId}</Text>
														</Flex>
													</Flex>
												</Card>
											))}
										</Flex>
										<Flex justify='flex-end' align='center' gap={8}>
											<Button
												type='default'
												size='small'
												icon={<BellOutlined />}
												onClick={() => { }}
											>
												Summon
											</Button>
											<Button
												type='primary'
												size='small'
												icon={<PlusOutlined />}
												onClick={() => { }}
											>
												Add
											</Button>
										</Flex>
									</Flex>
								</Card>
							</Col>
						</Row>

						<Card title='Repository' size='small'>
							<Flex vertical gap={8}>
								<Flex vertical gap={8} className='scrollable-content' style={{ maxHeight: remToPx(16) }}>
									{repository.map((file, i) => (
										<Card
											key={file.id || i}
											size='small'
											style={{ width: '100%' }}
											onClick={() => { }}
										>
											<Flex align='center' gap={8}>
												<Avatar src={file.thumbnail} size='large' shape='square' />
												<Flex vertical>
													<Text>{file.name}</Text>
													<Text type='secondary'>{file.extension.toUpperCase()}</Text>
												</Flex>
											</Flex>
										</Card>
									))}
								</Flex>
								<Flex justify='flex-end' align='center' gap={8}>
									<Button
										type='default'
										size='small'
										icon={<BellOutlined />}
										onClick={() => { }}
									>
										Summon
									</Button>
									<Button
										type='primary'
										size='small'
										icon={<PlusOutlined />}
										onClick={() => { }}
									>
										Add
									</Button>
								</Flex>
							</Flex>
						</Card>
					</Flex>
				</Col>
			</Row>
		</Flex>
	);
};

export default Record;


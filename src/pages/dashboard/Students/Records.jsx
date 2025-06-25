import React from 'react';
import { useLocation } from 'react-router';

import {
	App,
	Form,
	Input,
	Card,
	Button,
	Segmented,
	Dropdown,
	Flex,
	Empty,
	Row,
	Col,
	Avatar,
	Typography,
	Checkbox,
	Tag
} from 'antd';

import {
	RightOutlined,
	SearchOutlined,
	FilterOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

const DisciplinaryRecords = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	const location = useLocation();

	React.useEffect(() => {
		setHeader({
			title: 'Disciplinary Records',
			actions: null
		});
	}, [setHeader]);

	React.useEffect(() => { 
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	const [category, setCategory] = React.useState('ongoing');
	const FilterForm = React.useRef(null);
	const [records, setRecords] = React.useState([]);
	const [displayedRecords, setDisplayedRecords] = React.useState([]);

	React.useEffect(() => {
		const placeholderRecord = [];
		for (let i = 0; i < 20; i++) {
			const id = `placeholder-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;
			if (records.some(record => record.recordId === id))
				continue;
			placeholderRecord.push({
				id: id,
				recordId: id,
				title: `Placeholder Record ${i + 1}`,
				description: `This is a placeholder record for testing purposes. Record number ${i + 1}.`,
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
		};
		setRecords(placeholderRecord);

		setTimeout(() => {
			const fetchedRecords = [];

			for (let i = 0; i < 40; i++) {
				const id = `record-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;
				if (records.some(record => record.recordId === id))
					continue;
				fetchedRecords.push({
					id: id,
					recordId: id,
					title: `Record ${i + 1}`,
					description: `This is a record for testing purposes. Record number ${i + 1}.`,
					tags: {
						status: ['ongoing', 'resolved', 'archived'][Math.floor(Math.random() * 3)],
						severity: ['Minor', 'Major', 'Severe'][Math.floor(Math.random() * 3)],
						occurances: Math.floor(Math.random() * 5) + 1
					},
					complainants: [
						...Array(Math.floor(Math.random() * 5 + 1)).keys()
					].map(i => {
						return `25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${Math.floor(Math.random() * 100) + 1}`;
					}),
					complainees: [
						...Array(Math.floor(Math.random() * 5 + 1)).keys()
					].map(i => {
						return `25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${Math.floor(Math.random() * 100) + 1}`;
					}),
					placeholder: false,
					date: new Date(new Date().getFullYear(), new Date().getMonth(), new
						Date().getDate() - (Math.floor(Math.random() * 10) + 1))
				});
			};

			const sortedRecords = fetchedRecords.sort((a, b) => b.date - a.date);
			sortedRecords.forEach(record => {
				record.date = new Date(record.date);
			});

			setRecords(sortedRecords);
		}, remToPx(2));
	}, []);

	React.useEffect(() => {
		setDisplayedRecords(records);
		categorizeFilter('ongoing');
	}, [records]);

	const categorizeFilter = (category) => {
		let filteredRecords = records;

		if (category !== 'all')
			filteredRecords = records.filter(record => record.tags.status === category);

		setDisplayedRecords([]);
		setTimeout(() => {
			setDisplayedRecords(filteredRecords);
		}, remToPx(2));
	};

	const searchCategorizedRecord = (searchTerm) => {
		setCategory('all');

		if (searchTerm.trim() === '') {
			setDisplayedRecords(records);
			return;
		};

		const filteredRecords = records.filter(record => {
			const fullTitle = record.title.toLowerCase();
			const description = record.description.toLowerCase();
			const recordId = record.recordId.toLowerCase();
			return fullTitle.includes(searchTerm.toLowerCase()) ||
				description.includes(searchTerm.toLowerCase()) ||
				recordId.includes(searchTerm.toLowerCase());
		});

		setDisplayedRecords([]);
		setTimeout(() => {
			setDisplayedRecords(filteredRecords);
		}, remToPx(2));
	};

	return (
		<Flex vertical gap={16} style={{ width: '100%', height: '100%' }}>
			{/************************** Filter **************************/}
			<Form
				id='filter'
				layout='vertical'
				ref={FilterForm}
				style={{ width: '100%' }}
				initialValues={{ search: '', category: 'all' }}
			>
				<Flex justify='space-between' align='center' gap={16}>
					<Card size='small' {...mobile ? { style: { width: '100%' } } : {}}>
						<Form.Item
							name='search'
							style={{ margin: 0 }}
						>
							<Input
								placeholder='Search'
								allowClear
								prefix={<SearchOutlined />}
								onChange={(e) => searchCategorizedRecord(e.target.value)}
							/>
						</Form.Item>
					</Card>
					<Card size='small'>
						<Form.Item
							name='category'
							style={{ margin: 0 }}
						>
							{!mobile ?
								<Flex gap={16}>
									<Dropdown
										trigger={['click']}
										placement='bottomRight'
										arrow
										popupRender={(menu) => (
											<Card size='small'>
												<Flex vertical gap={8}>
													<Flex vertical>
														<Text strong>Severity</Text>
														<Checkbox.Group
														onChange={(value) => {
														}}
														>
															<Row gutter={[0, 0]}>
																<Col span={24}>
																	<Checkbox value='minor'>Minor</Checkbox>
																</Col>
																<Col span={24}>
																	<Checkbox value='major'>Major</Checkbox>
																</Col>
																<Col span={24}>
																	<Checkbox value='severe'>Severe</Checkbox>
																</Col>
															</Row>
														</Checkbox.Group>
													</Flex>

													<Flex vertical>
														<Text strong>Occurance</Text>
														<Checkbox.Group
														onChange={(value) => {
														}}
														>
															<Row gutter={[0, 0]}>
																<Col span={24}>
																	<Checkbox value='1st'>1st Offense</Checkbox>
																</Col>
																<Col span={24}>
																	<Checkbox value='2nd'>2nd Offense</Checkbox>
																</Col>
																<Col span={24}>
																	<Checkbox value='3rd'>3rd Offense</Checkbox>
																</Col>
																<Col span={24}>
																	<Checkbox value='4th'>4th Offense</Checkbox>
																</Col>
																<Col span={24}>
																	<Checkbox value='succeeding'>Succeeding Offenses</Checkbox>
																</Col>
															</Row>
														</Checkbox.Group>
													</Flex>
												</Flex>
											</Card>
										)}
									>
										<Button
											icon={<FilterOutlined />}
											onClick={(e) => e.stopPropagation()}
										>
											Filter
										</Button>
									</Dropdown>

									<Segmented
										options={[
											{ label: 'All', value: 'all' },
											{ label: 'Ongoing', value: 'ongoing' },
											{ label: 'Resolved', value: 'resolved' },
											{ label: 'Archived', value: 'archived' }
										]}
										value={category}
										onChange={(value) => {
											setCategory(value);
											categorizeFilter(value);
											FilterForm.current.setFieldsValue({ search: '' });
										}}
										style={{ width: '100%' }}
									/>
								</Flex>
								:
								<Dropdown
									trigger={['click']}
									placement='bottomRight'
									arrow
									popupRender={(menu) => (
										<Card size='small'>
											<Segmented
												options={[
													{ label: 'All', value: 'all' },
													{ label: 'Ongoing', value: 'ongoing' },
													{ label: 'Resolved', value: 'resolved' },
													{ label: 'Archived', value: 'archived' }
												]}
												vertical
												value={category}
												onChange={(value) => {
													setCategory(value);
													categorizeFilter(value);
													FilterForm.current.setFieldsValue({ search: '' });
												}}
												style={{ width: '100%' }}
											/>
										</Card>
									)}
								>
									<Button
										icon={<FilterOutlined />}
										onClick={(e) => e.stopPropagation()}
									/>
								</Dropdown>
							}
						</Form.Item>
					</Card>
				</Flex>
			</Form>

			{/************************** Records **************************/}
			{displayedRecords.length > 0 ? (
				<Row gutter={[16, 16]}>
					{displayedRecords.map((record, index) => (
						<Col key={record.id} span={!mobile ? 8 : 24} style={{ height: '100%' }}>
							<RecordCard
								record={record}
								animationDelay={index * 0.1}
								loading={record.placeholder}
								navigate={navigate}
							/>
						</Col>
					))}
				</Row>
			) : (
				<Flex justify='center' align='center' style={{ height: '100%' }}>
					<Empty description='No profiles found' />
				</Flex>
			)}
		</Flex>
	);
};

export default DisciplinaryRecords;

const RecordCard = ({ record, animationDelay, loading, navigate }) => {
	const [mounted, setMounted] = React.useState(false);

	const [thisRecord, setThisRecord] = React.useState(record);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setMounted(true);
		}, animationDelay * 1000 || 0);

		return () => clearTimeout(timer);
	}, [animationDelay]);

	React.useEffect(() => {
		if (record) {
			setThisRecord(record);
		};
	}, [record]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Card
			size='small'
			hoverable
			loading={loading}
			className={mounted ? 'card-mounted' : 'card-unmounted'}
			style={{
				height: '100%',
				filter: {
					ongoing: false,
					resolved: false,
					archived: true
				}[thisRecord.tags.status] ? 'grayscale(100%)' : 'none'
			}}

			actions={[
				<Avatar.Group max={{
					count: 4
				}}>
					{thisRecord.complainants.map((complainant, index) => (
						<Avatar
							key={index}
							src={`https://randomuser.me/api/portraits/${['men', 'women'][Math.floor(Math.random() * 2)]}/${Math.floor(Math.random() * 100)}.jpg`}
							style={{ cursor: 'pointer' }}
							onClick={() => {
								Modal.info({
									title: `Complainant: ${complainant}`,
									content: <Text>Details about the complainant {complainant}.</Text>
								});
							}}
						/>
					))}
					{thisRecord.complainees.map((complainee, index) => (
						<Avatar
							key={index}
							src={`https://randomuser.me/api/portraits/${['men', 'women'][Math.floor(Math.random() * 2)]}/${Math.floor(Math.random() * 100)}.jpg`}
							style={{ cursor: 'pointer' }}
							onClick={() => {
								Modal.info({
									title: `Complainanee: ${complainee}`,
									content: <Text>Details about the complainanee {complainee}.</Text>
								});
							}}
						/>
					))}
				</Avatar.Group>,

				<Text>
					{thisRecord.date.toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'long',
						day: 'numeric'
					})}
				</Text>,

				<RightOutlined onClick={() => {
					if (thisStudent.placeholder) {
						Modal.error({
							title: 'Error',
							content: 'This is a placeholder student profile. Please try again later.',
							centered: true
						});
					} else {
						navigate(`/dashboard/students/profiles/${thisStudent.studentId}`, {
							state: { student: thisStudent }
						});
					};
				}} key='view' />
			]}
		>
			<Flex vertical justify='flex-start' align='flex-start' gap={16} style={{ position: 'relative' }}>
				<Flex justify='flex-end' align='center' style={{ position: 'absolute', top: 0, width: '100%' }}>
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
				</Flex>
				<Card.Meta
					title={
						<Title level={3} style={{ margin: 0 }}>
							{thisRecord.title}
						</Title>
					}
					description={
						<Text>
							{thisRecord.description}
						</Text>
					}
				/>
			</Flex>
		</Card>
	);
};
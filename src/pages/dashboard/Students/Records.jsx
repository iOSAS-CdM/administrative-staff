import React from 'react';
import { useLocation } from 'react-router';

import {
	App,
	Table,
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
	Tag,
	Divider
} from 'antd';

import {
	RightOutlined,
	SearchOutlined,
	FilterOutlined,
	UnorderedListOutlined,
	TableOutlined,
	BankOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

import ItemCard from '../../../components/ItemCard';

import { MobileContext } from '../../../main';

const DisciplinaryRecords = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	const { mobile, setMobile } = React.useContext(MobileContext);

	const [category, setCategory] = React.useState('ongoing');
	const [filter, setFilter] = React.useState({
		severity: [],
		occurances: []
	});
	const [search, setSearch] = React.useState('');

	const [records, setRecords] = React.useState([]);
	const [categorizedRecords, setCategorizedRecords] = React.useState([]);
	const [filteredRecords, setFilteredRecords] = React.useState([]);
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
						occurances: Math.floor(Math.random() * 10) + 1
					},
					complainants: [...Array(5).keys().map(e => {
						const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];
						const programs = {
							'ics': ['BSCpE', 'BSIT'],
							'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
							'ibe': ['BSBA-HRM', 'BSE']
						};
						return {
							id: i + 1,
							name: {
								first: 'user.name.first',
								middle: 'user.name.middle',
								last: 'user.name.last'
							},
							email: 'user.email',
							phone: 'user.phone',
							studentId: id,
							institute: institute,
							program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
							year: Math.floor(Math.random() * 4) + 1,
							profilePicture: `https://randomuser.me/api/portraits/${['men', 'women'][i % 2]}/${Math.floor(Math.random() * 100)}.jpg`,
							placeholder: false,
							status: ['active', 'restricted', 'archived'][Math.floor(Math.random() * 3)]
						}
					})],
					complainees: [...Array(5).keys().map(e => {
						const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];
						const programs = {
							'ics': ['BSCpE', 'BSIT'],
							'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
							'ibe': ['BSBA-HRM', 'BSE']
						};
						return {
							id: i + 1,
							name: {
								first: 'user.name.first',
								middle: 'user.name.middle',
								last: 'user.name.last'
							},
							email: 'user.email',
							phone: 'user.phone',
							studentId: id,
							institute: ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)],
							program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
							year: Math.floor(Math.random() * 4) + 1,
							profilePicture: `https://randomuser.me/api/portraits/${['men', 'women'][i % 2]}/${Math.floor(Math.random() * 100)}.jpg`,
							placeholder: false,
							status: ['active', 'restricted', 'archived'][Math.floor(Math.random() * 3)]
						}
					})],
					placeholder: false,
					date: new Date(new Date().getFullYear(), new Date().getMonth(), new
						Date().getDate() - (Math.floor(Math.random() * 10) + 1))
				});
			};
			console.log(fetchedRecords);


			const sortedRecords = fetchedRecords.sort((a, b) => b.date - a.date);
			sortedRecords.forEach(record => {
				record.date = new Date(record.date);
			});

			setRecords(sortedRecords);
		}, remToPx(2));
	}, []);

	React.useEffect(() => {
		if (records.length > 0)
			setCategorizedRecords(records.filter(record => (
				(category === 'active' && record.tags.status !== 'archived')
				|| (category === record.tags.status)
				|| (category === 'archived' && record.tags.status === 'archived')
			)));
	}, [records, category]);

	React.useEffect(() => {
		const filtered = [];

		// Filter by severity and occurances
		for (const record of categorizedRecords) {
			if (filter.severity.length > 0 && !filter.severity.includes(record.tags.severity.toLowerCase())) continue; // Skip if severity does not match
			if (filter.occurances.length > 0 && (
				!filter.occurances.includes(record.tags.occurances) // Skip if the record does not match the exact occurances
				&& !(filter.occurances.includes('succeeding') && record.tags.occurances > 4) // Include if 'succeeding' is selected and occurances are greater than 4
			)) continue; // Skip if occurances do not match

			filtered.push(record);
	};

		setFilteredRecords(filtered);
	}, [categorizedRecords, filter]);

	React.useEffect(() => {
		if (search.trim() === '') {
			setDisplayedRecords(filteredRecords);
			return;
		};

		const searchTerm = search.toLowerCase();
		const searchedRecords = filteredRecords.filter(record => {
			const fullTitle = record.title.toLowerCase();
			const fullDescription = record.description.toLowerCase();
			return fullTitle.includes(searchTerm) || fullDescription.includes(searchTerm);
		});

		setDisplayedRecords([]);
		setTimeout(() => {
			setDisplayedRecords(searchedRecords);
		}, remToPx(0.5));
	}, [search, filteredRecords]);

	const [view, setView] = React.useState('card');

	React.useEffect(() => {
		setHeader({
			title: 'Disciplinary Records',
			actions: [
				<Flex style={{ flexGrow: mobile ? 1 : '' }} key='search'>
					<Input
						placeholder='Search'
						allowClear
						prefix={<SearchOutlined />}
						onChange={(e) => {
							const value = e.target.value;
							clearTimeout(window.recordDebounceTimer);
							const debounceTimer = setTimeout(() => {
								setSearch(value);
							}, remToPx(0.5));
							window.recordDebounceTimer = debounceTimer;
						}}
						style={{ width: '100%', minWidth: mobile ? '100%' : remToPx(20) }}
					/>
				</Flex>,
				<Flex gap={8}>
					{!mobile && (
						<Segmented
							options={[
								{ label: 'Active', value: 'active' },
								{ label: 'Ongoing', value: 'ongoing' },
								{ label: 'Resolved', value: 'resolved' },
								{ label: 'Archived', value: 'archived' }
							]}
							value={category}
							onChange={(value) => {
								setCategory(value);
							}}
						/>
					)}

					<Dropdown
						trigger={['click']}
						placement='bottomRight'
						arrow
						popupRender={(menu) => (
							<Card size='small'>
								<Flex vertical gap={8}>
									{mobile &&
										<Segmented
											options={[
											{ label: 'Active', value: 'active' },
												{ label: 'Ongoing', value: 'ongoing' },
												{ label: 'Resolved', value: 'resolved' },
												{ label: 'Archived', value: 'archived' }
											]}
											vertical
											value={category}
											onChange={(value) => {
												setCategory(value);
											}}
											style={{ width: '100%' }}
										/>
									}
									<Divider>
										<Text strong>Filters</Text>
									</Divider>
									<Flex vertical>
										<Text strong>Severity</Text>
										<Checkbox.Group
											onChange={(value) => {
												if (value.includes('minor') && value.includes('major') && value.includes('severe')) value = [];
												setFilter(prev => ({
													...prev,
													severity: value
												}));
											}}
											value={filter.severity}
										>
											<Flex vertical>
												<Checkbox value='minor'>Minor</Checkbox>
												<Checkbox value='major'>Major</Checkbox>
												<Checkbox value='severe'>Severe</Checkbox>
											</Flex>
										</Checkbox.Group>
									</Flex>

									<Flex vertical>
										<Text strong>Occurance</Text>
										<Checkbox.Group
											onChange={(value) => {
												if (value.includes(1) && value.includes(2) && value.includes(3) && value.includes(4) && value.includes('succeeding')) value = [];
												setFilter(prev => ({
													...prev,
													occurances: value
												}));
											}}
											value={filter.occurances}
										>
											<Flex vertical>
												<Checkbox value={1}>1st Offense</Checkbox>
												<Checkbox value={2}>2nd Offense</Checkbox>
												<Checkbox value={3}>3rd Offense</Checkbox>
												<Checkbox value={4}>4th Offense</Checkbox>
												<Checkbox value='succeeding'>Succeeding Offenses</Checkbox>
											</Flex>
										</Checkbox.Group>
									</Flex>

									<Button
										type='primary'
										size='small'
										onClick={() => {
											setCategory('active');
											setFilter({ severity: [], occurances: [] });
											setSearch('');
										}}
									>
										Reset
									</Button>
								</Flex>
							</Card>
						)}
					>
						<Button
							icon={<FilterOutlined />}
							onClick={(e) => e.stopPropagation()}
						/>
					</Dropdown>

					<Button
						icon={view === 'table' ? <UnorderedListOutlined /> : <TableOutlined />}
						onClick={() => {
							setView(view === 'table' ? 'card' : 'table');
						}}
					/>
				</Flex>,

				<Button
					type='primary'
					icon={<BankOutlined />}
				>
					Open a Case
				</Button>
			]
		});
	}, [setHeader, setSelectedKeys, category, filter, search, view, mobile]);

	return (
		<Flex vertical gap={16} style={{ width: '100%', height: '100%' }}>
			{/************************** Records **************************/}
			{displayedRecords.length > 0 ? (
				view === 'card' ? (
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
					<Table dataSource={displayedRecords} pagination={false} rowKey='recordId' style={{ minWidth: '100%' }}>
						<Table.Column title='ID' dataIndex='recordId' key='recordId' />
						<Table.Column title='Title' dataIndex='title' key='title' />
						<Table.Column title='Description' dataIndex='description' key='description' />
						<Table.Column title='Complainants' key='complainants' render={(text, record) => (
							<Avatar.Group>
								{record.complainants.map((complainant, index) => (
									<Avatar key={index} src={complainant.profilePicture} />
								))}
							</Avatar.Group>
						)} />
						<Table.Column title='Complainees' key='complainees' render={(text, record) => (
							<Avatar.Group>
								{record.complainees.map((complainee, index) => (
									<Avatar key={index} src={complainee.profilePicture} />
								))}
							</Avatar.Group>
						)} />
						<Table.Column title='Date' key='date' render={(text, record) => (
							<Text>
								{record.date.toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric'
								})}
							</Text>
						)} />
						<Table.Column title='Actions' key='actions' render={(text, record) => (
							<Button
								icon={<RightOutlined />}
								onClick={() => {
									navigate(`/dashboard/students/records/${record.recordId}`, {
										state: { student: record }
									});
								}}
							/>
						)} />
					</Table>
				)
			) : (
				<Flex justify='center' align='center' style={{ height: '100%' }}>
						<Empty description='No records found' />
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
		<ItemCard
			loading={loading}
			mounted={mounted}

			status={thisRecord.tags.status === 'archived' && 'archived'}

			actions={[
				{
					content: (
						<Avatar.Group
							max={{
								count: 4
							}}
						>
							{thisRecord.complainants.map((complainant, index) => (
								<Avatar
									key={index}
									src={complainant.profilePicture}
									style={{ cursor: 'pointer' }}
									onClick={() => {
										navigate(`/dashboard/students/profiles/${complainant.studentId}`, {
											state: { student: complainant }
										});
									}}
								/>
							))}
							{thisRecord.complainees.map((complainee, index) => (
								<Avatar
									key={index}
									src={complainee.profilePicture}
									style={{ cursor: 'pointer' }}
									onClick={() => {
										navigate(`/dashboard/students/profiles/${complainee.studentId}`, {
											state: { student: complainee }
										});
									}}
								/>
							))}
						</Avatar.Group>
					)
				},
				{
					content: (
						<Text>
							{thisRecord.date.toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric'
							})}
						</Text>
					)
				},
				{
					content: <RightOutlined />,
					onClick: () => {
						if (thisRecord.placeholder) {
							Modal.error({
								title: 'Error',
								content: 'This is a placeholder student record. Please try again later.',
								centered: true
							});
						} else {
							navigate(`/dashboard/students/records/${thisRecord.recordId}`, {
								state: { student: thisRecord }
							});
						};
					}
				}
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
		</ItemCard>
	);
};
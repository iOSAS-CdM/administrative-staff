import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Input,
	Button,
	Segmented,
	Popover,
	Flex,
	Empty,
	Row,
	Col,
	Avatar,
	Typography,
	Checkbox,
	Tag,
	Badge,
	Divider
} from 'antd';

import {
	RightOutlined,
	SearchOutlined,
	FilterOutlined,
	BankOutlined,
	ExclamationCircleOutlined,
	WarningOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

import ItemCard from '../../../components/ItemCard';

import { MobileContext } from '../../../main';

import NewCase from '../../../modals/NewCase';

import Record from '../../../classes/Record';
import Student from '../../../classes/Student';

const Filters = ({ filter, setFilter }) => (
	<Flex vertical gap={8}>
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

		<Button
			type='primary'
			size='small'
			onClick={() => {
				setFilter({ severity: [] });
			}}
		>
			Reset
		</Button>
	</Flex>
);

/** @typedef {Record[], React.Dispatch<React.SetStateAction<Record[]>>} RecordsState */

const DisciplinaryRecords = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	const { mobile, setMobile } = React.useContext(MobileContext);

	/** @typedef {'ongoing' | 'resolved' | 'active' | 'archived'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState('ongoing');
	/**
	 * @typedef {{
	 * 		severity: import('../../../classes/Record').RecordSeverity[]
	 * 	}} Filter
	 */
	/** @type {[Filter, React.Dispatch<React.SetStateAction<Filter>>]} */
	const [filter, setFilter] = React.useState({
		severity: []
	});
	/** @type {[String, React.Dispatch<React.SetStateAction<String>>]} */
	const [search, setSearch] = React.useState('');

	/** @type {RecordsState} */
	const [records, setRecords] = React.useState([]);
	/** @type {RecordsState} */
	const [categorizedRecords, setCategorizedRecords] = React.useState([]);
	/** @type {RecordsState} */
	const [filteredRecords, setFilteredRecords] = React.useState([]);
	/** @type {RecordsState} */
	const [displayedRecords, setDisplayedRecords] = React.useState([]);

	React.useEffect(() => {
		/** @type {Record[]} */
		const placeholderRecords = [];
		for (let i = 0; i < 20; i++) {
			const id = `placeholder-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;
			if (records.some(record => record.id === id))
				continue;
			const placeholderRecord = new Record({
				id: id,
				violation: `Placeholder Record ${i + 1}`,
				description: `This is a placeholder record for testing purposes. Record number ${i + 1}.`,
				tags: {
					status: 'ongoing',
					severity: 'Minor'
				},
				complainants: [],
				complainees: [],
				placeholder: true,
				date: new Date()
			});
			placeholderRecords.push(placeholderRecord);
		};
		setRecords(placeholderRecords);

		setTimeout(() => {
			/** @type {Record[]} */
			const fetchedRecords = [];

			for (let i = 0; i < 40; i++) {
				const id = `record-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;
				if (records.some(record => record.id === id))
					continue;

				const complainants = [];
				for (let j = 0; j < 10; j++) {
					const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];
					const programs = {
						'ics': ['BSCpE', 'BSIT'],
						'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
						'ibe': ['BSBA-HRM', 'BSE']
					};
					const student = new Student({
						id: Math.floor(Math.random() * 1000) + 1,
						name: {
							first: 'user.name.first',
							middle: 'user.name.middle',
							last: 'user.name.last'
						},
						email: 'user.email',
						phone: 'user.phone',
						studentId: id + `-${Math.floor(Math.random() * 1000) + 1}`,
						institute: institute,
						program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
						year: Math.floor(Math.random() * 4) + 1,
						profilePicture: `https://randomuser.me/api/portraits/${['men', 'women'][j % 2]}/${Math.floor(Math.random() * 100)}.jpg`,
						placeholder: false,
						status: ['active', 'restricted', 'archived'][Math.floor(Math.random() * 3)]
					});
					complainants.push(student);
				};
				const complainees = [];
				for (let j = 0; j < 10; j++) {
					const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];
					const programs = {
						'ics': ['BSCpE', 'BSIT'],
						'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
						'ibe': ['BSBA-HRM', 'BSE']
					};
					const student = new Student({
						id: Math.floor(Math.random() * 1000) + 1,
						name: {
							first: 'user.name.first',
							middle: 'user.name.middle',
							last: 'user.name.last'
						},
						email: 'user.email',
						phone: 'user.phone',
						studentId: id + `-${Math.floor(Math.random() * 1000) + 1}`,
						institute: institute,
						program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
						year: Math.floor(Math.random() * 4) + 1,
						profilePicture: `https://randomuser.me/api/portraits/${['men', 'women'][i % 2]}/${Math.floor(Math.random() * 100)}.jpg`,
						placeholder: false,
						status: ['active', 'restricted', 'archived'][Math.floor(Math.random() * 3)]
					});
					complainees.push({
						occurrence: j + 1,
						student: student
					});
				};
				const record = new Record({
					id: id,
					violation: `Record ${i + 1}`,
					description: `This is a record for testing purposes. Record number ${i + 1}.`,
					tags: {
						status: ['ongoing', 'resolved', 'archived'][Math.floor(Math.random() * 3)],
						severity: ['Minor', 'Major', 'Severe'][Math.floor(Math.random() * 3)]
					},
					complainants: complainants,
					complainees: complainees,
					placeholder: false,
					date: new Date(new Date().getFullYear(), new Date().getMonth(), new
						Date().getDate() - (Math.floor(Math.random() * 10) + 1))
				});

				fetchedRecords.push(record);
			};

			const sortedRecords = fetchedRecords.sort((a, b) => b.date - a.date);
			sortedRecords.forEach(record => {
				record.date = new Date(record.date);
			});

			setRecords(sortedRecords);
		}, remToPx(200));
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
		/** @type {Record[]} */
		const filtered = [];

		// Filter by severity
		for (const record of categorizedRecords) {
			if (filter.severity.length > 0 && !filter.severity.includes(record.tags.severity.toLowerCase())) continue; // Skip if severity does not match

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
			const fullTitle = record.violation.toLowerCase();
			const fullDescription = record.description.toLowerCase();
			return fullTitle.includes(searchTerm) || fullDescription.includes(searchTerm);
		});

		setDisplayedRecords([]);
		setTimeout(() => {
			setDisplayedRecords(searchedRecords);
		}, remToPx(0.5));
	}, [search, filteredRecords]);

	const app = App.useApp();
	const Modal = app.modal;

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
				/>,
				<>
					{!mobile ? (
						<Popover
							trigger={['click']}
							placement='bottomRight'
							arrow
							content={<Filters filter={filter} setFilter={setFilter} />}
						>
						<Button
							icon={<FilterOutlined />}
							onClick={(e) => e.stopPropagation()}
						/>
						</Popover>
					) : <Filters filter={filter} setFilter={setFilter} />}
				</>,
				<Button
					type='primary'
					icon={<BankOutlined />}
					onClick={() => {
						NewCase(Modal);
					}}
				>
					Open a new Case
				</Button>
			]
		});
	}, [setHeader, setSelectedKeys, category, filter, search, mobile]);

	return (
		<Flex vertical gap={16} style={{ width: '100%', height: '100%' }}>
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
					<Empty description='No records found' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
			)}
		</Flex>
	);
};

export default DisciplinaryRecords;

/**
 * @param {{
 * 	record: Record,
 * 	animationDelay: Number,
 * 	loading: Boolean,
 * 	navigate: ReturnType<typeof useNavigate>
 * }} param0
 * @returns 
 */
const RecordCard = ({ record, animationDelay, loading, navigate }) => {
	const [mounted, setMounted] = React.useState(false);

	/** @type {[Record, React.Dispatch<React.SetStateAction<Record[]>>]} */
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
		<Badge.Ribbon
			text={thisRecord.tags.status.charAt(0).toUpperCase() + thisRecord.tags.status.slice(1)}
			color={
				{
					ongoing: 'blue',
					resolved: 'green',
					archived: 'grey'
				}[thisRecord.tags.status] || 'transparent'
			}
			style={{ display: loading ? 'none' : '' }}
		>
			<ItemCard
				loading={loading}
				mounted={mounted}

				status={thisRecord.tags.status === 'archived' && 'archived'}

				title={!loading && (
					<Title level={3}>
						{
							{
								minor: null,
								major: <WarningOutlined style={{ color: 'orange' }} title='Major Violation' />,
								severe: <ExclamationCircleOutlined style={{ color: 'red' }} title='Severe Violation' />
							}[thisRecord.tags.severity.toLowerCase()] || ''
						} {thisRecord.violation}
					</Title>
				)}

				actions={!loading && [
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
									<Badge
										key={index}
										title={`${{ 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[complainee.occurrence] || `${complainee.occurrence}th`} Offense`}
										count={complainee.occurrence}
										color={['blue', 'purple', 'red'][complainee.occurrence - 1] || 'red'}
									>
										<Avatar
											src={complainee.student.profilePicture}
											style={{ cursor: 'pointer' }}
											onClick={() => {
												navigate(`/dashboard/students/profiles/${complainee.student.studentId}`, {
													state: { student: complainee.student }
												});
											}}
										/>
									</Badge>
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
							if (loading) {
								Modal.error({
									title: 'Error',
									content: 'This is a placeholder disciplinary record. Please try again later.',
									centered: true
								});
							} else {
								navigate(`/dashboard/students/records/${thisRecord.id}`, {
									state: { record: thisRecord }
								});
							};
						}
					}
				]}
			>
				{!loading && (
					<Flex vertical justify='flex-start' align='flex-start' gap={16} style={{ position: 'relative' }}>
						<Text>
							{thisRecord.description}
						</Text>
					</Flex>
				)}
			</ItemCard>
		</Badge.Ribbon>
	);
};
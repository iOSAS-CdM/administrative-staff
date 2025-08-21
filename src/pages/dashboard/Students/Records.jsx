import React from 'react';
import { useNavigate, useRoutes } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

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
	Spin,
	Badge,
	Divider
} from 'antd';

import {
	SearchOutlined,
	FilterOutlined,
	BankOutlined,
	ExclamationCircleOutlined,
	WarningOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

import ItemCard from '../../../components/ItemCard';

import { MobileContext, OSASContext } from '../../../main';

import NewCase from '../../../modals/NewCase';

import Record from '../../../classes/Record';

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

	const { mobile } = React.useContext(MobileContext);
	const { osas } = React.useContext(OSASContext);

	/** @typedef {'ongoing' | 'resolved' | 'active' | 'archived'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState(location.pathname.split('/').pop());
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
	const filteredRecords = React.useMemo(() => {
		/** @type {Record[]} */
		const filtered = [];

		// Filter by severity
		for (const record of osas.records) {
			if (filter.severity.length > 0 && !filter.severity.includes(record.tags.severity.toLowerCase())) continue; // Skip if severity does not match

			filtered.push(record);
		};

		if (search.trim() !== '') {
			const searchTerm = search.toLowerCase().trim();
			return filtered.filter(record => {
				return (
					record.violation.toLowerCase().includes(searchTerm) ||
					record.description.toLowerCase().includes(searchTerm)
				);
			});
		};

		return filtered;
	}, [osas.records, filter, search]);

	/**
	 * @type {{
	 * 	active: Record[],
	 * 	ongoing: Record[],
	 * 	resolved: Record[],
	 * 	archived: Record[]
	 * }}
	 */
	const categorizedRecords = React.useMemo(() => {
		const categorized = {
			active: [],
			ongoing: [],
			resolved: [],
			archived: []
		};

		for (const record of filteredRecords) {
			categorized[record.tags.status].push(record);
			if (record.tags.status !== 'archived')
				categorized.active.push(record);
		};

		return categorized;
	}, [filteredRecords]);

	const routes = useRoutes([
		{ path: '/active', element: <CategoryPage categorizedRecords={categorizedRecords.active} /> },
		{ path: '/ongoing', element: <CategoryPage categorizedRecords={categorizedRecords.ongoing} /> },
		{ path: '/resolved', element: <CategoryPage categorizedRecords={categorizedRecords.resolved} /> },
		{ path: '/archived', element: <CategoryPage categorizedRecords={categorizedRecords.archived} /> }
	]);

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
							}, 8); // 2^3
							window.recordDebounceTimer = debounceTimer;
						}}
						style={{ width: '100%', minWidth: mobile ? '100%' : 256 }} // 2^8
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
						navigate(`/dashboard/students/records/${value}`);
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
		<Flex vertical gap={16} style={{ width: '100%' }}>
			{routes}
		</Flex>
	);
};

export default DisciplinaryRecords;

/**
 * @param {{
 * 	record: Record,
 * 	loading: Boolean,
 * 	navigate: ReturnType<typeof useNavigate>
 * }} props
 * @returns 
 */
const RecordCard = ({ record, loading, navigate }) => {
	/** @type {[Record, React.Dispatch<React.SetStateAction<Record[]>>]} */
	const [thisRecord, setThisRecord] = React.useState(record);

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
					resolved: 'var(--primary)',
					archived: 'grey'
				}[thisRecord.tags.status] || 'transparent'
			}
			style={{ display: loading || thisRecord.tags.status === 'archived' ? 'none' : '' }}
		>
			<ItemCard
				loading={loading}

				status={thisRecord.tags.status === 'archived' && 'archived'}

				actions={!loading && [
					{
						content: (
							<Avatar.Group
								max={{
									count: 3
								}}
							>
								{thisRecord.complainants.map((complainant, index) => (
									<Avatar
										key={index}
										src={complainant.profilePicture}
										style={{ cursor: 'pointer' }}
										onClick={(e) => {
											e.stopPropagation();
											navigate(`/dashboard/students/profile/${complainant.studentId}`);
										}}
									/>
								))}
								{thisRecord.complainees.map((complainee, index) => (
									<Badge
										key={index}
										title={`${{ 1: '1st', 2: '2nd', 3: '3rd', 4: '4th' }[complainee.occurrence] || `${complainee.occurrence}th`} Offense`}
										count={complainee.occurrence}
										color={['yellow', 'orange', 'red'][complainee.occurrence - 1] || 'red'}
									>
										<Avatar
											src={complainee.student.profilePicture}
											style={{ cursor: 'pointer' }}
											onClick={(e) => {
												e.stopPropagation();
												navigate(`/dashboard/students/profile/${complainee.student.studentId}`);
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
					}
				]}

				onClick={() => {
					if (loading) {
						Modal.error({
							title: 'Error',
							content: 'This is a placeholder disciplinary record. Please try again later.',
							centered: true
						});
					} else {
						navigate(`/dashboard/students/record/${thisRecord.id}`);
					};
				}}
			>
				{!loading && (
					<Flex vertical justify='flex-start' align='flex-start' gap={16} style={{ position: 'relative' }}>
						<Title level={3}>
							{
								{
									minor: null,
									major: <WarningOutlined style={{ color: 'orange' }} title='Major Violation' />,
									severe: <ExclamationCircleOutlined style={{ color: 'red' }} title='Severe Violation' />
								}[thisRecord.tags.severity.toLowerCase()] || ''
							} {thisRecord.violation}
						</Title>
						<Paragraph>{thisRecord.description}</Paragraph>
					</Flex>
				)}
			</ItemCard>
		</Badge.Ribbon>
	);
};

export { RecordCard };

/**
 * @param {{
 * 	categorizedRecords: Record[];
 * }} props
 * @returns {JSX.Element}
 */
const CategoryPage = ({ categorizedRecords }) => {
	const navigate = useNavigate();
	const { mobile } = React.useContext(MobileContext);
	const { osas } = React.useContext(OSASContext);
	return (
		<>
			{categorizedRecords.length > 0 ? (
				<Row gutter={[16, 16]}>
					<AnimatePresence mode='popLayout'>
						{categorizedRecords.map((record, index) => (
							<Col key={record.id} span={!mobile ? 12 : 24}>
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<RecordCard
										record={record}
										loading={record.placeholder}
										navigate={navigate}
									/>
								</motion.div>
							</Col>
						))}
					</AnimatePresence>
				</Row>
			) : (
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
					{osas.records.length !== 0 ? (
						<Spin />
					) : (
						<Empty description='No records found' />
					)}
				</div>
			)}
		</>
	);
};
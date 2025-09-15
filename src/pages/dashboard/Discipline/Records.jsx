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
	Avatar,
	Typography,
	Checkbox,
	Tag,
	Badge,
	Divider
} from 'antd';

import ContentPage from '../../../components/ContentPage';

import {
	FilterOutlined,
	BankOutlined,
	ExclamationCircleOutlined,
	WarningOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

import ItemCard from '../../../components/ItemCard';

import { API_Route, MobileContext } from '../../../main';
import { useCache } from '../../../contexts/CacheContext';

import Record from '../../../classes/Record';
import authFetch from '../../../utils/authFetch';

import NewCase from '../../../modals/NewCase';

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
	const { cache, pushToCache } = useCache();

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
		for (const record of cache?.records) {
			if (filter.severity.length > 0 && !filter.severity.includes(record.tags.severity.toLowerCase())) continue; // Skip if severity does not match

			filtered.push(record);
		};

		if (search.trim() !== '') {
			const searchTerm = search.toLowerCase().trim();
			return filtered.filter(record => {
				return (
					record.title.toLowerCase().includes(searchTerm) ||
					record.description.toLowerCase().includes(searchTerm) ||
					record.violations.some(violation => violation.toLowerCase().includes(searchTerm))
				);
			});
		};

		return filtered;
	}, [cache.records, filter, search]);

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

	// const routes = useRoutes([
	// 	{ path: '/active', element: <CategoryPage categorizedRecords={categorizedRecords.active} /> },
	// 	{ path: '/ongoing', element: <CategoryPage categorizedRecords={categorizedRecords.ongoing} /> },
	// 	{ path: '/resolved', element: <CategoryPage categorizedRecords={categorizedRecords.resolved} /> },
	// 	{ path: '/archived', element: <CategoryPage categorizedRecords={categorizedRecords.archived} /> }
	// ]);

	const app = App.useApp();
	const Modal = app.modal;

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Disciplinary Records',
			actions: [
				<Flex style={{ flexGrow: mobile ? 1 : '' }} key='search'>
					<Input.Search
						placeholder='Search'
						allowClear
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
						navigate(`/dashboard/discipline/records/${value}`);
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
		<ContentPage
			fetchUrl={`${API_Route}/records/`}
			emptyText='No records found'
			cacheKey='records'
			transformData={(data) => data.records || []}
			totalItems={cache.records?.filter(record => record.tags.status === 'ongoing').length + 1 || 0}
			renderItem={(record) => (
				<RecordCard
					record={record}
					loading={record.placeholder}
					navigate={navigate}
				/>
			)}
		/>
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

	const { cache, pushToCache } = useCache();

	React.useEffect(() => {
		if (record) {
			setThisRecord(record);
		};
	}, [record]);

	const app = App.useApp();
	const Modal = app.modal;

	/** @type {[import('../../../classes/Student').StudentProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Student').StudentProps[]>>]} */
	const [participants, setParticipants] = React.useState([]);
	React.useEffect(() => {
		const fetchedParticipants = [];
		for (const participant of [...thisRecord.complainants, ...thisRecord.complainees]) {
			if (cache.peers.find(peer => peer.id === participant)) {
				fetchedParticipants.push(cache.peers.find(peer => peer.id === participant));
				continue;
			};
		};

		const controllers = [];
		const fetchParticipants = async () => {
			for (const participant of [...thisRecord.complainants, ...thisRecord.complainees]) {
				if (fetchedParticipants.find(peer => peer.id === participant)) continue;

				const controller = new AbortController();
				controllers.push(controller);
				const request = await authFetch(`${API_Route}/users/student/${participant}/`, { signal: controller.signal });
				if (!request?.ok) continue;

				/** @type {import('../../../classes/Student').StudentProps} */
				const data = await request.json();
				if (!data) continue;

				fetchedParticipants.push(data);
				pushToCache('peers', [data], true);
			};

			setParticipants(fetchedParticipants);
		};
		fetchParticipants();

		return () => controllers.forEach(controller => controller.abort());
	}, [thisRecord]);

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
								{participants.map((complainant, index) => (
									<Avatar
										key={index}
										src={complainant?.profilePicture}
										style={{ cursor: 'pointer' }}
										onClick={(e) => {
											e.stopPropagation();
											navigate(`/dashboard/students/profile/${complainant?.id}`);
										}}
									/>
								))}
							</Avatar.Group>
						)
					},
					{
						content: (
							<Text>
								{new Date(thisRecord.date).toLocaleDateString('en-US', {
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
						navigate(`/dashboard/discipline/record/${thisRecord.id}`);
					};
				}}
			>
				{!loading && (
					<Flex vertical justify='flex-start' align='flex-start' gap={16} style={{ position: 'relative' }}>
						<Title level={3}>
							{
								{
									minor: null,
									major: <WarningOutlined style={{ color: 'orange' }} title='Major violations' />,
									severe: <ExclamationCircleOutlined style={{ color: 'red' }} title='Severe violations' />
								}[thisRecord.tags.severity.toLowerCase()] || ''
							} {thisRecord.title}
						</Title>
						<Paragraph>{thisRecord.description}</Paragraph>
						<Flex wrap gap={8}>
							{thisRecord.violations.map((violation, index) => (
								<Tag
									key={index}
									style={{ color: 'white' }}
								>
									{violation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
								</Tag>
							))}
						</Flex>
					</Flex>
				)}
			</ItemCard>
		</Badge.Ribbon>
	);
};

export { RecordCard };
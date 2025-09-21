import React from 'react';
import { useNavigate } from 'react-router';

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
	Divider,
	Dropdown,
	Spin
} from 'antd';

import ContentPage from '../../../components/ContentPage';

import {
	FilterOutlined,
	BankOutlined,
	ExclamationCircleOutlined,
	WarningOutlined,
	UserOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

import ItemCard from '../../../components/ItemCard';

import { API_Route } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

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

/**
 * @type {React.FC}
 */
const DisciplinaryRecords = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	React.useEffect(() => {
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	const isMobile = useMobile();
	const { cache, pushToCache } = useCache();

	/** @typedef {'ongoing' | 'resolved' | 'archived'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState(location.pathname.split('/').pop());

	const [search, setSearch] = React.useState('');
	/** @type {[import('../../../classes/Record').RecordProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Record').RecordProps[]>>]} */
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearching] = React.useState(false);
	
	React.useEffect(() => {
		const controller = new AbortController();
		const fetchSearchResults = async () => {
			if (search.length === 0) return setSearchResults([]);

			// Fetch records from the backend
			setSearching(true);
			const request = await authFetch(`${API_Route}/records/search?q=${encodeURIComponent(search)}`, { signal: controller.signal });
			if (!request?.ok) return;

			/** @type {{records: import('../../../classes/Record').RecordProps[], length: Number}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.records)) return;
			setSearchResults(data.records);
			setSearching(false);
			pushToCache('records', data.records, false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search]);

	const app = App.useApp();
	const Modal = app.modal;

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Disciplinary Records',
			actions: [
				<Flex style={{ flexGrow: isMobile ? 1 : '' }} key='search'>
					<Dropdown
						showArrow={false}
						open={search.length > 0}
						position='bottomRight'
						placement='bottomRight'
						menu={{
							items: searchResults.length > 0 ? searchResults.map((record) => ({
								key: record.id,
								label: (
									<div
										style={{ width: '100%' }}
									>
										<Flex justify='space-between' align='center' gap={8}>
											<Text>{record.title}</Text>
											<Tag color={record.tags.status === 'ongoing' ? 'blue' : record.tags.status === 'resolved' ? 'var(--primary)' : 'gray'}><Text style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{record.tags.status.charAt(0).toUpperCase() + record.tags.status.slice(1)}</Text></Tag>
										</Flex>
									</div>
								)
							})) : [{
								key: 'no-results',
								label: <Text>No results found</Text>,
								disabled: true
							}],
							placement: 'bottomRight',
							style: { width: isMobile ? '100%' : 300, maxHeight: 400, overflowY: 'auto' },
							emptyText: 'No results found',
							onClick: (e) => {
								setSearch('');
								navigate(`/dashboard/discipline/record/${e.key}`);
							}
						}}
					>
						<Input.Search
							placeholder='Search'
							allowClear
							suffix={searching ? <Spin size='small' /> : null}
							onChange={(e) => {
								const value = e.target.value;
								clearTimeout(window.recordDebounceTimer);
								const debounceTimer = setTimeout(() => {
									setSearch(value);
								}, 512);
								window.recordDebounceTimer = debounceTimer;
							}}
							style={{ width: '100%', minWidth: isMobile ? '100%' : 256 }} // 2^8
						/>
					</Dropdown>
				</Flex>,
				<Segmented
					options={[
						{ label: 'Ongoing', value: 'ongoing' },
						{ label: 'Resolved', value: 'resolved' },
						{ label: 'Archived', value: 'archived' }
					]}
					value={category}
					onChange={(value) => {
						setCategory(value);
					}}
				/>,
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
	}, [setHeader, setSelectedKeys, category, search, isMobile]);

	return (
		<ContentPage
			fetchUrl={`${API_Route}/records?status=${category}`}
			emptyText='No records found'
			cacheKey='records'
			transformData={(data) => data.records || []}
			totalItems={cache.records?.filter(record => record.tags.status === 'ongoing').length + 1 || 0}
			renderItem={(record) => (
				<RecordCard
					record={record}
					loading={record.placeholder}
				/>
			)}
		/>
	);
};

export default DisciplinaryRecords;

/**
 * @type {React.FC<{
 * 	record: Record,
 * 	loading: Boolean
 * }>}
 */
const RecordCard = ({ record, loading }) => {
	/** @type {[Record, React.Dispatch<React.SetStateAction<Record[]>>]} */
	const [thisRecord, setThisRecord] = React.useState(record);
	const navigate = useNavigate();

	const { cache, pushToCache } = useCache();

	React.useEffect(() => {
		if (record) {
			setThisRecord(record);
		};
	}, [record]);

	const app = App.useApp();
	const Modal = app.modal;

	/** @type {[string[], React.Dispatch<React.SetStateAction<string[]>>]} */
	const [unfetchedParticipants, setUnfetchedParticipants] = React.useState([]);
	/** @type {[import('../../../classes/Student').StudentProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Student').StudentProps[]>>]} */
	const [participants, setParticipants] = React.useState([]);
	React.useEffect(() => {
		const currentUnfechedParticipants = [...thisRecord.complainants, ...thisRecord.complainees.map(part => part.id)];
		const currentParticipants = [];
		for (const participantId of currentUnfechedParticipants) {
			// Check if the participant is already in the cache
			const cachedParticipant = cache.peers.find(peer => peer.id === participantId);
			if (cachedParticipant) {
				currentParticipants.push(cachedParticipant);
				currentUnfechedParticipants.splice(currentUnfechedParticipants.indexOf(participantId), 1);
				continue;
			};
		};
		setParticipants(currentParticipants);
		setUnfetchedParticipants(currentUnfechedParticipants);
		if (currentUnfechedParticipants.length === 0) return;
		const controller = new AbortController();

		// Fetch remaining participants from the backend
		const fetchParticipants = async () => {
			const request = await authFetch(`${API_Route}/users/students/batch?ids=${currentUnfechedParticipants.join('&ids=')}`, { signal: controller.signal });
			if (!request?.ok) return;

			/** @type {{students: import('../../../classes/Student').StudentProps[]}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) return;

			for (const student of data.students) {
				if (!student || !student.id) continue;
				currentParticipants.push(student);
				currentUnfechedParticipants.splice(currentUnfechedParticipants.indexOf(student.id), 1);
			};
			setParticipants([...currentParticipants]);
			setUnfetchedParticipants([...currentUnfechedParticipants]);
			pushToCache('peers', data.students, false);
		};
		fetchParticipants();
	
		return () => controller.abort();
	}, []);

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
									<Popover
										key={complainant.id || index}
										content={<Text>{complainant?.name.first} {complainant?.name.last}</Text>}
										placement='top'
									>
										<Avatar
											src={complainant?.profilePicture}
											style={{ cursor: 'pointer' }}
											onClick={(e) => {
												e.stopPropagation();
												navigate(`/dashboard/students/profile/${complainant?.id}`);
											}}
										/>
									</Popover>
								))}
								{unfetchedParticipants.map((participant, index) => (
									<Popover
										key={index}
										content={<Text>{participant}</Text>}
										placement='top'
									>
										<Avatar
											onClick={(e) => { }}
											icon={<UserOutlined />}
										/>
									</Popover>
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
									major: <WarningOutlined style={{ color: 'orange' }} title='Major violation' />,
									severe: <ExclamationCircleOutlined style={{ color: 'red' }} title='Severe violation' />
								}[thisRecord.tags.severity.toLowerCase()] || ''
							} {thisRecord.title}
						</Title>
						<Paragraph>{thisRecord.description}</Paragraph>
						<Flex wrap gap={8}>
							<Tag>
								{thisRecord.violation?.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
							</Tag>
						</Flex>
					</Flex>
				)}
			</ItemCard>
		</Badge.Ribbon>
	);
};

export { RecordCard };
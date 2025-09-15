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
	WarningOutlined,
	UserOutlined
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

	/** @typedef {'ongoing' | 'resolved' | 'archived'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState(location.pathname.split('/').pop());
	/** @type {[String, React.Dispatch<React.SetStateAction<String>>]} */
	const [search, setSearch] = React.useState('');

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
	}, [setHeader, setSelectedKeys, category, search, mobile]);

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
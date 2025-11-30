import React from 'react';
import { useNavigate } from 'react-router';
import dayjs from 'dayjs';

import {
	Card,
	Flex,
	Button,
	Calendar,
	Skeleton,
	Typography,
	Input,
	Dropdown,
	App,
	Row,
	Col,
	Empty,
	Badge
} from 'antd';

import {
	PlusOutlined
} from '@ant-design/icons';

import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

import NewCase from '../../../modals/NewCase';
import Announcement from '../../../classes/Announcement';
import Record from '../../../classes/Record';
import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

const { Text, Title } = Typography;

/**
 * @type {React.FC}
 */
const CalendarPage = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const isMobile = useMobile();
	const { cache, updateCache } = useCache();
	const [search, setSearch] = React.useState('');

	/** @type {[Announcement[], React.Dispatch<React.SetStateAction<Announcement[]>>]} */
	const [announcements, setAnnouncements] = React.useState([]);

	/** @type {[Record[], React.Dispatch<React.SetStateAction<Record[]>>]} */
	const [records, setRecords] = React.useState([]);

	/** @type {[Announcement[], React.Dispatch<React.SetStateAction<Announcement[]>>]} */
	const [searchedEvents, setSearchedEvents] = React.useState([]);

	const [dropdownOpen, setDropdownOpen] = React.useState(false);
	const [loading, setLoading] = React.useState(true);
	const [selectedDate, setSelectedDate] = React.useState(dayjs());

	const app = App.useApp();
	const Modal = app.modal;
	const { message } = app;

	// Fetch events and records
	React.useEffect(() => {
		const controller = new AbortController();
		const fetchData = async () => {
			try {
				setLoading(true);

				// Check cache first
				if (cache.events && cache.events.length > 0 && cache.records && cache.records.length > 0) {
					setAnnouncements(cache.events);
					setRecords(cache.records);
					setLoading(false);
				}

				const response = await authFetch(`${API_Route}/events/staff`, {
					signal: controller.signal
				});

				if (!response.ok)
					throw new Error('Failed to fetch calendar data');

				const data = await response.json();

				// Transform announcements
				const announcementsData = data.announcements.map(a => new Announcement({
					id: a.id,
					title: a.title,
					description: a.description,
					cover: a.cover,
					content: a.content,
					date: new Date(a.created_at),
					type: a.type,
					event_date: a.event_date ? new Date(a.event_date) : null,
					author: a.author
				}));

				// Transform records
				const recordsData = data.records?.map(r => new Record({
					id: r.id,
					title: r.title,
					violation: r.violation,
					description: r.description,
					tags: r.tags,
					date: new Date(r.date),
					complainants: r.complainants || [],
					complainees: r.complainees || [],
					author: r.author,
					coauthors: r.coauthors || [],
					raw: r.raw || false
				})) || [];

				setAnnouncements(announcementsData);
				setRecords(recordsData);

				// Save to cache
				updateCache('events', announcementsData);
				updateCache('records', recordsData);
			} catch (error) {
				if (error.name !== 'AbortError') {
					message.error('Failed to load calendar data');
					console.error(error);
				};
			} finally {
				setLoading(false);
			};
		};

		fetchData();

		return () => controller.abort();
	}, []);

	// Filter events by search
	React.useEffect(() => {
		if (search) {
			const filtered = [...announcements, ...records].filter(item => {
				const title = item.title?.toLowerCase() || '';
				const description = item.description?.toLowerCase() || '';
				const searchLower = search.toLowerCase();
				return title.includes(searchLower) || description.includes(searchLower);
			});
			setSearchedEvents(filtered);
		} else {
			setSearchedEvents([]);
		}
	}, [search, announcements, records]);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Calendar',
			actions: [
				<Input.Search
					key='search'
					placeholder='Search events'
					onChange={e => setSearch(e.target.value)}
					style={{ width: 200 }}
					allowClear
				/>,
				<Dropdown
					key='create'
					arrow
					menu={{
						items: [
							{
								key: 'create-disciplinary-record',
								label: 'Disciplinary Record',
								onClick: async () => {
									await NewCase(Modal, message);
								}
							},
							{
								key: 'create-announcement',
								label: 'Announcement',
								onClick: () => navigate('/dashboard/utilities/announcements/new')
							}
						]
					}}
				>
					<Button
						type='primary'
						icon={<PlusOutlined />}
					>
						Create
					</Button>
				</Dropdown>
			]
		});
	}, [setHeader, navigate, Modal, message]);

	React.useEffect(() => {
		setSelectedKeys(['calendar']);
	}, [setSelectedKeys]);

	// Get events for a specific date
	const getEventsForDate = (date) => {
		const dateStr = date.format('YYYY-MM-DD');
		const events = [];

		// Add announcements with event dates
		for (const announcement of announcements) {
			// If announcement has an event_date, treat as event
			if (announcement.event_date) {
				const event_dateStr = dayjs(announcement.event_date).format('YYYY-MM-DD');
				if (event_dateStr === dateStr)
					events.push({ ...announcement, type: 'announcement' });
			} else {
				// Otherwise, use created_at date for non-event announcements
				const createdDateStr = dayjs(announcement.date || announcement.created_at).format('YYYY-MM-DD');
				if (createdDateStr === dateStr)
					events.push({ ...announcement, type: 'announcement', isGeneral: true });
			}
		}

		// Add records
		for (const record of records) {
			const recordDateStr = dayjs(record.date).format('YYYY-MM-DD');
			if (recordDateStr === dateStr)
				events.push({ ...record, type: 'record' });
		};

		return events;
	};

	// Custom cell renderer for calendar dates
	const dateCellRender = (date) => {
		const events = getEventsForDate(date);

		if (events.length === 0) return null;

		return (
			<ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
				{events.slice(0, 3).map((event, index) => (
					<li key={index}>
						<Badge
							status={event.type === 'announcement' ? (event.isGeneral ? 'processing' : 'success') : 'error'}
							text={
								<Text
									ellipsis
									style={{
										fontSize: '12px',
										maxWidth: '100px',
										display: 'inline-block'
									}}
								>
									{event.title}
								</Text>
							}
						/>
					</li>
				))}
				{events.length > 3 && (
					<li>
						<Text type='secondary' style={{ fontSize: '11px' }}>
							+{events.length - 3} more
						</Text>
					</li>
				)}
			</ul>
		);
	};

	// Full cell renderer for mobile (similar to Profile.jsx)
	const fullCellRender = (date, info) => {
		if (info.type === 'date') {
			const events = getEventsForDate(date);
			const eventCount = events.length;

			return (
				<Badge
					color={
						date.month() === selectedDate.month() &&
							date.year() === selectedDate.year()
							? ['green', 'orange', 'red'][eventCount - 1] || 'red'
							: 'grey'
					}
					size='small'
					count={eventCount}
					style={{
						opacity:
							date.month() === selectedDate.month() &&
								date.year() === selectedDate.year()
								? 1
								: 0.5
					}}
				>
					<Button
						type={
							date.date() === selectedDate.date() &&
								date.month() === selectedDate.month() &&
								date.year() === selectedDate.year()
								? 'primary'
								: 'text'
						}
						style={{
							opacity:
								date.month() === selectedDate.month() &&
									date.year() === selectedDate.year()
									? 1
									: 0.5
						}}
						size='small'
					>
						{`${date.date()}`.padStart(2, '0')}
					</Button>
				</Badge>
			);
		} else {
			// Month view
			const months = [
				'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
			];

			let eventCount = 0;
			// Count all announcements (event and general) in this month
			announcements.forEach(announcement => {
				if (announcement.event_date) {
					const event_date = dayjs(announcement.event_date);
					if (event_date.month() === date.month() && event_date.year() === date.year()) {
						eventCount++;
					}
				} else {
					const createdDate = dayjs(announcement.date || announcement.created_at);
					if (createdDate.month() === date.month() && createdDate.year() === date.year()) {
						eventCount++;
					}
				}
			});
			records.forEach(record => {
				const recordDate = dayjs(record.date);
				if (recordDate.month() === date.month() && recordDate.year() === date.year()) {
					eventCount++;
				}
			});

			return (
				<Badge count={eventCount}>
					<Button
						type={
							date.month() === selectedDate.month() &&
								date.year() === selectedDate.year()
								? 'primary'
								: 'text'
						}
					>
						{months[date.month()]}
					</Button>
				</Badge>
			);
		}
	};

	// Get events for selected date
	const selectedDateEvents = getEventsForDate(selectedDate);

	// Filter events by search
	const filteredEvents = search
		? selectedDateEvents.filter(event =>
			event.title?.toLowerCase().includes(search.toLowerCase()) ||
			event.description?.toLowerCase().includes(search.toLowerCase())
		)
		: selectedDateEvents;

	return (
		<Skeleton loading={loading} active>
			<Row gutter={[16, 16]}>
				<Col xs={24} lg={16}>
					<Card>
						<Calendar
							value={selectedDate}
							onSelect={(date) => setSelectedDate(date)}
							{...(isMobile
								? { fullCellRender }
								: { cellRender: dateCellRender }
							)}
							fullscreen={!isMobile}
						/>
					</Card>
				</Col>
				<Col xs={24} lg={8}>
					<Card
						title={
							<Title level={4} style={{ margin: 0 }}>
								Events on {selectedDate.format('MMMM D, YYYY')}
							</Title>
						}
						style={{ height: '100%' }}
					>
						{filteredEvents.length === 0 ? (
							<Empty
								description={
									search
										? 'No events match your search'
										: 'No events scheduled for this date'
								}
								image={Empty.PRESENTED_IMAGE_SIMPLE}
							/>
						) : (
							<Flex vertical gap={12}>
								{filteredEvents.map((event) => (
									<Card
										key={event.id}
										size='small'
										hoverable
										style={{ cursor: 'pointer' }}
										onClick={() => {
											if (event.type === 'record')
												navigate(`/dashboard/discipline/record/${event.id}`);
											else
												navigate(`/dashboard/utilities/announcements/${event.id}`);
										}}
									>
										<Flex vertical gap={8}>
											<Flex justify='space-between' align='center'>
												<Text strong ellipsis style={{ flex: 1 }}>
													{event.title}
												</Text>
												<Badge
													status={event.type === 'announcement' ? (event.isGeneral ? 'processing' : 'success') : 'error'}
													text={
														<Text type='secondary' style={{ fontSize: '12px' }}>
															{event.type === 'announcement'
																? (event.isGeneral ? 'Announcement' : 'Event')
																: 'Record'}
														</Text>
													}
												/>
											</Flex>
											<Text type='secondary' ellipsis={{ rows: 2 }}>
												{event.description}
											</Text>
										</Flex>
									</Card>
								))}
								</Flex>
						)}
					</Card>
				</Col>
			</Row>
		</Skeleton>
	);
};

export default CalendarPage;

import React from 'react';
import { useNavigate } from 'react-router';
import moment from 'moment';

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
	Empty
} from 'antd';

import {
	CalendarOutlined
} from '@ant-design/icons';

import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

import NewCase from '../../../modals/NewCase';
import { RecordCard } from '../Discipline/Records';

const { Text } = Typography;

/**
 * @type {React.FC}
 */
const CalendarPage = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const isMobile = useMobile();
	const [search, setSearch] = React.useState('');
	/** @type {[import('../../../classes/Event').EventProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Event').EventProps[]>>]} */
	const [searchedEvents, setSearchedEvents] = React.useState([]);
	const [dropdownOpen, setDropdownOpen] = React.useState(false);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Calendar',
			actions: [
				<Dropdown
					open={dropdownOpen}
					menu={{
						items: searchedEvents.map(event => ({
							key: event.id,
							label: {
								disciplinary: event.content.violations
							}[event.type],
							onClick: () => navigate(`/dashboard/discipline/record/${event.id}`)
						}))
					}}
				>
					<Input.Search
						placeholder='Search events'
						onChange={e => setSearch(e.target.value)}
						onFocus={() => setDropdownOpen(true)}
						onBlur={() => setDropdownOpen(false)}
						style={{ width: 200 }}
					/>
				</Dropdown>,
				<Dropdown
					arrow
					menu={{
						items: [
							{
								key: 'create-disciplinary-record',
								label: 'Disciplinary Record',
								onClick: () => NewCase(Modal)
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
						icon={<CalendarOutlined />}
					>
						Create
					</Button>
				</Dropdown>
			]
		});
	}, [setHeader, searchedEvents]);

	React.useEffect(() => {
		setSelectedKeys(['calendar']);
	}, [setSelectedKeys]);

	const { cache } = useCache();

	/** @type {[import('../../../classes/Event').EventProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Event').EventProps[]>>]} */
	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		setEvents(cache.events || []);
	}, [cache.events]);

	React.useEffect(() => {
		const searchTerm = search.toLowerCase();
		if (!searchTerm) {
			setSearchedEvents([]);
			return;
		};

		/** @type {import('../../../classes/Event').EventProps[]} */
		const events = (cache.events || []).filter(day => {
			return day.events.some(event => {
				if (event.type === 'disciplinary')
					return event.content.title.toLowerCase().includes(searchTerm);
				return false;
			});
		});
		for (const day of events) {
			day.events = day.events.filter(event => {
				if (event.type === 'disciplinary')
					return event.content.title.toLowerCase().includes(searchTerm);
				return false;
			});
		};
		const flattenedEvents = events.flatMap(day => day.events).sort((a, b) => {
			return a.content.date - b.content.date;
		});

		setSearchedEvents(flattenedEvents);
	}, [search, events]);

	const [value, setValue] = React.useState(moment());

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Card>
			<Calendar
				onPanelChange={(date) => setValue(date)}
					onSelect={(date, info) => {
							if (info.source === 'date') {
								const eventsForDate = events.find(event =>
									event.date.getDate() === date.date()
									&& event.date.getMonth() === date.month()
									&& event.date.getFullYear() === date.year()
								)?.events || [];
								const modal = Modal.info({
									title: `Events for ${date.format('MMMM D, YYYY')}`,
									centered: true,
									closable: { 'aria-label': 'Close' },
									content: (
										<>
											{
												eventsForDate.length !== 0 ? (
													<Row gutter={[16, 16]}>
														{eventsForDate.map((event, index) => (
															event.type === 'disciplinary' ? (
																<Col key={event.id} span={!isMobile ? 12 : 12} onClick={() => modal.destroy()}>
																	<RecordCard record={event.content} loading={false} />
																</Col>
															) : null
														))}
													</Row>
												) : (
													<Empty description='No events found' />
												)
											}
										</>
									),
									width: {
										xs: '100%',
										sm: '100%',
										md: '100%',
										lg: 512, // 2^9
										xl: 1024, // 2^10
										xxl: 1024 // 2^10
									}
								});
							} else {
								const eventsForMonth = events.filter(event =>
									event.date.getMonth() === date.month()
									&& event.date.getFullYear() === date.year()
								).flatMap(day => day.events).sort((a, b) => a.content.date - b.content.date);
								const modal = Modal.info({
									title: `Events for ${date.format('MMMM YYYY')}`,
									centered: true,
									closable: { 'aria-label': 'Close' },
									content: (
										<>
											{
												eventsForMonth.length !== 0 ? (
													<Row gutter={[16, 16]}>
														{eventsForMonth.map((event, index) => (
															event.type === 'disciplinary' ? (
																<Col key={event.id} span={!isMobile ? 12 : 12} onClick={() => modal.destroy()}>
																	<RecordCard record={event.content} loading={false} />
																</Col>
															) : null
														))}
													</Row>
												) : (
													<Empty description='No events found' />
												)
											}
										</>
									),
									width: {
										xs: '100%',
										sm: '100%',
										md: '100%',
										lg: 512, // 2^9
										xl: 1024, // 2^10
										xxl: 1024 // 2^10
									}
								});
							};
						}}
					cellRender={(date, info) => {
						if (info.type === 'date') {
							const eventsForDate = events.find(event =>
								event.date.getDate() === date.date()
								&& event.date.getMonth() === date.month()
								&& event.date.getFullYear() === date.year()
							)?.events || [];
							return (
								<Flex
									vertical
									style={{
										opacity: date.month() === value.month()
											&& date.year() === value.year() ? 1 : 0.5
									}}
								>
									{eventsForDate.map((event, index) => (
										event.type === 'disciplinary' ? (
											<Text key={index}>
												{event.content.violations}
											</Text>
										) : null
									))}
								</Flex>
							);
						} else {
							const eventsForMonth = events.filter(event =>
								event.date.getMonth() === date.month()
								&& event.date.getFullYear() === date.year()
							).flatMap(day => day.events).sort((a, b) => a.content.date - b.content.date);
							return (
								<Flex vertical>
									{eventsForMonth.map((event, index) => (
										event.type === 'disciplinary' ? (
											<Text key={index}>
												{event.content.violations}
											</Text>
										) : null
									))}
								</Flex>
							);
						};
					}}
				/>
		</Card>
	);
};

export default CalendarPage;

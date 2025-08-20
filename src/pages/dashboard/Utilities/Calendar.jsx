import React from 'react';
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

import { LoadingStatesContext, OSASContext } from '../../../main';

import NewCase from '../../../modals/NewCase';
import { RecordCard } from '../Students/Records';

const { Text } = Typography;

const CalendarPage = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	const [search, setSearch] = React.useState('');
	/** @type {[import('../../../classes/Event').EventProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Event').EventProps[]>>]} */
	const [searchedEvents, setSearchedEvents] = React.useState([]);
	const [dropdownOpen, setDropdownOpen] = React.useState(false);

	React.useEffect(() => {
		setHeader({
			title: 'Calendar',
			actions: [
				<Dropdown
					open={dropdownOpen}
					menu={{
						items: searchedEvents.map(event => ({
							key: event.id,
							label: {
								disciplinary: event.content.violation
							}[event.type],
							onClick: () => navigate(`/dashboard/students/record/${event.id}`)
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
								label: 'Announcement'
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

	const { loadingStates } = React.useContext(LoadingStatesContext);

	/** @type {{ osas: import('../../../main').OSASData }} */
	const { osas } = React.useContext(OSASContext);

	/** @type {[import('../../../main').OSASData['events'], React.Dispatch<React.SetStateAction<import('../../../main').OSASData['events']>>]} */
	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		setEvents(osas.events);
	}, [osas.events]);

	React.useEffect(() => {
		const searchTerm = search.toLowerCase();
		if (!searchTerm) {
			setSearchedEvents([]);
			return;
		};

		/** @type {import('../../../main').OSASData['events']} */
		const events = osas.events.filter(day => {
			return day.events.some(event => {
				if (event.type === 'disciplinary')
					return event.content.violation.toLowerCase().includes(searchTerm);
				return false;
			});
		});
		for (const day of events) {
			day.events = day.events.filter(event => {
				if (event.type === 'disciplinary')
					return event.content.violation.toLowerCase().includes(searchTerm);
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
			{!loadingStates.events ? (
				<Flex vertical gap={4}>
					<Flex justify='flex-end' gap={4}>
						<Skeleton.Button active />
						<Skeleton.Button active />
						<Skeleton.Button active />
					</Flex>
					<div
						style={{
							display: 'grid',
							gap: 4,
							gridTemplateColumns: 'repeat(7, 1fr)'
						}}
					>
						{[...Array(7).keys()].map((_, i) => (
							<div key={i} style={{ position: 'relative', width: '100%', height: 16 }}>
								<Skeleton.Node active style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
							</div>
						))}
					</div>
					<div
						style={{
							display: 'grid',
							gap: 4,
							gridTemplateColumns: 'repeat(7, 1fr)'
						}}
					>
						{[...Array(35).keys()].map((_, i) => (
							<div key={i} style={{ position: 'relative', width: '100%', height: 128 }}>
								<Skeleton.Node active style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
							</div>
						))}
					</div>
				</Flex>
			) : (
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
																<Col key={event.id} span={!mobile ? 12 : 12} onClick={() => modal.destroy()}>
																	<RecordCard record={event.content} loading={false} navigate={navigate} />
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
																<Col key={event.id} span={!mobile ? 12 : 12} onClick={() => modal.destroy()}>
																	<RecordCard record={event.content} loading={false} navigate={navigate} />
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
												{event.content.violation}
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
												{event.content.violation}
											</Text>
										) : null
									))}
								</Flex>
							);
						};
					}}
				/>
			)}
		</Card>
	);
};

export default CalendarPage;

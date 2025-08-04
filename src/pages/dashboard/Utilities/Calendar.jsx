import React from 'react';

import {
	Card,
	Flex,
	Button,
	Calendar,
	Skeleton
} from 'antd';

import {
	CalendarOutlined
} from '@ant-design/icons';

import { LoadingStatesContext, OSASContext } from '../../../main';

const CalendarPage = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	React.useEffect(() => {
		setHeader({
			title: 'Calendar',
			actions: [
				<Flex>
					<Button
						type='primary'
						icon={<CalendarOutlined />}
					>
						Create Event
					</Button>
				</Flex>
			]
		});
	}, [setHeader]);

	React.useEffect(() => {
		setSelectedKeys(['calendar']);
	}, [setSelectedKeys]);

	const { loadingStates, setLoadingStages } = React.useContext(LoadingStatesContext);
	const { osas, setOsas } = React.useContext(OSASContext);

	/** @type {[import('../../../main').OSASData['events'], React.Dispatch<React.SetStateAction<import('../../../main').OSASData['events']>>]} */
	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		setEvents(osas.events);
	}, [osas.events]);

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
							<div key={i} style={{ position: 'relative', width: '100%', height: 64 }}>
								<Skeleton.Node active style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
							</div>
						))}
					</div>
				</Flex>
			) : (
				<Calendar
					cellRender={(date) => {
						const eventsForDate = events.find(event =>
							event.date.getDate() === date.date()
							&& event.date.getMonth() === date.month()
							&& event.date.getFullYear() === date.year()
						)?.events || [];
						return (eventsForDate.map((event, index) => (
							event.type === 'disciplinary' ? (
								<div key={index}>
									<span>{event.content.violation}</span>
								</div>
							) : null
						)))
					}}
				/>
			)}
		</Card>
	);
};

export default CalendarPage;
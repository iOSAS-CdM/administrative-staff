import React from 'react';

import {
	Card,
	Flex,
	Button,
	Calendar as AntCalendar
} from 'antd';

import {
	CalendarOutlined
} from '@ant-design/icons';

import { OSASContext } from '../../../main';

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

	const { osas, setOsas } = React.useContext(OSASContext);

	/** @type {[import('../../../main').OSASData['events'], React.Dispatch<React.SetStateAction<import('../../../main').OSASData['events']>>]} */
	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		setEvents(osas.events);
	}, [osas.events]);

	return (
		<Card>
			<AntCalendar
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
		</Card>
	);
};

export default CalendarPage;
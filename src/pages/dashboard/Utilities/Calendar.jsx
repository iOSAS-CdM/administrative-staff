import React from 'react';

import {
	Card,
	Flex,
	Button,
	Calendar
} from 'antd';

import {
	CalendarOutlined
} from '@ant-design/icons';

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

	return (
		<Card>
			<Calendar
				cellRender={(date) => {
					return;
				}}
			/>
		</Card>
	);
};

export default CalendarPage;
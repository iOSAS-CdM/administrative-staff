import React from 'react';

import {
	Card,
	Flex,
	Button
} from 'antd';

import {
	CalendarOutlined
} from '@ant-design/icons';

const FAQsPage = ({ setHeader, mobile, navigate }) => {
	React.useEffect(() => {
		setHeader({
			title: 'Frequently Asked Questions',
			actions: [
				<Button
					type='primary'
					icon={<CalendarOutlined />}
				>
					Add FAQ
				</Button>
			]
		});
	}, [setHeader]);

	return (
		<Card>
			a
		</Card>
	);
};

export default FAQsPage;
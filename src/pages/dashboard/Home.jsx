import React from 'react';
import { useNavigate } from 'react-router';

import {
	Button,
	Typography,
	Card,
	Flex,
	Row,
	Col
} from 'antd';

const { Title, Text } = Typography;

import Menubar from '../../Components/Menubar';

const Home = ({ setHeader, staff }) => {
	React.useEffect(() => {
		if (setHeader)
			setHeader({
				title: 'Dashboard',
				actions: null
			});
	}, [setHeader]);

	const [time, setTime] = React.useState({
		hours: new Date().getHours() % 12 || 12,
		minutes: `${new Date().getMinutes()}`.padStart(2, '0'),
		seconds: `${new Date().getSeconds()}`.padStart(2, '0'),
		meridian: new Date().getHours() >= 12 ? 'PM' : 'AM',
		period: (() => {
			const hours = new Date().getHours();
			if (hours < 12) return 'morning';
			if (hours < 17) return 'afternoon';
			return 'evening';
		})()
	});
	React.useEffect(() => {
		const interval = setInterval(() => {
			const now = new Date();
			setTime({
				hours: now.getHours() % 12 || 12,
				minutes: `${now.getMinutes()}`.padStart(2, '0'),
				seconds: `${now.getSeconds()}`.padStart(2, '0'),
				meridian: now.getHours() >= 12 ? 'PM' : 'AM',
				period: (() => {
					const hours = now.getHours();
					if (hours < 12) return 'morning';
					if (hours < 17) return 'afternoon';
					return 'evening';
				})()
			});
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	const [date, setDate] = React.useState(new Date().toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	}));
	React.useEffect(() => {
		const interval = setInterval(() => {
			setDate(new Date().toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			}));
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<Flex
			vertical
			gap='small'
		>
			<Row gutter={[16, 16]}>
				<Col span={16}>
					<Card size='small' style={{height: '100%'}}>
						<Flex vertical justify='center' style={{height: '100%'}}>
							<Text>Good {time.period},</Text>
							<Title level={1} style={{ color: 'var(--primary)' }}>
								{staff?.name?.first || 'John'} {staff?.name?.middle || ''} {staff?.name?.last || 'Doe'}
							</Title>
							<Text>{staff?.role || 'Staff'}, Office of the Student Affairs and Services</Text>
						</Flex>
					</Card>
				</Col>
				<Col span={8}>
					<Card size='small' style={{height: '100%'}}>
						<Flex vertical justify='center' gap='small' style={{height: '100%'}}>
							<Flex gap='small' align='flex-end'>
								<Title level={1} style={{ color: 'var(--primary)' }}>{time.hours}:{time.minutes}</Title>
								<Title level={3} style={{ color: 'var(--primary)' }}>{time.meridian}</Title>
							</Flex>
							<Text>{date}</Text>
						</Flex>
					</Card>
				</Col>
			</Row>
		</Flex>
	);
};

export default Home;
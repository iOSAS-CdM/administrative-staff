import React from 'react';
import moment from 'moment';
import { Pie, Line } from '@ant-design/charts';

import {
	Calendar,
	Typography,
	Card,
	Flex,
	Row,
	Col,
	Tag
} from 'antd';

const { Title, Text } = Typography;

import rootToHex from '../../utils/rootToHex';

import PanelCard from '../../components/PanelCard';

const Home = ({ setHeader, setSelectedKeys, displayTheme, setDisplayTheme, staff }) => {
	React.useEffect(() => {
		if (setHeader)
			setHeader({
				title: 'Dashboard',
				actions: null
			});
	}, [setHeader]);
	React.useEffect(() => {
		setSelectedKeys(['home']);
	}, [setSelectedKeys]);

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



	const chartConfig = {
		height: 200,
		legend: {
			color: {
				title: false,
				position: 'bottom'
			}
		},
		theme: {
			category10: [
				rootToHex('var(--ant-color-primary-text-active)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-text)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-text-hover)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-active)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-hover)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-border-hover)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-border)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-bg-hover)', document.querySelector('.ant-card-body')),
				rootToHex('var(--ant-color-primary-bg)', document.querySelector('.ant-card-body'))
			],
			type: displayTheme
		}
	};

	const [casesRatio, setCasesRatio] = React.useState({
		resolved: Math.floor(Math.random() * 100),
		unresolved: Math.floor(Math.random() * 100)
	});
	React.useEffect(() => {
		setCasesRatio({
			resolved: casesRatio.resolved + Math.floor(Math.random() * 20) - 10,
			unresolved: casesRatio.unresolved + Math.floor(Math.random() * 20)
		});
		const interval = setInterval(() => {
			setCasesRatio({
				resolved: casesRatio.resolved + Math.floor(Math.random() * 20) - 10,
				unresolved: casesRatio.unresolved + Math.floor(Math.random() * 20) - 10
			});
		}, 10000);
		return () => clearInterval(interval);
	}, []);

	const [monthlyCasesTrend, setMonthlyCasesTrend] = React.useState([]);
	React.useEffect(() => {
		const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const currentMonth = new Date().getMonth();
		const workingMonths = JSON.parse(JSON.Stringify(months));
		workingMonths.splice(currentMonth + 1, workingMonths.length);
		months.splice(0, currentMonth + 1);
		for (const month of months.reverse()) {
			workingMonths.unshift(month);
		};

		const trendData = [];

		workingMonths.forEach(month => {
			trendData.push({
				month,
				type: 'Resolved',
				cases: Math.floor(Math.random() * 100)
			});
			trendData.push({
				month,
				type: 'Unresolved',
				cases: Math.floor(Math.random() * 100)
			});
		});

		setMonthlyCasesTrend(trendData);
	}, []);

	React.useEffect(() => {
		// Update the last resolved and unresolved cases every 10 seconds
		const interval = setInterval(() => {
			const lastResolved = monthlyCasesTrend[monthlyCasesTrend.length - 2];
			const lastUnresolved = monthlyCasesTrend[monthlyCasesTrend.length - 1];
			if (lastResolved && lastUnresolved) {
				lastResolved.cases = casesRatio.resolved;
				lastUnresolved.cases = casesRatio.unresolved;
				setMonthlyCasesTrend([...monthlyCasesTrend]);
			};
		}, 10000);
		return () => clearInterval(interval);
	}, [monthlyCasesTrend]);

	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		const fetchedEvents = [
			{
				title: 'Disobedience to the proper dress code.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Loitering in the school premises.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Bullying and harassment of fellow students.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Vandalism of school property.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Unauthorized use of school facilities.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			},
			{
				title: 'Excessive absences without valid reasons.',
				date: `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate() + (Math.floor(Math.random() * 10) - 5) + 1}`,
				type: 'disciplinary',
				tag: 'ongoing'
			}
		].sort((a, b) => new Date(b.date) - new Date(a.date));

		// Group by day
		const groupedEvents = fetchedEvents.reduce((acc, event) => {
			const eventDate = moment(event.date).clone().startOf('day').fromNow();
			if (!acc[eventDate])
				acc[eventDate] = [];
			acc[eventDate].push(event);
			return acc;
		}, {});


		setEvents(groupedEvents);
	}, []);

	return (
		<Flex
			vertical
			gap={16}
		>
			<Row gutter={[16, 16]}>
				<Col span={16}>
					<Card size='small' style={{ height: '100%' }}>
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
					<Card size='small' style={{ height: '100%' }}>
						<Flex vertical justify='center' gap={16} style={{ height: '100%' }}>
							<Flex gap={16} align='flex-end'>
								<Title level={1} style={{ color: 'var(--primary)' }}>{time.hours}:{time.minutes}</Title>
								<Title level={3} style={{ color: 'var(--primary)' }}>{time.meridian}</Title>
							</Flex>
							<Text>{date}</Text>
						</Flex>
					</Card>
				</Col>

				<Col span={8}>
					<PanelCard title='Monthly Cases Ratio'>
						<Pie
							data={[
								{
									type: 'Resolved',
									value: casesRatio.resolved
								},
								{
									type: 'Unresolved',
									value: casesRatio.unresolved
								}
							]}
							innerRadius={0.6}
							angleField='value'
							colorField='type'
							{...chartConfig}
						/>
					</PanelCard>
				</Col>
				<Col span={16}>
					<PanelCard title='Monthly Cases Trend'>
						<Line
							data={monthlyCasesTrend}
							xField='month'
							yField='cases'
							colorField='type'
							seriesField='type'
							{...chartConfig}
						/>
					</PanelCard>
				</Col>

				<Col span={16}>
					<PanelCard title='Calendar'>
						<Calendar fullscreen={false} />
					</PanelCard>
				</Col>

				<Col span={8}>
					<PanelCard title='Disciplinary Events'>
						{Object.keys(events).length > 0 && (
							Object.entries(events).map(([date, events]) => (
								<Flex key={date} vertical gap={8}>
									<Text strong>{date}</Text>
									{events.map((event, index) => (
										<Flex key={index} justify='flex-start' align='flex-start'>
											<Tag color={event.tag === 'ongoing' ? 'yellow' : 'green'}>{event.tag}</Tag>
											<Text>{event.title}</Text>
										</Flex>
									))}
								</Flex>
							))
						)}
					</PanelCard>
				</Col>
			</Row>
		</Flex>
	);
};

export default Home;
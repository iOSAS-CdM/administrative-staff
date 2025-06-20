import React from 'react';
import { Pie, Line } from '@ant-design/charts';

import {
	Button,
	Typography,
	Card,
	Flex,
	Row,
	Col
} from 'antd';

const { Title, Text } = Typography;

import rootToHex from '../../utils/rootToHex';
import { m } from 'framer-motion';

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
				rootToHex('var(--ant-color-primary-text-active)'),
				rootToHex('var(--ant-color-primary-text)'),
				rootToHex('var(--ant-color-primary-text-hover)'),
				rootToHex('var(--ant-color-primary-active)'),
				rootToHex('var(--ant-color-primary-hover)'),
				rootToHex('var(--ant-color-primary-border-hover)'),
				rootToHex('var(--ant-color-primary-border)'),
				rootToHex('var(--ant-color-primary-bg-hover)'),
				rootToHex('var(--ant-color-primary-bg)')
			]
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
		const workingMonths = JSON.parse(JSON.stringify(months));
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

				<Col span={14}>
					<Card size='small' title='Monthly Cases Ratio'>
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
					</Card>
				</Col>

				<Col span={10}>
					<Card size='small' title='Monthly Cases Trend'>
						<Line
							data={monthlyCasesTrend}
							xField='month'
							yField='cases'
							colorField='type'
							seriesField='type'
							{...chartConfig}
						/>
					</Card>
				</Col>
			</Row>
		</Flex>
	);
};

export default Home;
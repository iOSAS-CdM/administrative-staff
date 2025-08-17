import React from 'react';
import moment from 'moment';
import { Pie, Line } from '@ant-design/charts';

import {
	Calendar as AntCalendar,
	Typography,
	Card,
	Flex,
	Row,
	Col,
	Skeleton,
	Badge,
	Button
} from 'antd';

import { LoadingStatesContext, OSASContext } from '../../main';

const { Title, Text } = Typography;

import rootToHex from '../../utils/rootToHex';

import PanelCard from '../../components/PanelCard';

const Timer = () => {
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
		<Card size='small' style={{ height: '100%' }}>
			<Flex vertical justify='center' gap={16} style={{ height: '100%' }}>
				<Flex gap={16} align='flex-end'>
					<Title level={1} style={{ color: 'var(--primary)' }}>{time.hours}:{time.minutes}</Title>
					<Title level={3} style={{ color: 'var(--primary)' }}>{time.meridian}</Title>
				</Flex>
				<Text>{date}</Text>
			</Flex>
		</Card>
	);
};

const Calendar = ({ events }) => {
	const [value, setValue] = React.useState(moment());
	return (
		<AntCalendar
			fullscreen={false}
			onPanelChange={(date) => {
				setValue(date);
			}}
			fullCellRender={(date) => {
				const eventsForDate = events.find(event =>
					event.date.getDate() === date.date()
					&& event.date.getMonth() === date.month()
					&& event.date.getFullYear() === date.year()
				)?.events || [];
				return (
					<Badge
						color={
							date.month() === value.month()
								&& date.year() === value.year() ? (['yellow', 'orange', 'red'][eventsForDate.length - 1] || 'red') : 'grey'
						}
						size='small'
						count={eventsForDate.length}
						style={{
							opacity: date.month() === value.month()
								&& date.year() === value.year() ? 1 : 0.5
						}}
					>
						<Button
							type={
								date.date() === value.date()
									&& date.month() === value.month()
									&& date.year() === value.year() ? 'primary' : 'text'
							}
							style={{
								opacity: date.month() === value.month()
									&& date.year() === value.year() ? 1 : 0.5
							}}
							size='small'
						>
							{`${date.date()}`.padStart(2, '0')}
						</Button>
					</Badge>
				)
			}}
		/>
	);
};

const Home = ({ setHeader, setSelectedKeys, displayTheme, staff }) => {
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

	const [timePeriod, setTimePeriod] = React.useState('morning');
	React.useEffect(() => {
		const interval = setInterval(() => {
			const hours = new Date().getHours();
			if (hours < 12) setTimePeriod('morning');
			else if (hours < 17) setTimePeriod('afternoon');
			else setTimePeriod('evening');
		}, 1000);
		return () => clearInterval(interval);
	}, []);



	const { loadingStates } = React.useContext(LoadingStatesContext);
	const { osas } = React.useContext(OSASContext);

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
		resolved: 0,
		unresolved: 0
	});
	React.useEffect(() => {
		const resolved = osas.records.filter(record => record.tags.status === 'resolved').length;
		const unresolved = osas.records.filter(record => record.tags.status !== 'resolved').length;
		setCasesRatio({
			resolved,
			unresolved
		});
	}, [osas.records]);

	const [monthlyCasesTrend, setMonthlyCasesTrend] = React.useState([]);
	React.useEffect(() => {
		const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		const months = [...allMonths];
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
				cases: osas.records.filter(record => record.tags.status === 'resolved' && record.date.getMonth() === allMonths.indexOf(month)).length
			});
			trendData.push({
				month,
				type: 'Unresolved',
				cases: osas.records.filter(record => record.tags.status !== 'ongoing' && record.date.getMonth() === allMonths.indexOf(month)).length
			});
		});

		setMonthlyCasesTrend(trendData);
	}, [osas.records]);

	/** @type {[import('../../main').OSASData['events'], React.Dispatch<React.SetStateAction<import('../../main').OSASData['events']>>]} */
	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		setEvents(osas.events);
	}, [osas.events]);

	return (
		<Flex
			vertical
			gap={16}
		>
			<Row gutter={[16, 16]}>
				<Col span={16}>
					<Card size='small' style={{ height: '100%' }}>
						<Flex vertical justify='center' gap={!loadingStates.staff && 8} style={{height: '100%'}}>
							{!loadingStates.staff ? (
								<>
									<Skeleton.Node
										active
										style={{ width: 128, maxWidth: '100%', height: 8 }}
									/>
									<Skeleton.Node
										active
										style={{ width: 256, maxWidth: '100%', height: 32 }}
									/>
									<Skeleton.Node
										active
										style={{ width: 512, maxWidth: '100%', height: 8 }}
									/>
								</>
							) : (
								<>
									<Text>Good {timePeriod},</Text>
									<Title level={1} style={{ color: 'var(--primary)' }}>
										{staff?.name?.first} {staff?.name?.middle} {staff?.name?.last}
									</Title>
									<Text>{staff?.role}, Office of the Student Affairs and Services</Text>
								</>
							)}
						</Flex>
					</Card>
				</Col>
				<Col span={8}>
					<Timer />
				</Col>

				<Col span={8}>
					<PanelCard title='Monthly Cases Ratio'>
						{!loadingStates.records ? (
							<Flex vertical justify='flex-start' align='center'>
								<Skeleton.Node
									active
									style={{ width: 128, height: 128, borderRadius: '100%' }}
								/>
								<Flex justify='flex-start' align='flex-start' gap={8} style={{ width: '100%' }}>
									<Skeleton.Node
										active
										style={{ width: 64, maxWidth: '100%', height: 8 }}
									/>
									<Skeleton.Node
										active
										style={{ width: 64, maxWidth: '100%', height: 8 }}
									/>
								</Flex>
							</Flex>
						) : (
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
									animate={null}
									{...chartConfig}
								/>
						)}
					</PanelCard>
				</Col>
				<Col span={16}>
					<PanelCard title='Monthly Cases Trend'>
						{!loadingStates.records ? (
							<Skeleton.Node
								active
								style={{ width: '100%', height: 128 }}
							/>
						) : (
								<Line
									data={monthlyCasesTrend}
									xField='month'
									yField='cases'
									colorField='type'
									seriesField='type'
									{...chartConfig}
								/>
						)}
					</PanelCard>
				</Col>

				<Col span={16}>
					<PanelCard title='Calendar'>
						{!loadingStates.events ? (
							<Skeleton.Node
								active
								style={{ width: '100%', height: 152 }}
							/>
						) : (
							<Calendar events={events} />
						)}
					</PanelCard>
				</Col>

				<Col span={8}>
					<PanelCard title='Notifications'>
					</PanelCard>
				</Col>
			</Row>
		</Flex>
	);
};

export default Home;
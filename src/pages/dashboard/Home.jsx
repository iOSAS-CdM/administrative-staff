import React from 'react';
import moment from 'moment';
import { useNavigate } from 'react-router';
import { Pie, Line } from '@ant-design/charts';

import {
	Calendar as AntCalendar,
	Typography,
	Card,
	Flex,
	Row,
	Col,
	Badge,
	Button,
	App,
	Empty
} from 'antd';

import { useCache } from '../../contexts/CacheContext';
import { useMobile } from '../../contexts/MobileContext';
import { usePageProps } from '../../contexts/PagePropsContext';

const { Title, Text } = Typography;

import rootToHex from '../../utils/rootToHex';

import PanelCard from '../../components/PanelCard';

import authFetch from '../../utils/authFetch';
import { API_Route } from '../../main';

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

/**
 * @type {React.FC}
 */
const Home = () => {
	const isMobile = useMobile();
	const { setHeader, setSelectedKeys, displayTheme, staff } = usePageProps();
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



	const { cache } = useCache();

	const chartConfig = {
		height: 256,
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

	const [studentsRatio, setStudentsRatio] = React.useState([
		{ type: 'Verified', value: 1 },
		{ type: 'Unverified', value: 1 }
	]);
	const [monthlyCasesTrend, setMonthlyCasesTrend] = React.useState([]);

	/** @type {[import('../../classes/Event').EventProps[], React.Dispatch<React.SetStateAction<import('../../classes/Event').EventProps[]>>]} */
	const [events, setEvents] = React.useState([]);
	React.useEffect(() => {
		const controller = new AbortController();
		const fetchAll = async () => {
			try {
				const [statsRes, trendRes, eventsRes] = await Promise.all([
					authFetch(`${API_Route}/statistics`, { signal: controller.signal }),
					authFetch(`${API_Route}/statistics/trend`, { signal: controller.signal }),
					Promise.resolve({ ok: true, json: async () => cache.events || [] }) // events from cache
				]);

				if (statsRes && statsRes.ok) {
					const statsData = await statsRes.json();
					setStudentsRatio([
						{ type: 'Verified', value: statsData.students.verified },
						{ type: 'Unverified', value: statsData.students.unverified }
					]);
				};

				if (trendRes && trendRes.ok) {
					const trendData = await trendRes.json();
					const recordsTrend = trendData.records.map(item => ({
						month: moment(item.month, 'YYYY-MM').format('MMM YYYY'),
						cases: item.total,
						type: 'Total Cases'
					})).concat(trendData.records.map(item => ({
						month: moment(item.month, 'YYYY-MM').format('MMM YYYY'),
						cases: item.resolved,
						type: 'Resolved Cases'
					}))).concat(trendData.records.map(item => ({
						month: moment(item.month, 'YYYY-MM').format('MMM YYYY'),
						cases: item.ongoing,
						type: 'Ongoing Cases'
					})));
					setMonthlyCasesTrend(recordsTrend);
				}

				const eventsData = await eventsRes.json();
				setEvents(eventsData);
			} catch (err) {
				console.error('Failed to fetch dashboard data:', err);
			};
		};
		fetchAll();
		return () => controller.abort();
	}, [cache.events]);

	return (
		<Flex
			vertical
			gap={16}
		>
			<Row gutter={[16, 16]}>
				<Col span={isMobile ? 24 : 16}>
					<Card size='small' style={{ height: '100%' }}>
						<Flex vertical justify='center' gap={8} style={{height: '100%'}}>
							<>
								<Text>Good {timePeriod},</Text>
								<Title level={1} style={{ color: 'var(--primary)' }}>
									{staff?.name?.first} {staff?.name?.middle} {staff?.name?.last}
								</Title>
								<Text>{{
									'head': 'Head',
									'guidance': 'Guidance Officer',
									'prefect': 'Prefect of Discipline Officer'
								}[staff?.role]}, Office of the Student Affairs and Services</Text>
							</>
						</Flex>
					</Card>
				</Col>
				{!isMobile && (
					<Col span={isMobile ? 24 : 8}>
						<Timer />
					</Col>
				)}

				{isMobile && (
					<Col span={24}>
						<PanelCard title='Monthly Cases Ratio'>
							<Pie
								data={studentsRatio}
								angleField='value'
								colorField='type'
								innerRadius={0.6}
								animate={null}
								{...chartConfig}
							/>
						</PanelCard>
					</Col>
				)}
				<Col span={isMobile ? 24 : 16}>
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
				{!isMobile && (
					<Col span={8}>
						<PanelCard title='Student Registration Status'>
							<Pie
								data={studentsRatio}
								angleField='value'
								colorField='type'
								innerRadius={0.6}
								animate={null}
								{...chartConfig}
							/>
						</PanelCard>
					</Col>
				)}
			</Row>
		</Flex>
	);
};

export default Home;
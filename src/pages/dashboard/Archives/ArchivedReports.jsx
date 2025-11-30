import React from 'react';
import { useNavigate } from 'react-router';
import {
	App,
	Segmented,
	Flex,
	Avatar,
	Typography,
	Tag,
	Spin,
	Dropdown,
	Divider,
	Card
} from 'antd';
import ContentPage from '../../../components/ContentPage';
import {
	UserOutlined,
	BankOutlined
} from '@ant-design/icons';
const { Title, Text } = Typography;
import ItemCard from '../../../components/ItemCard';
import { API_Route } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';
import { useRefresh } from '../../../contexts/RefreshContext';
import authFetch from '../../../utils/authFetch';

/**
 * @type {React.FC}
 */
const ArchivedReports = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const isMobile = useMobile();
	const { cache, updateCache } = useCache();
	const { setRefresh } = useRefresh();
	const app = App.useApp();

	const [archive, setArchive] = React.useState('');
	const [archives, setArchives] = React.useState([]);
	const [status, setStatus] = React.useState('open');

	React.useEffect(() => {
		setSelectedKeys(['archive-reports']);
		const fetchArchives = async () => {
			const res = await authFetch(`${API_Route}/archives`);
			if (res?.ok) {
				const data = await res.json();
				setArchives(data);
				setArchive(data[0] || '');
			};
		};
		fetchArchives();
	}, [setSelectedKeys]);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Archived Reports',
			subtitle: 'View and manage archived student reports',
			actions: [
				<Segmented
					key='archive-select'
					options={archives.map(a => ({ label: a, value: a }))}
					value={archive}
					onChange={setArchive}
				/>,
				<Segmented
					key='status-filter'
					options={['open', 'dismissed', 'proceeded'].map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))}
					value={status}
					onChange={setStatus}
				/>
			]
		});
	}, [setHeader, archives, archive, status]);

	return (
		<ContentPage
			fetchUrl={archive ? `${API_Route}/archives/${archive}/cases?status=${status}` : ''}
			emptyText='No archived reports found'
			cacheKey={`archived-reports-${archive}-${status}`}
			transformData={data => data?.cases || []}
			renderItem={c => (
				<ItemCard
					hoverable
					loading={c.placeholder}
					style={c.archived ? { opacity: 0.7, filter: 'grayscale(0.3)' } : {}}
					onClick={() => navigate(`/dashboard/students/profile/${c.author?.id}`)}
				>
					<Flex vertical gap={12}>
						<Flex justify='space-between' align='start'>
							<Flex gap={12} align='flex-start' style={{ flex: 1 }}>
								<Avatar size={40} shape='square' src={c.author?.profilePicture || null} icon={<UserOutlined />} />
								<Flex vertical style={{ flex: 1 }}>
									<Text strong style={{ fontSize: 16 }}>{c.author?.name?.first} {c.author?.name?.last}</Text>
									<Text type='secondary' style={{ fontSize: 14 }}>{c.author?.email}</Text>
								</Flex>
							</Flex>
							<Tag color='default'>Archived</Tag>
						</Flex>
						<Flex vertical gap={4}>
							<Text type='secondary' style={{ fontSize: 12 }}>Case</Text>
							<Title level={5} style={{ margin: 0 }}><BankOutlined style={{ marginRight: 8 }} />{c.title}</Title>
						</Flex>
						<Text type='secondary' style={{ fontSize: 12 }}>Status: {c.status}</Text>
						<Text type='secondary' style={{ fontSize: 12 }}>Created {new Date(c.created_at).toLocaleDateString()} at {new Date(c.created_at).toLocaleTimeString()}</Text>
					</Flex>
				</ItemCard>
			)}
		/>
	);
};

export default ArchivedReports;

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
import { ReportCard } from '../Discipline/Reports.jsx';
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
			renderItem={caseItem => (
				<ReportCard caseItem={caseItem} loading={caseItem.placeholder} />
			)}
		/>
	);
};

export default ArchivedReports;

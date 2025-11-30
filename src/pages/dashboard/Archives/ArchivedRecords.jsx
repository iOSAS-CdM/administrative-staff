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
	Divider
} from 'antd';
import ContentPage from '../../../components/ContentPage';
import {
	UserOutlined,
	BankOutlined
} from '@ant-design/icons';
const { Title, Text } = Typography;
import ItemCard from '../../../components/ItemCard';
import { RecordCard } from '../Discipline/Records.jsx';
import { API_Route } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';
import { useRefresh } from '../../../contexts/RefreshContext';
import authFetch from '../../../utils/authFetch';

/**
 * @type {React.FC}
 */
const ArchivedRecords = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const isMobile = useMobile();
	const { cache, updateCache } = useCache();
	const { setRefresh } = useRefresh();
	const app = App.useApp();

	const [archive, setArchive] = React.useState('');
	const [archives, setArchives] = React.useState([]);

	React.useEffect(() => {
		setSelectedKeys(['archive-records']);
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
			title: 'Archived Records',
			actions: [
				<Segmented
					key='archive-select'
					options={archives.map(a => ({ label: a, value: a }))}
					value={archive}
					onChange={setArchive}
				/>
			]
		});
	}, [setHeader, archives, archive]);

	return (
		<ContentPage
			fetchUrl={`${API_Route}/archives/${archive}/records`}
			emptyText='No archived records found'
			cacheKey={`archived-records-${archive}`}
			transformData={data => data?.records || []}
			renderItem={record => (
				<RecordCard record={record} loading={record.placeholder} />
			)}
		/>
	);
};

export default ArchivedRecords;

import React from 'react';
import { useNavigate } from 'react-router';
import {
	App,
	Input,
	Button,
	Segmented,
	Flex,
	Avatar,
	Typography,
	Tag,
	Spin,
	Dropdown,
	Modal,
	Space,
	Divider,
	Tooltip
} from 'antd';
import ContentPage from '../../../components/ContentPage';
import {
	FileTextOutlined,
	UserOutlined,
	CheckOutlined,
	CloseOutlined,
	WarningOutlined
} from '@ant-design/icons';
const { Title, Text, Paragraph } = Typography;
import ItemCard from '../../../components/ItemCard';
import { RequestCard } from '../Utilities/Requests.jsx';
import { API_Route } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';
import { useCache } from '../../../contexts/CacheContext';
import { usePageProps } from '../../../contexts/PagePropsContext';
import { useRefresh } from '../../../contexts/RefreshContext';
import authFetch from '../../../utils/authFetch';

/**
 * @type {React.FC}
 */
const ArchivedRequests = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const isMobile = useMobile();
	const { cache, updateCache } = useCache();
	const { setRefresh } = useRefresh();
	const app = App.useApp();

	const [archive, setArchive] = React.useState('');
	const [archives, setArchives] = React.useState([]);

	React.useEffect(() => {
		setSelectedKeys(['archive-requests']);
		// Fetch available archives
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
			title: 'Archived Student Requests',
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
			fetchUrl={archive ? `${API_Route}/archives/${archive}/requests` : ''}
			emptyText='No archived requests found'
			cacheKey={`archived-requests-${archive}`}
			transformData={data => data?.requests || []}
			renderItem={request => (
				<RequestCard request={request} loading={request.placeholder} onView={() => navigate(`/dashboard/students/profile/${request.student?.id}`)} />
			)}
		/>
	);
};

export default ArchivedRequests;

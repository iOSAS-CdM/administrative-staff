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
			}
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
				<ItemCard
					hoverable
					loading={request.placeholder}
					style={request.archived ? { opacity: 0.7, filter: 'grayscale(0.3)' } : {}}
					onClick={() => navigate(`/dashboard/students/profile/${request.student?.id}`)}
				>
					<Flex vertical gap={12}>
						<Flex justify='space-between' align='start'>
							<Flex gap={12} align='flex-start' style={{ flex: 1 }}>
								<Avatar size={40} shape='square' src={request.student?.profilePicture || null} icon={<UserOutlined />} />
								<Flex vertical style={{ flex: 1 }}>
									<Text strong style={{ fontSize: 16 }}>{request.student?.name?.first} {request.student?.name?.last}</Text>
									<Text type='secondary' style={{ fontSize: 14 }}>{request.student?.email}</Text>
								</Flex>
							</Flex>
							<Tag color={getStatusColor(request.status)}>{request.status.charAt(0).toUpperCase() + request.status.slice(1)}</Tag>
						</Flex>
						<Flex vertical gap={4}>
							<Text type='secondary' style={{ fontSize: 12 }}>Request Type</Text>
							<Title level={5} style={{ margin: 0 }}><FileTextOutlined style={{ marginRight: 8 }} />{formatRequestType(request.type)}</Title>
						</Flex>
						{request.message && <Paragraph ellipsis={{ rows: 2 }} type='secondary' style={{ margin: 0, padding: 8, backgroundColor: 'var(--ant-color-bg-layout)', borderRadius: 6, fontSize: 14 }}>{request.message}</Paragraph>}
						<Text type='secondary' style={{ fontSize: 12 }}>Submitted {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}</Text>
					</Flex>
				</ItemCard>
			)}
		/>
	);
};

const formatRequestType = (type) => {
	const types = {
		good_moral: 'Good Moral Certification',
		clearance: 'Clearance',
		certificate_of_grades: 'Certificate of Grades',
		transcript_of_records: 'Transcript of Records',
		honorable_dismissal: 'Honorable Dismissal',
		transfer_credentials: 'Transfer Credentials',
		other: 'Other Request'
	};
	return types[type] || type;
};

const getStatusColor = (status) => {
	switch (status) {
		case 'open': return 'blue';
		case 'accepted': return 'green';
		case 'rejected': return 'red';
		default: return 'default';
	}
};

export default ArchivedRequests;

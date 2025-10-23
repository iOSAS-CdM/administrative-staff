import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Avatar,
	Row,
	Col,
	Button,
	Typography,
	Image,
	Flex
} from 'antd';

import {
	NotificationOutlined,
	UserOutlined
} from '@ant-design/icons';

import ItemCard from '../../../components/ItemCard';

const { Text, Paragraph, Title } = Typography;

import { usePageProps } from '../../../contexts/PagePropsContext';

import ContentPage from '../../../components/ContentPage';

import { API_Route } from '../../../main';

/**
 * @typedef {{
 *   cover: String,
 *   title: String,
 *   description: String,
 *   editMode: Boolean,
 *   date: Date
 * }} Announcement
 */

/**
 * @type {React.FC}
 */
const Announcements = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	React.useLayoutEffect(() => {
		setHeader({
			title: 'Announcements',
			actions: [
				<Button
					type='primary'
					icon={<NotificationOutlined />}
					onClick={() => navigate('/dashboard/utilities/announcements/new')}
				>
					Create an Announcement
				</Button>
			]
		});
	}, [setHeader]);

	React.useEffect(() => {
		setSelectedKeys(['announcements']);
	}, [setSelectedKeys]);

	return (
		<ContentPage
			fetchUrl={`${API_Route}/announcements`}
			emptyText='No records found'
			cacheKey='records'
			transformData={(data) => data.announcements || []}
			renderItem={(announcement) => (
				<AnnouncementCard
					announcement={announcement}
					loading={announcement.placeholder}
				/>
			)}
		/>
	);
};

const AnnouncementCard = ({ announcement }) => {
	const navigate = useNavigate();
	return (
		<ItemCard
			hoverable
			onClick={() => navigate(`/dashboard/utilities/announcements/${announcement.id}`, { state: { id: announcement.id } })}
			cover={
				<Image
					src={announcement.cover}
					alt={announcement.title}
					style={{ objectFit: 'cover', height: 200, width: '100%' }}
				/>
			}
		>
			<Flex vertical gap={8}>
				<Title level={4} ellipsis={{ rows: 2 }}>{announcement.title}</Title>

				<Flex gap={8} align='center'>
					{announcement.author === 'superapi-bypass' ? (
						<Avatar
							size={32}
							icon={<UserOutlined />}
						/>
					) : (
						<Avatar
							size={32}
							src={announcement.author?.profilePicture || null}
						/>
					)}
					{/* <Text>
						{announcement.author === 'superapi-bypass'
							? 'System Administrator'
							: `${announcement.author?.name?.first || ''} ${announcement.author?.name?.last || ''}`}
					</Text> */}
					{announcement.author === 'superapi-bypass' ? (
						<Text>System Administrator</Text>
					) : (
						<Flex vertical>
							<Text style={{ margin: 0 }}>
								{`${announcement.author?.name?.first || ''} ${announcement.author?.name?.last || ''}`}
							</Text>
							<Text type='secondary'>{
								{
									'head': 'Head',
									'guidance': 'Guidance Officer',
									'prefect': 'Prefect of Discipline Officer',
									'student-affairs': 'Student Affairs Officer',
									'student': 'Student'
								}[announcement.author?.role]
							}</Text>
						</Flex>
					)}
				</Flex>
			</Flex>
		</ItemCard>
	);
};

export default Announcements;
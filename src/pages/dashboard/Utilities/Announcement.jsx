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
			cacheKey='announcements'
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
				<>
					<Image
						src={announcement.cover}
						alt={announcement.title}
						preview={false}
						style={{ objectFit: 'cover', height: 200, width: '100%' }}
					/>
					<span>
						<Text type='secondary' style={{ position: 'absolute', top: 16, right: 16 }}>
							{new Date(announcement.created_at).toLocaleDateString()}
						</Text>
					</span>
				</>
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
					{announcement.author === 'superapi-bypass' ? (
						<Text>System Administrator</Text>
					) : (
						<Flex direction='row' align='center' gap={8}>
							<Avatar
								uri={announcement.author.profilePicture}
							/>
							<Flex direction='column' justify='center' align='start'>
								<Text style={{ fontWeight: '500' }}>
									{announcement.author.name.first}{' '}
									{announcement.author.name.last}
								</Text>
								<Text style={{ color: theme.color_text_secondary }}>{
									{
										'head': 'Head',
										'guidance': 'Guidance Officer',
										'prefect': 'Prefect of Discipline Officer',
										'student-affairs': 'Student Affairs Officer',
										'student': 'Student'
									}[announcement.author?.role] || announcement.author?.role
								}{announcement.organization && ` - ${announcement.organization.shortName}`}</Text>
							</Flex>
						</Flex>
					)}
				</Flex>
			</Flex>
		</ItemCard>
	);
};

export default Announcements;
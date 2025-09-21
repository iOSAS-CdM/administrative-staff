import React from 'react';
import { useNavigate } from 'react-router';

import {
	Avatar,
	Row,
	Col,
	Button,
	Typography,
	Image
} from 'antd';

import {
	NotificationOutlined,
	UserOutlined
} from '@ant-design/icons';

import ItemCard from '../../../components/ItemCard';

const { Text, Paragraph, Title } = Typography;

import { useCache } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

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

	const { cache } = useCache();

	const isMobile = useMobile();

	return (
		<Row gutter={[16, 16]}>
			{(cache.announcements || []).map((announcement, index) => (
				<Col key={index} span={isMobile ? 24 : 12}>
					<ItemCard
						cover={
							<Image
								src={announcement.cover}
							/>
						}
						actions={[
							{
								content: <Avatar.Group max={{ count: 3 }} size='small'>
									{announcement.authors.map((author, idx) => (
										<Avatar
											key={idx}
											src={author.user.profilePicture || '/Placeholder Image.svg'}
											icon={!author.user.profilePicture && <UserOutlined />}
										/>
									))}
								</Avatar.Group>
							},
							{
								content: (
									<Text>
										{announcement.date.toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</Text>
								)
							}
						]}
					>
						<Title level={4}>{announcement.title}</Title>
						<Paragraph>{announcement.description}</Paragraph>
					</ItemCard>
				</Col>
			))}
		</Row>
	);
};

export default Announcements;
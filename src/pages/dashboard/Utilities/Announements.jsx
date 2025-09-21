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

import { OSASContext } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';

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
 * @type {React.FC<{
 * 	setHeader: (header: any) => void,
 * 	setSelectedKeys: (keys: string[]) => void
 * }>}
 */
const Announcements = ({ setHeader, setSelectedKeys }) => {
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

	const { osas } = React.useContext(OSASContext);

	const isMobile = useMobile();

	return (
		<Row gutter={[16, 16]}>
			{osas.announcements.map((announcement, index) => (
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
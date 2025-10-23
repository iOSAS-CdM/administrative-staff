import React from 'react';
import { useParams, useNavigate } from 'react-router';
import moment from 'moment';

import {
	Card,
	Button,
	Typography,
	Image,
	App,
	Avatar,
	Flex
} from 'antd';

import { LeftOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';

import MDEditor from '@uiw/react-md-editor';

import { useCache } from '../../../../contexts/CacheContext';
import { usePageProps } from '../../../../contexts/PagePropsContext';
import authFetch from '../../../../utils/authFetch';
import { API_Route } from '../../../../main';

const { Title, Text } = Typography;

/**
 * Announcement view page
 */
const ViewAnnouncement = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { setHeader } = usePageProps();
	const app = App.useApp();
	const Modal = app.modal;

	const { cache, pushToCache, getFromCache } = useCache();

	const [announcement, setAnnouncement] = React.useState({ placeholder: true });

	React.useLayoutEffect(() => {
		setHeader({
			title: `Announcement ${id || ''}`,
			actions: [
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate(-1)}
					key='back'
				/>,
				<Button
					type='primary'
					danger
					icon={<DeleteOutlined />}
					onClick={() => {
						Modal.confirm({
							title: 'Delete Announcement',
							content: 'Are you sure you want to delete this announcement? This action cannot be undone.',
							centered: true,
							onOk: async () => {
								const res = await authFetch(`${API_Route}/announcements/${id}`, {
									method: 'DELETE'
								}).catch(() => null);
								if (!res || !res.ok) {
									Modal.error({
										title: 'Error',
										content: 'Failed to delete announcement. Please try again later.',
										centered: true
									});
									return;
								}
								// Remove from cache
								const updatedAnnouncements = (cache.announcements || []).filter(a => String(a.id) !== String(id));
								pushToCache('announcements', updatedAnnouncements, false);
								navigate(-1);
							}
						});
					}}
					key='delete'
				>
					Delete Announcement
				</Button>
			]
		});
	}, [setHeader, id]);

	React.useEffect(() => {
		if (!id) return;

		const cached = (cache.announcements || []).find(a => String(a.id) === String(id));
		if (cached) {
			setAnnouncement(cached);
			return;
		};

		const controller = new AbortController();
		const load = async () => {
			const res = await authFetch(`${API_Route}/announcements/${id}`, { signal: controller.signal }).catch(() => null);
			if (!res || !res.ok) {
				Modal.error({
					title: 'Error',
					content: 'Failed to fetch announcement. Please try again later.',
					centered: true,
					onOk: () => navigate(-1)
				});
				return;
			}
			const data = await res.json();
			if (!data) return;
			pushToCache('announcements', data, true);
			setAnnouncement(data);
		};
		load();
		return () => controller.abort();
	}, [id, cache.announcements]);

	return (
		<Flex vertical gap={16}>
			<Card>
				<Flex vertical gap={16} style={{ width: '100%' }}>
					{announcement.cover && (
						<Image src={announcement.cover} alt={announcement.title} style={{ objectFit: 'cover', width: '100%', maxHeight: 360 }} fallback='/Placeholder Image.svg' />
					)}
					<Title level={1}>{announcement.title}</Title>

					<div style={{ width: '100%' }}>
						<MDEditor.Markdown source={announcement.content || ''} />
					</div>

					<Flex gap={8} align='center'>
						{announcement.author === 'superapi-bypass' ? (
							<Avatar size={32} icon={<UserOutlined />} />
						) : (
							<Avatar size={32} src={announcement.author?.profilePicture || null} />
						)}
						<div>
							<Text strong>
								{announcement.author === 'superapi-bypass'
									? 'System Administrator'
									: `${announcement.author?.name?.first || ''} ${announcement.author?.name?.last || ''}`}
							</Text>
							<br />
							<Text type='secondary'>
								{announcement.date ? moment(announcement.date).format('MMMM D, YYYY') : ''}
							</Text>
						</div>
					</Flex>
				</Flex>
			</Card>
		</Flex>
	);
};

export default ViewAnnouncement;

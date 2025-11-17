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
	Input,
	Flex,
	Divider,
	Tag,
	Popover,
	List
} from 'antd';

import { LeftOutlined, UserOutlined, DeleteOutlined, CheckOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';

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
	const { setHeader, setSelectedKeys } = usePageProps();
	const app = App.useApp();
	const Modal = app.modal;

	const { cache, pushToCache, getFromCache } = useCache();

	const [announcement, setAnnouncement] = React.useState({ placeholder: true });

	const [commentText, setCommentText] = React.useState('');
	const [posting, setPosting] = React.useState(false);
	const [liking, setLiking] = React.useState(false);

	const formatDate = (d) => {
		if (!d) return null;
		const m = moment(d);
		return m.isValid() ? m.format('LLL') : null;
	};

	// Check if current user has liked the announcement
	const hasLiked = React.useMemo(() => {
		if (!announcement.likes || !cache.staff) return false;
		return announcement.likes.some(like => {
			// Handle both cases: like.author as object or as string
			const likeAuthorId = typeof like.author === 'object' ? like.author.id : like.author;
			return String(likeAuthorId) === String(cache.staff.id);
		});
	}, [announcement.likes, cache.staff]);

	const handleLike = async () => {
		if (liking) return;
		setLiking(true);
		try {
			const res = await authFetch(`${API_Route}/announcements/${id}/like`, {
				method: 'POST'
			}).catch(() => null);
			if (!res || !res.ok) {
				Modal.error({
					title: 'Error',
					content: 'Failed to like announcement. Please try again later.',
					centered: true
				});
				setLiking(false);
				return;
			}
			// Refetch the announcement to get updated likes
			const refreshRes = await authFetch(`${API_Route}/announcements/${id}`).catch(() => null);
			if (refreshRes && refreshRes.ok) {
				const updatedData = await refreshRes.json();
				setAnnouncement(updatedData);
				pushToCache('announcements', updatedData, true);
			}
		} catch (e) {
			Modal.error({ title: 'Error', content: 'Failed to like announcement.' });
		} finally {
			setLiking(false);
		}
	};

	const handleApprove = async () => {
		Modal.confirm({
			title: 'Approve Announcement',
			content: 'Are you sure you want to approve this announcement? It will be published and visible to all users.',
			centered: true,
			okText: 'Approve',
			onOk: async () => {
				const res = await authFetch(`${API_Route}/announcements/${id}/approve`, {
					method: 'PATCH'
				}).catch(() => null);
				if (!res || !res.ok) {
					Modal.error({
						title: 'Error',
						content: 'Failed to approve announcement. Please try again later.',
						centered: true
					});
					return;
				};
				const updatedAnnouncement = await res.json();
				// Update cache
				pushToCache('announcements', updatedAnnouncement, true);
				setAnnouncement(updatedAnnouncement);
				Modal.success({
					title: 'Approved',
					content: 'Announcement has been approved and published successfully.',
					centered: true
				});
			}
		});
	};

	React.useLayoutEffect(() => {
		const actions = [
			<Button
				type='primary'
				icon={<LeftOutlined />}
				onClick={() => navigate(-1)}
				key='back'
			/>
		];

		// Add Approve button if announcement is not approved
		if (announcement && announcement.approved === false) {
			actions.push(
				<Button
					type='primary'
					icon={<CheckOutlined />}
					onClick={handleApprove}
					key='approve'
				>
					Approve Announcement
				</Button>
			);
		};

		actions.push(
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
							};
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
		);

		setHeader({
			title: `Announcement ${id || ''}`,
			actions
		});
	}, [setHeader, id, announcement]);

	React.useEffect(() => {
		setSelectedKeys(['announcements']);
	}, [setSelectedKeys]);

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

	// support common date field names
	const createdAt = announcement.createdAt || announcement.created_at || announcement.date || null;
	const createdStr = formatDate(createdAt);

	const postComment = async () => {
		if (!commentText || commentText.trim().length === 0) return;
		setPosting(true);
		try {
			const res = await authFetch(`${API_Route}/announcements/${id}/comments`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: commentText.trim() })
			}).catch(() => null);
			if (!res || !res.ok) {
				Modal.error({ title: 'Error', content: 'Failed to post comment. Please try again.' });
				setPosting(false);
				return;
			}
			const { comment } = await res.json();
			// Append to local state and cache
			setAnnouncement(prev => ({ ...prev, comments: [...(prev.comments || []), comment] }));
			try { pushToCache('announcements', { ...announcement, comments: [...(announcement.comments || []), comment] }, true); } catch (e) { /* ignore */ }
			setCommentText('');
			Modal.success({ title: 'Comment posted' });
		} catch (e) {
			Modal.error({ title: 'Error', content: 'Failed to post comment. Please try again later.' });
		} finally {
			setPosting(false);
		};
	};

	return (
			<Card>
			<Flex vertical gap={32} style={{ width: '100%' }}>
				{announcement.cover && (
					<Image src={announcement.cover} alt={announcement.title} style={{ objectFit: 'cover', width: '100%', maxHeight: 360 }} fallback='/Placeholder Image.svg' />
				)}
				<div>
					<Flex gap={8} align='center' style={{ marginBottom: 8 }}>
						<Title level={1} style={{ marginBottom: 0 }}>{announcement.title}</Title>
						{announcement.approved === false && (
							<Tag color='orange'>Pending Approval</Tag>
						)}
					</Flex>
					{createdStr && (
						<Text type='secondary' style={{ display: 'block', marginBottom: 8 }}>
							Posted: {createdStr}
						</Text>
					)}
				</div>
				<div style={{ width: '100%' }}>
					<MDEditor.Markdown source={announcement.content || ''} />
				</div>

				<Divider />

				<Flex gap={8} align='center'>
					{announcement.author === 'superapi-bypass' ? (
						<Avatar size={32} icon={<UserOutlined />} />
					) : (
						<Avatar size={32} src={announcement.author?.profilePicture || null} />
					)}
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
									}[announcement.author?.role] || announcement.author?.role
								}{announcement.organization ? ` - ${announcement.organization.shortName}` : ' - OSAS'}</Text>
						</Flex>
					)}
				</Flex>

				{/* Like Section */}
				{announcement.approved && (
					<Flex gap={4} align='center'>
						<Button
							type='text'
							icon={hasLiked ? <HeartFilled style={{ color: 'var(--ant-color-primary)' }} /> : <HeartOutlined />}
							loading={liking}
							onClick={handleLike}
							size='large'
						/>
						<Popover
							content={
								<div style={{ maxHeight: 300, overflowY: 'auto', maxWidth: 300 }}>
									{(announcement.likes || []).length === 0 ? (
										<Text type='secondary'>No likes yet</Text>
									) : (
										<List
											dataSource={announcement.likes || []}
											renderItem={(like) => (
												<List.Item style={{ padding: '8px 0', border: 'none' }}>
													<Flex gap={8} align='center'>
														<Avatar
															size={32}
															src={like.author?.profilePicture || null}
															icon={<UserOutlined />}
														/>
														<Flex vertical>
															<Text style={{ fontWeight: 500 }}>
																{like.author?.name?.first || ''} {like.author?.name?.last || ''}
															</Text>
															{like.author?.role && (
																<Text type='secondary' style={{ fontSize: 12 }}>
																	{
																		{
																			'head': 'Head',
																			'guidance': 'Guidance Officer',
																			'prefect': 'Prefect of Discipline Officer',
																			'student-affairs': 'Student Affairs Officer',
																			'student': 'Student'
																		}[like.author.role] || like.author.role
																	}
																</Text>
															)}
														</Flex>
													</Flex>
												</List.Item>
											)}
										/>
									)}
								</div>
							}
							title={`${(announcement.likes || []).length} ${(announcement.likes || []).length === 1 ? 'Like' : 'Likes'}`}
							trigger='click'
						>
							<Button type='link' style={{ padding: 0, height: 'auto' }}>
								<Text type='secondary' style={{ cursor: 'pointer' }}>
									{(announcement.likes || []).length} {(announcement.likes || []).length === 1 ? 'like' : 'likes'}
								</Text>
							</Button>
						</Popover>
					</Flex>
				)}				{/* Comments Section */}
				{announcement.approved && (
					<>
						<Divider />

						<Flex vertical gap={16} style={{ width: '100%' }}>
							<Title level={4}>Comments ({(announcement.comments || []).length})</Title>
							{(announcement.comments || []).length === 0 && (
								<Text type='secondary'>No comments yet. Be the first to comment.</Text>
							)}
							{(announcement.comments || []).map((comment) => (
								<Flex key={String(comment.id)} gap={8} style={{ padding: 8, borderRadius: 6, background: 'var(--ant-bg-container)', position: 'relative' }}>
									{/* Delete comment button for author or staff */}
									{(cache.staff && (String(cache.staff.id) === String(comment.author) || ['head', 'guidance', 'prefect', 'student-affairs'].includes(cache.staff.role))) && (
										<Button
											type='text'
											danger
											style={{ position: 'absolute', right: 8, top: 8 }}
											onClick={() => {
												Modal.confirm({
													title: 'Delete Comment',
													content: 'Are you sure you want to delete this comment? This action cannot be undone.',
													centered: true,
													onOk: async () => {
														const res = await authFetch(`${API_Route}/announcements/${id}/comments/${comment.id}`, { method: 'DELETE' }).catch(() => null);
														if (!res || !res.ok) {
															Modal.error({ title: 'Error', content: 'Failed to delete comment. Please try again later.' });
															return;
														}
														// remove locally
														setAnnouncement(prev => ({ ...prev, comments: (prev.comments || []).filter(c => String(c.id) !== String(comment.id)) }));
														try { pushToCache('announcements', { ...announcement, comments: (announcement.comments || []).filter(c => String(c.id) !== String(comment.id)) }, true); } catch (e) { /* ignore */ }
														Modal.success({ title: 'Comment deleted' });
													}
												});
											}}
										>
											Delete
										</Button>
									)}
									{comment.author === 'superapi-bypass' ? (
										<Avatar size={32} icon={<UserOutlined />} />
									) : (
										<Avatar size={32} src={comment.author?.profilePicture || null} />
									)}
									<Flex vertical style={{ width: '100%' }}>
										<Flex gap={8}>
											<Text>{comment.author === 'superapi-bypass' ? 'System' : `${comment.author?.name?.first || ''} ${comment.author?.name?.last || ''}`}</Text>
											<Text type='secondary'>{formatDate(comment.date || comment.created_at || comment.date)}</Text>
										</Flex>
										<div style={{ marginTop: 6 }}>
											{comment.content}
										</div>
									</Flex>
								</Flex>
							))}

							{/* Composer */}
							<div style={{ width: '100%' }}>
								<Input.TextArea
									value={commentText}
									onChange={(e) => setCommentText(e.target.value)}
									rows={3}
									placeholder='Write a comment...'
								/>
								<div style={{ marginTop: 8, textAlign: 'right' }}>
									<Button type='primary' loading={posting} onClick={postComment} disabled={posting || !commentText.trim()}>
										Post Comment
									</Button>
								</div>
							</div>
						</Flex>
					</>
				)}
			</Flex>
		</Card>
	);
};

export default ViewAnnouncement;

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
const Requests = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const isMobile = useMobile();
	const { cache, updateCache } = useCache();
	const { setRefresh } = useRefresh();
	const app = App.useApp();

	React.useEffect(() => {
		setSelectedKeys(['requests']);
	}, [setSelectedKeys]);

	/** @typedef {'open' | 'accepted' | 'rejected'} Status */
	/** @type {[Status, React.Dispatch<React.SetStateAction<Status>>]} */
	const [status, setStatus] = React.useState('open');

	const [search, setSearch] = React.useState('');
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearching] = React.useState(false);

	const [selectedRequest, setSelectedRequest] = React.useState(null);
	const [modalVisible, setModalVisible] = React.useState(false);
	const [responseMessage, setResponseMessage] = React.useState('');
	const [submitting, setSubmitting] = React.useState(false);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchSearchResults = async () => {
			if (search.length === 0) return setSearchResults([]);

			setSearching(true);
			const request = await authFetch(`${API_Route}/requests?q=${encodeURIComponent(search)}`, { signal: controller.signal });
			if (!request?.ok) {
				setSearching(false);
				return;
			}

			const data = await request.json();
			if (!data || !Array.isArray(data.requests)) {
				setSearching(false);
				return;
			}
			setSearchResults(data.requests);
			setSearching(false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search]);

	const handleViewRequest = (request) => {
		setSelectedRequest(request);
		setResponseMessage('');
		setModalVisible(true);
	};

	const handleUpdateStatus = async (newStatus) => {
		if (!selectedRequest) return;

		setSubmitting(true);
		try {
			const response = await authFetch(`${API_Route}/requests/${selectedRequest.id}/status`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					status: newStatus,
					response: responseMessage
				})
			});

			if (!response?.ok) {
				app.message.error('Failed to update request status');
				setSubmitting(false);
				return;
			}

			const data = await response.json();
			app.message.success(`Request ${newStatus === 'accepted' ? 'accepted' : 'rejected'} successfully`);

			// Update cache
			if (cache.requests) {
				const updatedRequests = cache.requests?.map(req =>
					req.id === selectedRequest.id ? { ...req, status: newStatus, response: responseMessage } : req
				);
				updateCache('requests', updatedRequests);
			}

			setModalVisible(false);
			setSelectedRequest(null);
			setResponseMessage('');
			setRefresh(prev => prev + 1);
		} catch (error) {
			console.error('Error updating request status:', error);
			app.message.error('An error occurred while updating the request');
		} finally {
			setSubmitting(false);
		}
	};

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Student Requests',
			actions: [
				<Flex style={{ flexGrow: isMobile ? 1 : '' }} key='search'>
					<Dropdown
						showArrow={false}
						open={search.length > 0}
						position='bottomRight'
						placement='bottomRight'
						menu={{
							items: searchResults.length > 0 ? searchResults.map((request) => ({
								key: request.id,
								label: (
									<div style={{ width: '100%' }}>
										<Flex justify='space-between' align='center' gap={8}>
											<Text>{request.student?.name?.first} {request.student?.name?.last} - {formatRequestType(request.type)}</Text>
											<Tag color={getStatusColor(request.status)}>
												<Text style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>
													{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
												</Text>
											</Tag>
										</Flex>
									</div>
								)
							})) : [{
								key: 'no-results',
								label: <Text>No results found</Text>,
								disabled: true
							}],
							placement: 'bottomRight',
							style: { width: isMobile ? '100%' : 300, maxHeight: 400, overflowY: 'auto' },
							emptyText: 'No results found',
							onClick: (e) => {
								const request = searchResults.find(r => r.id === e.key);
								if (request) {
									handleViewRequest(request);
								}
								setSearch('');
							}
						}}
					>
						<Input.Search
							placeholder='Search by student name'
							allowClear
							suffix={searching ? <Spin size='small' /> : null}
							onChange={(e) => {
								const value = e.target.value;
								clearTimeout(window.requestDebounceTimer);
								const debounceTimer = setTimeout(() => {
									setSearch(value);
								}, 512);
								window.requestDebounceTimer = debounceTimer;
							}}
							style={{ width: '100%', minWidth: isMobile ? '100%' : 256 }}
						/>
					</Dropdown>
				</Flex>,
				<Segmented
					key='status-filter'
					options={[
						{ label: 'Open', value: 'open', title: 'Open Requests' },
						{ label: 'Accepted', value: 'accepted', title: 'Accepted Requests' },
						{ label: 'Rejected', value: 'rejected', title: 'Rejected Requests' }
					]}
					value={status}
					onChange={(value) => {
						setStatus(value);
					}}
				/>
			]
		});
	}, [setHeader, isMobile, status, search, searching, searchResults]);

	return (
		<>
			<ContentPage
				fetchUrl={`${API_Route}/requests?status=${status}`}
				emptyText='No requests found'
				cacheKey='requests'
				transformData={(data) => data.requests || []}
				renderItem={(request) => (
					<RequestCard
						request={request}
						loading={request.placeholder}
						onView={() => handleViewRequest(request)}
					/>
				)}
			/>

			<RequestDetailModal
				open={modalVisible}
				onClose={() => {
					setModalVisible(false);
					setSelectedRequest(null);
					setResponseMessage('');
				}}
				request={selectedRequest}
				responseMessage={responseMessage}
				setResponseMessage={setResponseMessage}
				submitting={submitting}
				onUpdateStatus={handleUpdateStatus}
			/>
		</>
	);
};

/**
 * @type {React.FC<{
 * 	open: boolean,
 * 	onClose: () => void,
 * 	request: any,
 * 	responseMessage: string,
 * 	setResponseMessage: (value: string) => void,
 * 	submitting: boolean,
 * 	onUpdateStatus: (status: string) => void
 * }>}
 */
const RequestDetailModal = ({ open, onClose, request, responseMessage, setResponseMessage, submitting, onUpdateStatus }) => {
	const navigate = useNavigate();

	if (!request) return null;

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			width={700}
			title={
				<Flex align='center' gap={8}>
					<FileTextOutlined />
					<Text strong style={{ fontSize: 18 }}>
						{formatRequestType(request.type)}
					</Text>
					<Tag color={getStatusColor(request.status)}>
						{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
					</Tag>
				</Flex>
			}
		>
			<Flex vertical gap={16}>
				{/* Student Info */}
				<Flex gap={12} align='flex-start'>
					<Avatar
						size={48}
						shape='square'
						src={request.student?.profilePicture || null}
						icon={<UserOutlined />}
						style={{ cursor: 'pointer' }}
						onClick={() => {
							navigate(`/dashboard/students/profile/${request.student?.id}`);
							onClose();
						}}
					/>
					<Flex vertical>
						<Text strong style={{ fontSize: 16, cursor: 'pointer' }}
							onClick={() => {
								navigate(`/dashboard/students/profile/${request.student?.id}`);
								onClose();
							}}
						>
							{request.student?.name?.first} {request.student?.name?.last}
						</Text>
						<Text type='secondary'>
							{request.student?.email}
						</Text>
						{request.student?.hasOngoingCase && (
							<Tag color="warning" icon={<WarningOutlined />} style={{ marginTop: 4, width: 'fit-content' }}>
								Has Ongoing Cases
							</Tag>
						)}
						{request.student?.hasOngoingRecord && (
							<Tag color="error" icon={<WarningOutlined />} style={{ marginTop: 4, width: 'fit-content' }}>
								Has Ongoing Records
							</Tag>
						)}
					</Flex>
				</Flex>

				{/* Student Message */}
				{request.message && (
					<>
						<Divider style={{ margin: '8px 0' }} />
						<Flex vertical gap={8}>
							<Text type='secondary' strong>Message from Student</Text>
							<Paragraph style={{ marginBottom: 0 }}>
								{request.message}
							</Paragraph>
						</Flex>
					</>
				)}

				{/* Staff Response */}
				{request.response && (
					<>
						<Divider style={{ margin: '8px 0' }} />
						<Flex vertical gap={8}>
							<Text type='secondary' strong>Staff Response</Text>
							<Paragraph style={{
								marginBottom: 0,
								padding: 12,
								backgroundColor: 'var(--ant-color-bg-container)',
								borderRadius: 8,
								border: `2px solid ${request.status === 'accepted' ? 'var(--ant-color-success)' : 'var(--ant-color-error)'}`
							}}>
								{request.response}
							</Paragraph>
						</Flex>
					</>
				)}

				{/* Submission Date */}
				<Divider style={{ margin: '8px 0' }} />
				<Flex vertical gap={4}>
					<Text type='secondary' style={{ fontSize: 12 }}>
						Submitted on {new Date(request.createdAt).toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})}
					</Text>
					{request.updatedAt && request.updatedAt !== request.createdAt && (
						<Text type='secondary' style={{ fontSize: 12 }}>
							Last updated on {new Date(request.updatedAt).toLocaleDateString('en-US', {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
								hour: '2-digit',
								minute: '2-digit'
							})}
						</Text>
					)}
				</Flex>

				{/* Action Form (only for open requests) */}
				{request.status === 'open' && (
					<>
						<Divider style={{ margin: '8px 0' }} />
						<Flex vertical gap={8}>
							<Text strong>Response to Student</Text>
							<Input.TextArea
								placeholder='Enter your response message (optional)'
								rows={4}
								value={responseMessage}
								onChange={(e) => setResponseMessage(e.target.value)}
							/>
						</Flex>

						<Flex gap={8} justify='flex-end' style={{ marginTop: 8 }}>
							<Button onClick={onClose}>
								Close
							</Button>
							<Button
								danger
								icon={<CloseOutlined />}
								loading={submitting}
								onClick={() => onUpdateStatus('rejected')}
							>
								Reject
							</Button>
							<Button
								type='primary'
								icon={<CheckOutlined />}
								loading={submitting}
								onClick={() => onUpdateStatus('accepted')}
							>
								Accept
							</Button>
						</Flex>
					</>
				)}

				{/* Footer for non-open requests */}
				{request.status !== 'open' && (
					<>
						<Divider style={{ margin: '8px 0' }} />
						<Flex justify='flex-end'>
							<Button onClick={onClose}>
								Close
							</Button>
						</Flex>
					</>
				)}
			</Flex>
		</Modal>
	);
};

const RequestCard = ({ request, loading, onView }) => {
	return (
		<ItemCard
			hoverable
			onClick={onView}
			loading={loading}
		>
			<Flex vertical gap={12}>
				{/* Header with Student Info and Status */}
				<Flex justify='space-between' align='start'>
					<Flex gap={12} align='flex-start' style={{ flex: 1 }}>
						<Avatar
							size={40}
							shape='square'
							src={request.student?.profilePicture || null}
							icon={<UserOutlined />}
						/>
						<Flex vertical style={{ flex: 1 }}>
							<Flex align='center' gap={8}>
								<Text strong style={{ fontSize: 16 }}>
									{request.student?.name?.first} {request.student?.name?.last}
								</Text>
								{request.student?.hasOngoingCase && (
									<Tooltip title='This student has ongoing cases'>
										<WarningOutlined style={{ color: '#faad14' }} />
									</Tooltip>
								)}
								{request.student?.hasOngoingRecord && (
									<Tooltip title='This student has ongoing records'>
										<WarningOutlined style={{ color: '#ff4d4f' }} />
									</Tooltip>
								)}
							</Flex>
							<Text type='secondary' style={{ fontSize: 14 }}>
								{request.student?.email}
							</Text>
						</Flex>
					</Flex>
					<Tag color={getStatusColor(request.status)}>
						{request.status.charAt(0).toUpperCase() + request.status.slice(1)}
					</Tag>
				</Flex>

				{/* Request Type */}
				<Flex vertical gap={4}>
					<Text type='secondary' style={{ fontSize: 12 }}>Request Type</Text>
					<Title level={5} style={{ margin: 0 }}>
						<FileTextOutlined style={{ marginRight: 8 }} />
						{formatRequestType(request.type)}
					</Title>
				</Flex>

				{/* Message Preview */}
				{request.message && (
					<Paragraph
						ellipsis={{ rows: 2 }}
						type='secondary'
						style={{
							margin: 0,
							padding: 8,
							backgroundColor: 'var(--ant-color-bg-layout)',
							borderRadius: 6,
							fontSize: 14
						}}
					>
						{request.message}
					</Paragraph>
				)}

				{/* Date */}
				<Text type='secondary' style={{ fontSize: 12 }}>
					Submitted {new Date(request.createdAt).toLocaleDateString()} at {new Date(request.createdAt).toLocaleTimeString()}
				</Text>
			</Flex>
		</ItemCard>
	);
};

// Helper functions
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
		case 'open':
			return 'blue';
		case 'accepted':
			return 'green';
		case 'rejected':
			return 'red';
		default:
			return 'default';
	}
};

export default Requests;
export { RequestCard };
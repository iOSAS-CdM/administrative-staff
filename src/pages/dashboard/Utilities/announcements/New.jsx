import React from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import dayjs from 'dayjs';

import {
	Form,
	Upload,
	Input,
	Button,
	Typography,
	Flex,
	Card,
	Segmented,
	App,
	DatePicker
} from 'antd';

import {
	LeftOutlined,
	UploadOutlined,
	WarningOutlined
} from '@ant-design/icons';

import MDEditor from '@uiw/react-md-editor';

const { Text, Paragraph, Title } = Typography;

import { useCache } from '../../../../contexts/CacheContext';
import { useMobile } from '../../../../contexts/MobileContext';
import { usePageProps } from '../../../../contexts/PagePropsContext';

import authFetch from '../../../../utils/authFetch';
import { API_Route } from '../../../../main';

import '../../../../styles/pages/Markdown.css';

/**
 * @typedef {{
 *   cover: String,
 *   title: String,
 *   content: String,
 *   editMode: Boolean,
 *   date: Date
 * }} Announcement
 */

/**
 * @type {React.FC}
 */
const NewAnnouncement = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	React.useLayoutEffect(() => {
		setHeader({
			title: 'Create a new Announcement',
			actions: [
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate(-1)}
				>
					Back
				</Button>
			]
		});
	}, [setHeader]);

	React.useEffect(() => {
		setSelectedKeys(['announcements']);
	}, [setSelectedKeys]);

	const { cache } = useCache();
	const isMobile = useMobile();
	const { modal: Modal, notification } = App.useApp();

	const [form] = Form.useForm();
	const [announcement, setAnnouncement] = React.useState({
		title: '',
		content: '',
		type: 'information',
		eventDate: null
	});
	// coverPreview is a base64 data URL for display; coverFile is the original File to send
	const [coverPreview, setCoverPreview] = React.useState('');
	const [coverFile, setCoverFile] = React.useState(null);

	return (
		<Form
			form={form}
			layout='vertical'
			initialValues={{
				title: '',
				content: '',
				cover: ''
			}}
		>
			<Flex vertical gap={16}>
				<AnimatePresence mode='popLayout'>
					<motion.div
						key='upload-form'
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						style={{ width: '100%', minHeight: '100%' }}
					>
						<Card>
							<Form.Item
								name='cover'
								label='Cover Image'
								valuePropName='file'
								rules={[{ required: true, message: 'Please upload a cover image' }]}
							>
								{/* value is managed manually via setFieldsValue when a file is chosen */}
								<Upload.Dragger
									listType='picture'
									beforeUpload={(file) => {
										// keep the File object for submission and a preview for display
										setCoverFile(file);
										form.setFieldsValue({ cover: file });
										if (FileReader && file) {
											const reader = new FileReader();
											reader.onload = (e) => {
												const dataUrl = e.target.result;
												setCoverPreview(dataUrl);
											};
											reader.readAsDataURL(file);
										}
										return false; // Prevent auto upload
									}}
									showUploadList={false}
									style={{
										position: 'relative',
										width: '100%',
										height: 256
									}}
									accept='.jpg,.jpeg,.png'
								>
									{coverPreview ? (
										<div style={{ position: 'relative' }}>
											<img
												src={coverPreview}
												alt='Uploaded file preview'
												style={{
													width: '100%',
													height: 256,
													objectFit: 'cover',
													borderRadius: 'var(--border-radius)'
												}}
											/>
											<Button
												size='small'
												danger
												style={{ position: 'absolute', top: 8, right: 8 }}
												onClick={(e) => {
													e.stopPropagation();
													setCoverPreview('');
													setCoverFile(null);
													form.setFieldsValue({ cover: undefined });
												}}
											>Remove</Button>
										</div>
									) : (
										<>
											<UploadOutlined style={{ fontSize: 32 }} />
											<Title level={5} style={{ margin: 0 }}>
												Upload Cover Image
											</Title>
											<Paragraph
												type='secondary'
												style={{ textAlign: 'center' }}
											>
												Click or drag and drop a file here.
											</Paragraph>
										</>
									)}
								</Upload.Dragger>
							</Form.Item>
						</Card>
					</motion.div>
					<motion.div
						key='edit-form'
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						style={{ width: '100%', minHeight: '100%' }}
					>
						<Card>
							<Form.Item
								name='title'
								label='Title'
								rules={[{ required: true, message: 'Please enter an announcement title' }]}
							>
								<Input
									placeholder='Announcement title'
									onChange={(e) => {
										const v = e.target.value;
										setAnnouncement((prev) => ({ ...prev, title: v }));
										// Keep form in sync (Ant Form already does this via name prop, but keep state consistent)
										form.setFieldsValue({ title: v });
									}}
								/>
							</Form.Item>

							<Form.Item
								name='content'
								label='Content'
								rules={[{ required: true, message: 'Please enter announcement content' }]}
							>
								<MDEditor
									value={announcement.content}
									textareaProps={{ id: 'text-area', placeholder: 'Write announcement content...' }}
									onChange={(value) => {
										// value can be undefined sometimes; coerce to string
										const newVal = value || '';
										form.setFieldsValue({ content: newVal });
										setAnnouncement((prev) => ({ ...prev, content: newVal }));
									}}
								/>
							</Form.Item>

							<Flex gap={16} align='center'>
								<Form.Item
									label='Type'
									name='type'
									initialValue={announcement.type}
									rules={[{ required: true, message: 'Please select an announcement type' }]}
								>
									<Segmented
										options={[
											{ label: 'Information', value: 'information' },
											{ label: 'Event', value: 'event' },
										]}
										value={announcement.type || 'information'}
										onChange={(value) => {
											setAnnouncement((prev) => ({ ...prev, type: value }));
											// When switching away from event, clear the date field and its validation
											if (value !== 'event') {
												form.setFieldsValue({ eventDate: null });
												setAnnouncement((prev) => ({ ...prev, eventDate: null }));
												form.validateFields().catch(() => { });
											}
										}}
									/>
								</Form.Item>

								{announcement.type === 'event' && (
									<Form.Item
										label='Event Date & Time'
										name='eventDate'
										rules={[{ required: true, message: 'Please select the event date and time' }]}
									>
										<DatePicker
											showTime
											style={{ width: '100%' }}
											value={announcement.eventDate ? dayjs(announcement.eventDate) : null}
											// prevent selecting dates before today
											disabledDate={(current) => {
												if (!current) return false;
												// current may be a moment or dayjs object; use startOf('day') for comparison
												const currentStart = current.startOf ? current.startOf('day') : dayjs(current).startOf('day');
												return currentStart.isBefore(dayjs().startOf('day'));
											}}
											onChange={(value) => {
												// value is a moment/dayjs object
												setAnnouncement((prev) => ({ ...prev, eventDate: value }));
												form.setFieldsValue({ eventDate: value });
											}}
										/>
									</Form.Item>
								)}
							</Flex>
						</Card>
					</motion.div>

					<motion.div
						key='controls'
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						style={{ width: '100%', minHeight: '100%' }}
					>
						<Card>
							<Flex justify='flex-end' align='center' gap={16}>
								<Button
									type='primary'
									onClick={async () =>
										form.validateFields()
											.then((values) => {
												const formData = new FormData();
												formData.append('title', values.title);
												formData.append('content', values.content);
												formData.append('cover', coverFile, coverFile.name);
												// include type and event date if present
												const type = values.type || announcement.type || 'information';
												formData.append('type', type);
												if (type === 'event') {
													const dateVal = values.eventDate || announcement.eventDate;
													// convert moment/dayjs to ISO string if possible
													const iso = dateVal && dateVal.toISOString ? dateVal.toISOString() : (dateVal ? String(dateVal) : '');
													formData.append('eventDate', iso);
												}

												Modal.confirm({
													title: 'Publish Announcement',
													content: 'Are you sure you want to publish this announcement?',
													onOk: async () => {
														const response = await authFetch(`${API_Route}/announcements`, {
															method: 'POST',
															body: formData
														});

														if (!response?.ok) {
															notification.error({
																message: 'Error',
																description: `Failed to publish announcement: ${response?.statusText || 'Unknown error'}`,
															});
															return;
														};

														navigate('/dashboard/utilities/announcements');
													}
												})
											})
									}
								>Publish</Button>
								<Text type='secondary'>
									<WarningOutlined style={{ color: 'var(--warning-color)' }} /> Once published, announcements cannot be edited. Please review all information before publishing.
								</Text>
							</Flex>
						</Card>
					</motion.div>
				</AnimatePresence>
			</Flex>
		</Form>
	);
};

export default NewAnnouncement;

import React from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

import {
	Form,
	Upload,
	Input,
	Button,
	Typography,
	Flex,
	Card,
	Divider,
	Dropdown,
	Segmented,
	App
} from 'antd';

import {
	LeftOutlined,
	UploadOutlined,
	FontSizeOutlined,
	BoldOutlined,
	ItalicOutlined,
	UnderlineOutlined,
	StrikethroughOutlined,
	UnorderedListOutlined,
	OrderedListOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	FileImageOutlined,
	LinkOutlined,
	FileAddOutlined
} from '@ant-design/icons';

import MDEditor from '@uiw/react-md-editor';

const { Text, Paragraph, Title } = Typography;

import { useCache } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

import '../../../styles/pages/Markdown.css';

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
	const Modal = App.useApp().modal;

	const AnnouncementForm = React.useRef(null);
	const [announcement, setAnnouncement] = React.useState({
		title: '',
		description: ''
	});
	const [cover, setCover] = React.useState('');

	return (
		<Form
			ref={AnnouncementForm}
			layout='vertical'
			initialValues={{
				title: '',
				description: ''
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
								<Upload.Dragger
									listType='picture'
									beforeUpload={(file) => {
										if (FileReader && file) {
											const reader = new FileReader();
											reader.onload = (e) => {
												setCover(e.target.result);
											};
											reader.readAsDataURL(file);
										};
										return false;
									}} // Prevent auto upload
									showUploadList={false}
									style={{
										position: 'relative',
										width: '100%',
										height: 256
									}}
									accept='.jpg,.jpeg,.png'
								>
									{cover ? (
										<img
											src={cover}
											alt='Uploaded file preview'
											style={{
												width: '100%',
												height: 256,
												objectFit: 'cover',
												borderRadius: 'var(--border-radius)'
											}}
										/>
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
							</Card>
					</motion.div>
					<motion.div
						key='edit-form'
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						style={{ width: '100%', minHeight: '100%' }}
					>
						<MDEditor
							value={announcement.description}
							textareaProps={{ id: 'text-area', placeholder: 'Write announcement content...' }}
							onChange={(value) => {
								// value can be undefined sometimes; coerce to string
								const newVal = value || '';
								AnnouncementForm.current.setFieldsValue({ description: newVal });
								setAnnouncement((prev) => ({ ...prev, description: newVal }));
							}}
						/>
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
								<Button type='default'>Save as Draft</Button>
								<Button type='primary'>Publish</Button>
							</Flex>
						</Card>
					</motion.div>
				</AnimatePresence>
			</Flex>
		</Form>
	);
};

export default NewAnnouncement;

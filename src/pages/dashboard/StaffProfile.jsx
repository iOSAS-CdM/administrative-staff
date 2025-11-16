import React from 'react';
import { useNavigate } from 'react-router';

import {
	Card,
	Flex,
	Avatar,
	Typography,
	Skeleton,
	Row,
	Col,
	Space,
	Button,
	Upload,
	Modal,
	App
} from 'antd';

import {
	UserOutlined,
	MailOutlined,
	IdcardOutlined,
	SafetyOutlined,
	EditOutlined,
	UploadOutlined,
	LoadingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import { useMobile } from '../../contexts/MobileContext';
import { usePageProps } from '../../contexts/PagePropsContext';
import { useCache } from '../../contexts/CacheContext';
import authFetch from '../../utils/authFetch';
import { API_Route } from '../../main';

/**
 * @type {React.FC}
 */
const StaffProfile = () => {
	const isMobile = useMobile();
	const { setHeader, setSelectedKeys, staff } = usePageProps();
	const { updateCache } = useCache();
	const navigate = useNavigate();
	const { notification } = App.useApp();

	const [isModalVisible, setIsModalVisible] = React.useState(false);
	const [selectedFile, setSelectedFile] = React.useState(null);
	const [previewImage, setPreviewImage] = React.useState(null);
	const [uploading, setUploading] = React.useState(false);

	React.useEffect(() => {
		setHeader({
			title: 'My Profile',
			actions: []
		});
		setSelectedKeys(['profile']);
	}, []);

	const roleLabels = {
		'head': 'Head',
		'guidance': 'Guidance Officer',
		'prefect': 'Prefect of Discipline Officer',
		'student-affairs': 'Student Affairs Officer'
	};

	const handleFileSelect = (file) => {
		// Read the file as data URL for preview
		const reader = new FileReader();
		reader.onload = (e) => {
			setPreviewImage(e.target.result);
		};
		reader.readAsDataURL(file);
		setSelectedFile(file);
		return false; // Prevent auto upload
	};

	const handleUpload = async () => {
		if (!selectedFile) {
			notification.error({
				message: 'No file selected',
				description: 'Please select an image to upload.',
			});
			return;
		};

		setUploading(true);

		try {
			// Create FormData
			const formData = new FormData();
			formData.append('profilePicture', selectedFile);

			// Upload to API
			const response = await authFetch(`${API_Route}/users/profile-picture`, {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.message || 'Failed to upload profile picture');
			};

			const data = await response.json();

			// Refresh staff data from the API to get updated profile picture
			const staffResponse = await authFetch(`${API_Route}/auth/me`);
			if (staffResponse.ok) {
				const updatedStaff = await staffResponse.json();
				updateCache('staff', updatedStaff);
			};

			notification.success({
				message: 'Success',
				description: 'Profile picture updated successfully!',
			});

			// Close modal and reset state
			setIsModalVisible(false);
			setSelectedFile(null);
			setPreviewImage(null);
		} catch (error) {
			console.error('Upload error:', error);
			notification.error({
				message: 'Upload failed',
				description: error.message || 'Failed to upload profile picture. Please try again.',
			});
		} finally {
			setUploading(false);
		};
	};

	const handleCancel = () => {
		setIsModalVisible(false);
		setSelectedFile(null);
		setPreviewImage(null);
	};

	if (!staff) return <Skeleton active />;

	return (
		<>
			<Flex vertical gap={16}>
				<Card style={{ width: '100%' }}>
					<Flex vertical gap={16} align='center'>
						<div style={{ position: 'relative', width: isMobile ? 128 : 246, height: isMobile ? 128 : 246 }}>
							<Avatar
								size={isMobile ? 128 : 246}
								icon={<UserOutlined />}
								src={`${staff.profilePicture}?t=${Date.now()}`}
								shape='square'
							/>

							<Button
								type='primary'
								style={{ position: 'absolute', bottom: 0, right: 0 }}
								icon={<EditOutlined />}
								onClick={() => setIsModalVisible(true)}
							/>
						</div>
						<Title level={isMobile ? 3 : 2}>{staff.name.first} {staff.name.last}</Title>
						<Row gutter={[16, 16]} justify='center'>
							<Col>
								<Space>
									<IdcardOutlined />
									<Text>{staff.id}</Text>
								</Space>
							</Col>
							<Col>
								<Space>
									<MailOutlined />
									<Text>{staff.email}</Text>
								</Space>
							</Col>
							<Col>
								<Space>
									<SafetyOutlined />
									<Text>{roleLabels[staff.role]}</Text>
								</Space>
							</Col>
						</Row>
					</Flex>
				</Card>
			</Flex>

			{/* Profile Picture Upload Modal */}
			<Modal
				title="Update Profile Picture"
				open={isModalVisible}
				onOk={handleUpload}
				onCancel={handleCancel}
				okText={uploading ? 'Uploading...' : 'Upload'}
				cancelText="Cancel"
				confirmLoading={uploading}
				okButtonProps={{ disabled: !selectedFile || uploading }}
			>
				<Flex vertical gap={16} align='center' style={{ padding: '16px 0' }}>
					<Upload.Dragger
						accept="image/*"
						beforeUpload={handleFileSelect}
						showUploadList={false}
						maxCount={1}
						style={{ width: '100%' }}
					>
						{previewImage ? (
							<div style={{ position: 'relative' }}>
								<Avatar
									src={previewImage}
									size={200}
									shape='square'
									style={{ margin: '16px auto' }}
								/>
								<Text type="secondary" style={{ display: 'block', marginTop: 8 }}>
									Click or drag to select a different image
								</Text>
							</div>
						) : (
							<Flex vertical gap={8} align='center' style={{ padding: 32 }}>
								<UploadOutlined style={{ fontSize: 48, color: 'var(--ant-color-primary)' }} />
								<Title level={5} style={{ margin: 0 }}>
									Click or drag image to upload
								</Title>
								<Text type='secondary'>
									Supported formats: JPG, PNG, GIF
								</Text>
								<Text type='secondary'>
									Maximum size: 2MB
								</Text>
							</Flex>
						)}
					</Upload.Dragger>

					{uploading && (
						<Flex gap={8} align='center'>
							<LoadingOutlined />
							<Text>Uploading your profile picture...</Text>
						</Flex>
					)}
				</Flex>
			</Modal>
		</>
	);
};

export default StaffProfile;

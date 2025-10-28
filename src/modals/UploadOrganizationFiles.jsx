import React from 'react';

import {
	Upload,
	Typography,
	Form,
	Flex
} from 'antd';

import {
	UploadOutlined,
	ClearOutlined,
	SaveOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const UploadFileForm = React.createRef();

import { API_Route } from '../main';
import authFetch from '../utils/authFetch';

const { Title, Paragraph } = Typography;

const FileUploadForm = () => {
	const normFile = (e) => {
		if (Array.isArray(e))
			return e;
		return e?.fileList;
	};

	return (
		<Form
			layout='vertical'
			ref={UploadFileForm}
			onFinish={(values) => {
			}}
			style={{ width: '100%' }}
			initialValues={{
				files: [] // Array of upload file objects
			}}
		>
			<Flex vertical gap={16} style={{ width: '100%' }}>
				<Form.Item
					name='files'
					valuePropName='fileList.fileList'
				>
					<Upload.Dragger
						listType='picture'
						multiple
						beforeUpload={() => false} // Prevent auto upload
						accept='image/*'
						getValueFromEvent={normFile}
						style={{
							position: 'relative',
							width: '100%'
						}}
					>
						<Flex vertical justify='center' align='center' style={{ width: '100%', height: '100%' }} gap={8}>
							<UploadOutlined style={{ fontSize: 32 }} />
							<Title level={5} style={{ margin: 0 }}>
								Upload Case Images
							</Title>
							<Paragraph type='secondary' style={{ textAlign: 'center' }}>
								Open your Mobile App<br />
								or drag and drop files here.
							</Paragraph>
						</Flex>
					</Upload.Dragger>
				</Form.Item>
			</Flex>
		</Form>
	);
};

/**
 * @param {import('antd/es/modal/useModal').HookAPI} Modal
 * @param {string} organizationId
 * 
 * @returns {Promise<any>}
 */
const UploadOrganizationFiles = async (Modal, notification, organizationId) => {
	let uploadResult = null;

	await Modal.info({
		title: 'Upload Files',
		centered: true,
		closable: { 'aria-label': 'Close' },
		content: <FileUploadForm organizationId={organizationId} />,
		icon: <UploadOutlined />,
		width: {
			xs: '90%',
			sm: '80%',
			md: '70%',
			lg: 600,
			xl: 600,
			xxl: 600
		},
		footer: (_, { CancelBtn, OkBtn }) => (
			<Flex justify='flex-end' align='center' gap={16}>
				<Text type='secondary' italic>
					Select files to upload to the case repository
				</Text>
				<CancelBtn />
				<OkBtn />
			</Flex>
		),
		okText: 'Upload Files',
		okButtonProps: {
			icon: <SaveOutlined />
		},
		onOk: () => {
			return new Promise((resolve, reject) => {
				UploadFileForm.current.validateFields()
					.then(async (values) => {
						console.log('Form Values:', values);

						// Upload files if any
						if (values.files.fileList && values.files.fileList.length > 0) {
							const formData = new FormData();
							for (const file of values.files.fileList)
								if (file.originFileObj)
									formData.append('files', file.originFileObj);

							const request = await authFetch(`${API_Route}/repositories/organization/${organizationId}/files`, {
								method: 'POST',
								body: formData
							});

							if (!request?.ok) {
								notification.error({
									message: 'Failed to upload files. Please try again.'
								});
								reject(new Error('Failed to upload files. Please try again.'));
								return;
							};

							uploadResult = await request.json();

							notification.success({
								message: `Successfully uploaded ${values.files.fileList.length} file(s).`
							});
							resolve(uploadResult);
						} else {
							reject(new Error('No files selected for upload.'));
						};
					})
					.catch((errorInfo) => {
						console.error('Validate Failed:', errorInfo);
						notification.error({
							message: 'Failed to validate form. Please check your input.'
						});
						reject(errorInfo);
					});
			});
		},
		cancelText: 'Cancel',
		cancelButtonProps: {
			icon: <ClearOutlined />
		},
		onCancel: () => {
			return new Promise((resolve) => {
				UploadFileForm.current.resetFields();
				resolve();
			});
		}
	});

	return uploadResult;
};

export default UploadOrganizationFiles;
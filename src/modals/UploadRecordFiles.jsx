import React from 'react';

import {
	Upload,
	Image,
	Typography,
	Form,
	Flex,
	Card
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
	const [files, setFiles] = React.useState([]);

	React.useEffect(() => {
		UploadFileForm.current.setFieldsValue({ files });
	}, [files]);

	return (
		<Form
			layout='vertical'
			ref={UploadFileForm}
			onFinish={(values) => {
			}}
			style={{ width: '100%' }}
		>
			<Flex vertical gap={16} style={{ width: '100%' }}>
				<Form.Item name='files'>
					<Upload.Dragger
						listType='picture'
						multiple
						beforeUpload={(file) => {
							if (FileReader && file) {
								const reader = new FileReader();
								reader.onload = (e) => {
									const newFile = {
										name: file.name,
										base64: e.target.result,
										contentType: file.type
									};
									setFiles((prevFiles) => ([...prevFiles, newFile]));
								};
								reader.readAsDataURL(file);
							}
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
				{files.length > 0 && (
					<>
						<Flex wrap="wrap" gap={8} style={{ width: '100%' }}>
							{files.map((file, idx) => (
								<Card key={idx}>
									<Image
										src={file.base64}
										alt={`Uploaded file preview ${idx + 1}`}
										preview={false}
										style={{
											width: 64,
											height: 64,
											objectFit: 'cover',
											borderRadius: 'var(--border-radius)'
										}}
									/>
								</Card>
							))}
						</Flex>
					</>
				)}
			</Flex>
		</Form>
	);
};

/**
 * @param {import('antd/es/modal/useModal').HookAPI} Modal
 * @param {string} recordId
 * 
 * @returns {Promise<any>}
 */
const UploadRecordFiles = async (Modal, recordId) => {
	let uploadResult = null;

	await Modal.info({
		title: 'Upload Files',
		centered: true,
		closable: { 'aria-label': 'Close' },
		content: <FileUploadForm recordId={recordId} />,
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
						console.log(values);
						const request = await authFetch(`${API_Route}/repositories/record/${recordId}/files`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								files: values.files
							})
						});
						if (!request?.ok) {
							reject(new Error('Failed to submit the form. Please try again.'));
							return;
						};

						uploadResult = await request.json();
						resolve(uploadResult);
					})
					.catch((errorInfo) => {
						console.error('Validate Failed:', errorInfo);
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

export default UploadRecordFiles;
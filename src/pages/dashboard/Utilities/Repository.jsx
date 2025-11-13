import React from 'react';

import { App, Button, Typography, Upload, Form, Flex, Image } from 'antd';
import { FileAddOutlined, FileOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { download } from '@tauri-apps/plugin-upload';
import { join, downloadDir } from '@tauri-apps/api/path';

import ItemCard from '../../../components/ItemCard';
import ContentPage from '../../../components/ContentPage';
import { usePageProps } from '../../../contexts/PagePropsContext';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

import { useRefresh } from '../../../contexts/RefreshContext';

const { Text } = Typography;

/**
 * Public Forms / Repository page
 */
const Repository = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const { setRefresh } = useRefresh();

	const { modal: Modal, notification } = App.useApp();
	const UploadForm = React.useRef(null);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Public Form Repository',
			actions: [
				<Button
					key='upload'
					type='primary'
					icon={<FileAddOutlined />}
					onClick={() => {
						Modal.confirm({
							title: 'Upload New Form',
							width: 512,
							content: (<Form
								ref={UploadForm}
								layout='vertical'
							>
								<Form.Item
									name='files'
									label='Files'
									valuePropName='fileList.fileList'
								>
									<Upload.Dragger
										action='/upload.do'
										listType='picture'
										multiple
										getValueFromEvent={(e) => {
											if (Array.isArray(e))
												return e;
											return e?.fileList;
										}}
										beforeUpload={() => false}
										style={{ width: '100%' }}
										styles={{
											list: { marginTop: 16, gap: 16 }
										}}
									>
										<p className='ant-upload-drag-icon'>
											<FileOutlined />
										</p>
										<p className='ant-upload-text'>Click or drag file to this area to upload</p>
										<p className='ant-upload-hint'>Supported formats: PDF, Word, Excel, Images, Text, CSV, JSON, XML</p>
									</Upload.Dragger>
								</Form.Item>
							</Form>),
							okText: 'Upload',
							onOk: async () => UploadForm.current?.validateFields()
								.then(async (values) => {
									console.log(values);
									const formData = new FormData();
									for (const file of values.files?.fileList)
										formData.append('files', file.originFileObj);

									const response = await authFetch(`${API_Route}/repositories/public`, {
										method: 'POST',
										body: formData
									});
									if (!response?.ok) {
										Modal.error({
											title: 'Upload Failed',
											content: 'An error occurred while uploading the form(s). Please try again later.'
										});
										return;
									};
									Modal.success({
										title: 'Upload Successful',
										content: 'The form(s) have been successfully uploaded to the public repository.'
									});
									setRefresh({ timestamp: Date.now() });
								})
								.catch(() => {
									Modal.error({
										title: 'Invalid Input',
										content: 'Please ensure all required fields are filled out correctly.'
									});
								})
						});
					}}
				>Upload New Form</Button>
			]
		});
	}, [setHeader, Modal]);

	React.useEffect(() => {
		setSelectedKeys(['repository']);
	}, [setSelectedKeys]);

	return (
		<ContentPage
			fetchUrl={`${API_Route}/repositories/public`}
			cacheKey='publicRepository'
			emptyText='No public forms available'
			columnSpan={8}
			pageSize={24}
			transformData={(data) => {
				if (!data) return [];
				if (Array.isArray(data)) return data;
				if (Array.isArray(data.files)) return data.files;
				if (Array.isArray(data.repository)) return data.repository;
				return [];
			}}
			renderItem={(file) => (
				<ItemCard
					key={file.id || file.name}
					loading={file.placeholder}
					style={{ width: '100%' }}
					hoverable={false}
				>
					<Flex vertical align='center' gap={16}>
						<Image
							src={file.thumbnailUrl || (file.metadata?.mimetype?.includes('image/') ? file.publicUrl : null)}
							alt={file.name}
							width={'100%'}
							height={128}
							fallback={<FileOutlined />}
							style={{ objectFit: 'contain' }}
						/>
						<Flex vertical align='start' style={{ width: '100%' }}>
							<Text>{file.name}</Text>
							<Text type='secondary'>{file.metadata?.contentLength ? `${(file.metadata.contentLength / 1024).toFixed(2)} KB` : ''} • {file.metadata?.mimetype || ''}</Text>
						</Flex>



						<Flex gap={8} style={{ position: 'absolute', top: 8, right: 8 }}>
							<Button
								type='default'
								size='small'
								icon={<DownloadOutlined />}
								onClick={async (e) => {
									e.stopPropagation();
									if (!file.publicUrl) return;
									try {
										const downloadDirPath = await downloadDir();
										const tempPath = await join(downloadDirPath, file.name);
										const downloadTask = download(file.publicUrl, tempPath, {
											onProgress: (progress) => {
												console.log(`Progress: ${Math.round(progress * 100)}%`);
											}
										});
										notification.info({
											message: 'Download started.',
											description: `Downloading ${file.name}...`,
											duration: 2
										});
										const savedPath = await downloadTask;
										notification.success({
											message: 'Download completed.',
											description: `${file.name} has been downloaded to your Downloads folder.`,
											duration: 4
										});
										console.log('File downloaded to:', savedPath);
									} catch (err) {
										console.error('Download error', err);
										notification.error({
											message: 'Download failed',
											description: `Failed to download ${file.name}`
										});
									};
								}}
							/>
							<Button
								type='default'
								size='small'
								danger
								icon={<DeleteOutlined />}
								onClick={(e) => {
									e.stopPropagation();

									Modal.confirm({
										title: 'Confirm Deletion',
										content: `Are you sure you want to delete the form "${file.name}"? This action cannot be undone.`,
										okText: 'Delete',
										okType: 'danger',
										onOk: async () => {
											const response = await authFetch(`${API_Route}/repositories/public/${file.id}`, {
												method: 'DELETE'
											});
											if (!response?.ok) {
												Modal.error({
													title: 'Deletion Failed',
													content: 'An error occurred while trying to delete the form. Please try again later.'
												});
												return;
											};
											Modal.success({
												title: 'Form Deleted',
												content: `The form "${file.name}" has been successfully deleted.`
											});
											setRefresh({ timestamp: Date.now() });
										}
									});
								}}
							/>
						</Flex>
					</Flex>
				</ItemCard>
			)}
		/>
	);
};

export default Repository;
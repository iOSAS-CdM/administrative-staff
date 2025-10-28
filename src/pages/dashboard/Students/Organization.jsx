import React from 'react';
import { useNavigate, useParams } from 'react-router';

import {
	App,
	Card,
	Button,
	Flex,
	Avatar,
	Typography,
	Calendar,
	Image,
	Form,
	Input,
	Upload,
	Select
} from 'antd';

import {
	EditOutlined,
	LeftOutlined,
	PlusOutlined,
	InboxOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import PanelCard from '../../../components/PanelCard';

import { useCache } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';
import { useRefresh } from '../../../contexts/RefreshContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

/**
 * @type {React.FC}
 */
const Organization = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const { refresh, setRefresh } = useRefresh();
	const Modal = App.useApp().modal;

	const isMobile = useMobile();
	const { cache } = useCache();

	const { id } = useParams();

	/** @type {[import('../../../classes/Organization').Organization, React.Dispatch<React.SetStateAction<import('../../../classes/Organization')>>]} */
	const [thisOrganization, setThisOrganization] = React.useState();
	React.useEffect(() => {
		const controller = new AbortController();

		const fetchOrganization = async () => {
			const response = await authFetch(`${API_Route}/organizations/${id}`, { signal: controller.signal });
			if (!response?.ok) {
				Modal.error({
					title: 'Error',
					content: `Failed to fetch organization: ${response?.statusText || 'Unknown error'}`,
					onOk: () => navigate(-1)
				});
				return;
			};

			const data = await response.json();
			setThisOrganization(data);
		};
	
		fetchOrganization();
		return () => controller.abort();
	}, [id, refresh]);

	React.useLayoutEffect(() => {
		setHeader({
			title: `Student Organization ${thisOrganization?.id || ''}`,
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
		setSelectedKeys(['organizations']);
	}, [setSelectedKeys]);

	const [repository, setRepository] = React.useState([]);
	React.useEffect(() => {
		if (thisOrganization?.placeholder) {
			setRepository([]);
			return;
		};
		setRepository([
			{
				name: 'Document 1',
				extension: 'pdf',
				id: 'doc-1',
				thumbnail: '/Placeholder Image.svg'
			},
			{
				name: 'Document 2',
				extension: 'pdf',
				id: 'doc-2',
				thumbnail: '/Placeholder Image.svg'
			},
			{
				name: 'Image 1',
				extension: 'jpg',
				id: 'img-1',
				thumbnail: '/Placeholder Image.svg'
			},
			{
				name: 'Image 2',
				extension: 'png',
				id: 'img-2',
				thumbnail: '/Placeholder Image.svg'
			}
		]);
	}, [thisOrganization]);

	const [EditOrganizationForm] = Form.useForm();
	const editOrganization = React.useCallback(() => {
		if (!thisOrganization.id) return;
		EditOrganizationForm.resetFields();
		Modal.confirm({
			title: 'Edit Organization',
			icon: null,
			width: 512,
			centered: true,
			content: (
				<Form
					form={EditOrganizationForm}
					layout='vertical'
					initialValues={{
						shortName: thisOrganization.shortName,
						fullName: thisOrganization.fullName,
						type: thisOrganization.type
					}}
				>
					<Form.Item
						label='Short Name'
						name='shortName'
						rules={[{ required: true, message: 'Please enter the short name of the organization.' }]}
					>
						<Input placeholder='e.g., CS Club' />
					</Form.Item>
					<Form.Item
						label='Full Name'
						name='fullName'
						rules={[{ required: true, message: 'Please enter the full name of the organization.' }]}
					>
						<Input placeholder='e.g., Computer Science Club' />
					</Form.Item>
					<Form.Item
						label='Type'
						name='type'
						rules={[{ required: true, message: 'Please select the type of the organization.' }]}
					>
						<Select
							placeholder='Select organization type'
							options={[
								{ label: 'College-wide', value: 'college-wide' },
								{ label: 'Institute-wide', value: 'institute-wide' },
							]}
						/>
					</Form.Item>
				</Form>
			),
			onOk: () => new Promise((resolve, reject) => {
				EditOrganizationForm.validateFields()
					.then(async (values) => {
						const formData = new FormData();
						formData.append('shortName', values.shortName);
						formData.append('fullName', values.fullName);
						formData.append('type', values.type);
						if (values.logo && values.logo[0]?.originFileObj)
							formData.append('logo', values.logo[0].originFileObj);
						if (values.cover && values.cover[0]?.originFileObj)
							formData.append('cover', values.cover[0].originFileObj);

						const response = await authFetch(`${API_Route}/organizations/${thisOrganization.id}`, {
							method: 'PATCH',
							body: formData
						});

						if (!response?.ok) {
							const errorData = await response.json();
							Modal.error({
								title: 'Error',
								content: errorData.message || 'An error occurred while creating the organization.',
								centered: true
							});
							reject();
							return;
						};

						const data = await response.json();
						Modal.success({
							title: 'Success',
							content: 'Organization created successfully.',
							centered: true
						});

						setThisOrganization((prev) => ({
							...prev,
							logo: `${data.logo}?seed=${Math.random()}`,
							cover: `${data.cover}?seed=${Math.random()}`
						}));
						resolve();
					})
					.catch(info => {
						reject(info);
					});
			})
		});
	}, [thisOrganization]);

	const [EditMediaForm] = Form.useForm();
	const editMedia = React.useCallback((type) => {
		if (!thisOrganization?.id) return;
		EditMediaForm.resetFields();

		Modal.confirm({
			title: `Edit ${type === 'cover' ? 'Cover Photo' : 'Logo'}`,
			icon: null,
			closable: { 'aria-label': 'Close' },
			width: 512,
			centered: true,
			content: (
				<Form
					form={EditMediaForm}
					layout='vertical'
				>
					<Form.Item
						label={type === 'cover' ? 'Cover Photo' : 'Logo'}
						name={'file'}
						rules={[{ required: true, message: `Please upload the new ${type === 'cover' ? 'cover photo' : 'logo'}.` }]}
					>
						<Upload.Dragger
							listType='picture'
							accept='image/*'
							beforeUpload={() => false}
							maxCount={1}
						>
							<p className='ant-upload-drag-icon'>
								<InboxOutlined />
							</p>
							<p className='ant-upload-text'>Click or drag file to this area to upload</p>
							<p className='ant-upload-hint'>Support for a single upload. Strictly prohibit from uploading company data or other band files.</p>
						</Upload.Dragger>
					</Form.Item>
				</Form>
			),
			onOk: () => new Promise((resolve, reject) => {
				EditMediaForm.validateFields()
					.then(async (values) => {
						const formData = new FormData();
						console.log(values);
						if (values.file.fileList && values.file.fileList[0]?.originFileObj)
							formData.append('file', values.file.fileList[0].originFileObj);

						const response = await authFetch(`${API_Route}/organizations/${thisOrganization.id}/${type}`, {
							method: 'PATCH',
							body: formData
						});

						if (!response?.ok) {
							const errorData = await response.json();
							Modal.error({
								title: 'Error',
								content: errorData.message || `An error occurred while updating the ${type === 'cover' ? 'cover photo' : 'logo'}.`,
								centered: true
							});
							reject();
							return;
						};

						const data = await response.json();
						Modal.success({
							title: 'Success',
							content: `${type === 'cover' ? 'Cover photo' : 'Logo'} updated successfully.`,
							centered: true
						});


						setThisOrganization((prev) => ({
							...prev,
							logo: `${data.logo}?seed=${Math.random()}`,
							cover: `${data.cover}?seed=${Math.random()}`
						}));
						resolve();
					})
					.catch(info => {
						reject(info);
					});
			})
		});
	}, [thisOrganization]);

	return (
		<Flex
			vertical
			gap={16}
		>
			<Flex gap={16} align='stretch' style={{ width: '100%' }}>
				<Flex vertical gap={16} style={{ width: '100%' }}>
					<Card
						cover={
							(() => {
								const [hovered, setHovered] = React.useState(false);
								return (
									<span
										onMouseEnter={() => setHovered(true)}
										onMouseLeave={() => setHovered(false)}
									>
										<Image
											preview={false}
											src={thisOrganization?.cover || '/Placeholder Image.svg'}
											alt={`${thisOrganization?.shortName} Cover`}
											style={{ borderRadius: 'var(--ant-border-radius-outer)', aspectRatio: isMobile ? '2/1' : '6/1', objectFit: 'cover', overflow: 'hidden' }}
										/>
										{hovered && (
											<Button
												style={{
													position: 'absolute',
													top: isMobile ? '8px' : '16px',
													right: isMobile ? '8px' : '16px',
													opacity: 0.8
												}}
												icon={<EditOutlined />}
												onClick={() => editMedia('cover')}
											>
												Update Cover Photo
											</Button>
										)}
									</span>
								);
							})()
						}
					>
						{!isMobile ? (
							<Flex justify='flex-start' align='flex-end' gap={16} style={{ width: '100%' }}>
								<Flex
									style={{
										position: 'relative',
										width: 128, // 2^7
										height: '100%'
									}}
								>
									{(() => {
										const [hovered, setHovered] = React.useState(false);
										return (
											<span
												onMouseEnter={() => setHovered(true)}
												onMouseLeave={() => setHovered(false)}
												style={{
													position: 'absolute',
													width: 128, // 2^7
													height: 128, // 2^7
													bottom: 0
												}}
											>
												<Avatar
													src={thisOrganization?.logo}
													size='large'
													shape='square'
													style={{
														width: 128, // 2^7
														height: 128, // 2^7
														border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
													}}
												/>
												{hovered && (
													<Button
														style={{
															position: 'absolute',
															top: isMobile ? '8px' : '16px',
															right: isMobile ? '8px' : '16px',
															opacity: 0.8
														}}
														icon={<EditOutlined />}
														onClick={() => editMedia('logo')}
													/>
												)}
											</span>
										);
									})()}
								</Flex>
								<Flex vertical justify='center' align='flex-start' style={{ flex: 1, }}>
									<Title level={1}>{thisOrganization?.shortName}</Title>
									<Title level={5}>{thisOrganization?.fullName}</Title>
									<Text type='secondary'>{thisOrganization?.description}</Text>
								</Flex>
								<Flex justify='flex-end' align='center' gap={8} style={{ height: '100%' }}>
									<Button
										type='primary'
										icon={<EditOutlined />}
										onClick={editOrganization}
									>
										Edit
									</Button>
								</Flex>
							</Flex>
						) : (
							<Flex vertical justify='flex-start' align='center' gap={16}>
								<Flex
									justify='center'
									align='center'
									gap={16}
									style={{
										position: 'relative',
										width: '100%',
										height: '100%'
									}}
								>
										{(() => {
											const [hovered, setHovered] = React.useState(false);
											return (
												<span
													onMouseEnter={() => setHovered(true)}
													onMouseLeave={() => setHovered(false)}
													style={{
														position: 'absolute',
														width: 128, // 2^7
														height: 128, // 2^7
														bottom: 0
													}}
												>
													<Avatar
														src={thisOrganization?.logo}
														size='large'
														shape='square'
														style={{
													width: 128, // 2^7
													height: 128, // 2^7
															border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
														}}
													/>
													{hovered && (
														<Button
															style={{
																position: 'absolute',
																top: isMobile ? '8px' : '16px',
																right: isMobile ? '8px' : '16px',
																opacity: 0.8
															}}
															icon={<EditOutlined />}
															onClick={() => editMedia('logo')}
														/>
													)}
												</span>
											);
										})()}
								</Flex>
									<Flex vertical justify='flex-start' align='center' style={{ flex: 1, }}>
										<Title level={1}>{thisOrganization?.shortName}</Title>
										<Title level={5}>{thisOrganization?.fullName}</Title>
										<Text type='secondary'>{thisOrganization?.description}</Text>
								</Flex>
								<Flex justify='flex-end' align='center' gap={8} style={{ height: '100%' }}>
									<Button
										type='primary'
										icon={<EditOutlined />}
											onClick={editOrganization}
									>
										Edit
									</Button>
								</Flex>
							</Flex>
						)}
					</Card>
					<Flex vertical={isMobile} gap={16} style={{ width: '100%', height: '100%' }}>
						<div
							style={{ width: '100%', height: '100%', order: isMobile ? '2' : '' }}
						>
							<PanelCard
								title='Members'
								style={{ position: 'sticky', top: 0 }}
								footer={
									<Flex justify='flex-end' align='center' gap={8}>
										<Button
											type='primary'
											size='small'
											icon={<PlusOutlined />}
											onClick={() => { }}
										>
											Add
										</Button>
									</Flex>
								}
							>
								{thisOrganization?.members.length > 0 && thisOrganization?.members.map((member, index) => (
									<Card
										key={index}
										size='small'
										hoverable
										style={{ width: '100%' }}
										onClick={() => {
											navigate(`/dashboard/students/profile/${member.student.id}`, {
												state: { id: member.student.id }
											});
										}}
									>
										<Flex justify='flex-start' align='center' gap={16}>
											<Avatar
												src={member.student.profilePicture || '/Placeholder Image.svg'}
												size='large'
												style={{
													border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
												}}
											/>
											<Flex vertical justify='flex-start' align='flex-start'>
												<Title level={5}>{member.student.name.first} {member.student.name.middle} {member.student.name.last}</Title>
												<Text type='secondary'>{member.role}</Text>
											</Flex>
										</Flex>
									</Card>
								))}
							</PanelCard>
						</div>
						<div
							style={{ width: '100%', height: '100%', order: isMobile ? '1' : '' }}
						>
							<PanelCard title='Calendar' style={{ position: 'sticky', top: 0 }}>
								<Calendar
									style={{ width: '100%' }}
									fullscreen={false}
								/>
							</PanelCard>
						</div>
					</Flex>
				</Flex>
			</Flex>
			<PanelCard
				title='Repository'
				footer={
					<Flex justify='flex-end' align='center' gap={8}>
						<Button
							type='primary'
							size='small'
							icon={<PlusOutlined />}
							onClick={() => { }}
						>
							Add
						</Button>
					</Flex>
				}
			>
				{repository.length > 0 && repository.map((file, i) => (
					<Card
						key={file.id || i}
						size='small'
						hoverable
						style={{ width: '100%' }}
						onClick={() => { }}
					>
						<Flex align='center' gap={8}>
							<Avatar src={file.thumbnail} size='large' shape='square' />
							<Flex vertical>
								<Text>{file.name}</Text>
								<Text type='secondary'>{file.extension.toUpperCase()}</Text>
							</Flex>
						</Flex>
					</Card>
				))}
			</PanelCard>
		</Flex>
	);
};

export default Organization;


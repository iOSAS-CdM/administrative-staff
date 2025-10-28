import React from 'react';
import { useNavigate, useParams } from 'react-router';
import { download } from '@tauri-apps/plugin-upload';
import { join, downloadDir } from '@tauri-apps/api/path';

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
	Select,
	AutoComplete,
	Spin,
	Checkbox,
	message,
	Tag
} from 'antd';

import {
	EditOutlined,
	LeftOutlined,
	InboxOutlined,
	DeleteOutlined,
	MinusOutlined,
	UploadOutlined,
	DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import PanelCard from '../../../components/PanelCard';

import { useCache, CacheProvider } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';
import { useRefresh } from '../../../contexts/RefreshContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

import UploadOrganizationFiles from '../../../modals/UploadOrganizationFiles';

import authFetch from '../../../utils/authFetch';
import { API_Route } from '../../../main';

/**
 * @type {React.FC}
 */
const Organization = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
	const { refresh, setRefresh } = useRefresh();
	const app = App.useApp();
	const Modal = app.modal;
	const notification = app.notification;

	const isMobile = useMobile();
	const { cache, pushToCache, removeFromCache } = useCache();

	const { id } = useParams();

	/** @type {[import('../../../classes/Organization').Organization, React.Dispatch<React.SetStateAction<import('../../../classes/Organization')>>]} */
	const [thisOrganization, setThisOrganization] = React.useState();
	React.useEffect(() => {
		if (!id) return;
		const organization = (cache.organizations || []).find(r => r.id === id);
		if (organization)
			return setThisOrganization(organization);

		const controller = new AbortController();
		const loadOrganization = async () => {
			const response = await authFetch(`${API_Route}/organizations/${id}`, { signal: controller.signal });
			if (!response || !response.ok) {
				console.error('Failed to fetch organization:', response?.statusText || response);
				Modal.error({
					title: 'Error',
					content: 'Failed to fetch organization. Please try again later.',
					centered: true,
					onOk: () => navigate(-1)
				});
				return;
			};
			const data = await response.json();
			console.log('Fetched organization:', data);
			if (data) {
				setThisOrganization(data);
				pushToCache('organizations', data, true);
			};
		};
		loadOrganization();
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
				<CacheProvider>
					<EditOrganizationFormContent form={EditOrganizationForm} organization={thisOrganization} />
				</CacheProvider>
			),
			onOk: () => new Promise((resolve, reject) => {
				EditOrganizationForm.validateFields()
					.then(async (values) => {
						const response = await authFetch(`${API_Route}/organizations/${thisOrganization.id}`, {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(values)
						});

						if (!response?.ok) {
							const errorData = await response.json();
							Modal.error({
								title: 'Error',
								content: errorData.message || 'An error occurred while updating the organization.',
								centered: true
							});
							reject();
							return;
						};

						const data = await response.json();
						Modal.success({
							title: 'Success',
							content: 'Organization updated successfully.',
							centered: true
						});
						setRefresh({ timestamp: Date.now() });
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

	/** @type {[import('../../../classes/Repository').RepositoryProps, React.Dispatch<React.SetStateAction<import('../../../classes/Repository').RepositoryProps>>]} */
	const [repository, setRepository] = React.useState([]);
	React.useEffect(() => {
		if (!id) return setRepository([]);
		const controller = new AbortController();
		const loadRepository = async () => {
			const response = await authFetch(`${API_Route}/repositories/organization/${id}`, { signal: controller.signal });
			if (!response?.ok) {
				console.error('Failed to fetch repository:', response?.statusText || response);
				return;
			};
			/** @type {import('../../../classes/Repository').RepositoryProps} */
			const data = await response.json();
			if (!data || !Array.isArray(data)) {
				setRepository([]);
				return;
			};
			setRepository(data);
		};
		loadRepository();
		return () => controller.abort();
	}, [id, refresh]);

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
									<Button
										type='primary'
										danger
										icon={<DeleteOutlined />}
										onClick={() => {
											Modal.confirm({
												title: 'Delete Organization',
												content: 'Are you sure you want to delete this organization? This action cannot be undone.',
												centered: true,
												onOk: async () => {
													const response = await authFetch(`${API_Route}/organizations/${thisOrganization.id}`, {
														method: 'DELETE'
													});

													if (!response?.ok) {
														const errorData = await response.json();
														Modal.error({
															title: 'Error',
															content: errorData.message || 'An error occurred while deleting the organization.',
															centered: true
														});
														return;
													};

													Modal.success({
														title: 'Success',
														content: 'Organization deleted successfully.',
														centered: true
													});

													navigate(-1);
												}
											});
										}}
									>
										Delete
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
										<Button
											type='primary'
											danger
											icon={<DeleteOutlined />}
											onClick={() => {
												Modal.confirm({
													title: 'Delete Organization',
													content: 'Are you sure you want to delete this organization? This action cannot be undone.',
													centered: true,
													onOk: async () => {
														const response = await authFetch(`${API_Route}/organizations/${thisOrganization.id}`, {
															method: 'DELETE'
														});

														if (!response?.ok) {
															const errorData = await response.json();
															Modal.error({
																title: 'Error',
																content: errorData.message || 'An error occurred while deleting the organization.',
																centered: true
															});
															return;
														};

														Modal.success({
															title: 'Success',
															content: 'Organization deleted successfully.',
															centered: true
														});

														navigate(-1);
													}
												});
											}}
										>
											Delete
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
										{member.publisher && (
											<Tag color='blue' style={{ position: 'absolute', top: 8, right: 8 }}>Publisher</Tag>
										)}
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
							icon={<UploadOutlined />}
							onClick={async () => {
								if (thisOrganization?.placeholder) {
									Modal.error({
										title: 'Error',
										content: 'This is a placeholder organization. Please try again later.',
										centered: true
									});
									return;
								};

								await UploadOrganizationFiles(Modal, notification, thisOrganization.id);
								setRefresh({ timestamp: Date.now() });
							}}
						>
							Upload
						</Button>
					</Flex>
				}
			>
				{repository.length > 0 && repository.map((file, i) => (
					<Card
						key={file.id || i}
						size='small'
						style={{ width: '100%' }}
					>
						<Flex align='center' gap={16}>
							<Avatar src={file.metadata.mimetype.includes('image/') && file.publicUrl} icon={!file.metadata.mimetype.includes('image/') && <FileOutlined />} size='large' shape='square' style={{ width: 64, height: 64 }} />
							<Flex vertical style={{ flex: 1 }}>
								<Text>{file.name}</Text>
								<Text type='secondary'>{(file.metadata.size / 1024).toFixed(2)} KB • {file.metadata.mimetype}</Text>
							</Flex>
							<Flex gap={8}>
								<Button
									type='default'
									size='small'
									danger
									icon={<DeleteOutlined />}
									onClick={async () => {
										if (thisOrganization?.placeholder) {
											Modal.error({
												title: 'Error',
												content: 'This is a placeholder organization. Please try again later.',
												centered: true
											});
											return;
										};
										Modal.confirm({
											title: 'Confirm Deletion',
											content: <Text>Are you sure you want to delete <Tag>{file.name}</Tag>? This action cannot be undone.</Text>,
											centered: true,
											okButtonProps: { danger: true },
											okText: 'Delete',
											onOk: async () => {
												const response = await authFetch(`${API_Route}/repositories/organization/${id}/files/${file.name}`, { method: 'DELETE' }).catch(() => null);
												if (!response?.ok) {
													notification.error({
														message: 'Error deleting file.'
													});
													return;
												};
												removeFromCache('organizations', 'id', id);
												setRefresh({ timestamp: Date.now() });
												notification.success({
													message: 'File deleted successfully.'
												});
											}
										});
									}}
								/>
								<Button
									type='default'
									size='small'
									icon={<DownloadOutlined />}
									onClick={async () => {
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
									}}
								/>
							</Flex>
						</Flex>
					</Card>
				))}
			</PanelCard>
		</Flex>
	);
};

const EditOrganizationFormContent = ({ form, organization }) => {
	/**
	 * Cache context hook for managing student data
	 */
	const { pushToCache, getFromCache, cache } = useCache();

	/**
	 * Search query string for members
	 * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
	 */
	const [memberSearch, setMemberSearch] = React.useState('');

	/**
	 * Array of member search results
	 * @type {[import('../classes/Student').StudentProps[], React.Dispatch<React.SetStateAction<import('../classes/Student').StudentProps[]>>]}
	 */
	const [memberSearchResults, setMemberSearchResults] = React.useState([]);

	/**
	 * Loading state for member search operations
	 * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
	 */
	const [memberSearching, setMemberSearching] = React.useState(false);

	/**
	 * Helper function to fetch student search results
	 * @param {string} query - The search query
	 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLoading - Loading state setter
	 * @param {React.Dispatch<React.SetStateAction<import('../classes/Student').StudentProps[]>>} setResults - Results setter
	 * @param {AbortController} controller - Abort controller for cancelling request
	 */
	const fetchStudentResults = async (query, setLoading, setResults, controller) => {
		if (query.length === 0) {
			setResults([]);
			return;
		};

		setLoading(true);
		const request = await authFetch(`${API_Route}/users/search/students?q=${encodeURIComponent(query)}`, { signal: controller.signal });
		if (!request?.ok) return;

		const data = await request.json();
		if (!data || !Array.isArray(data.students)) return;
		setResults(data.students);
		setLoading(false);
		pushToCache('students', data.students, false);
	};

	/**
	 * Effect hook to handle member search functionality
	 */
	React.useEffect(() => {
		const controller = new AbortController();
		fetchStudentResults(memberSearch, setMemberSearching, setMemberSearchResults, controller);
		return () => controller.abort();
	}, [memberSearch]);

	/**
	 * Array of member student IDs
	 * @type {string[]}
	 */
	const members = Form.useWatch('members', form);

	return (
		<Form
			form={form}
			layout='vertical'
			initialValues={{
				shortName: organization.shortName,
				fullName: organization.fullName,
				type: organization.type,
				members: organization.members.map(member => ({
					id: member.id,
					role: member.role,
					publisher: member.publisher
				}))
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

			<Form.List name='members'>
				{(fields, { add, remove, move }) => (
					<Flex vertical gap={8} style={{ flex: 1 }}>
						<Form.Item label='Members'>
							<AutoComplete
								placeholder='Search or enter member ID'
								options={memberSearchResults
									.filter(student =>
										!members?.includes(student.id)
									)
									.map(student => ({
										label: `${student.name.first} ${student.name.last} (${student.id})`,
										value: student.id
									}))
								}
								suffixIcon={memberSearching ? <Spin size='small' /> : null}
								value={memberSearch}
								onChange={(value) => setMemberSearch(value)}
								onSelect={(value) => {
									if (members?.includes(value)) return;
									add({ id: value, role: '', publisher: false });
									setMemberSearch('');
									setMemberSearchResults([]);
								}}
								onBlur={() => {
									if (!memberSearch) return;
									const exists = (memberSearchResults || []).some(s => s.id === memberSearch) || (cache.students || []).some(s => s.id === memberSearch);
									if (!exists) {
										message.error('Please select a valid member from the search results');
										return;
									};
									if (!members?.includes(memberSearch)) {
										add({ id: memberSearch, role: 'Member', publisher: false });
										setMemberSearch('');
									};
								}}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										if (!memberSearch) return;
										const exists = (memberSearchResults || []).some(s => s.id === memberSearch) || (cache.students || []).some(s => s.id === memberSearch);
										if (!exists) {
											message.error('Please select a valid member from the search results');
											return;
										}
										if (!members?.includes(memberSearch)) {
											add({ id: memberSearch, role: '', publisher: false });
											setMemberSearch('');
										};
									};
								}}
								style={{ width: '100%' }}
								filterOption={(input, option) =>
									option.label.toLowerCase().includes(input.toLowerCase())
								}
							/>
						</Form.Item>

						{fields.map(({ key, name, ...restField }) => (
							<Flex key={key} align='start' gap={8}>
								<Form.Item
									{...restField}
									name={[name, 'id']}
									label='Student'
									rules={[{ required: true, message: 'Please select a member!' }]}
									style={{ flex: 1 }}
								>
									<Select
										placeholder='Select a member'
										showSearch
										optionFilterProp='label'
										filterOption={(input, option) =>
											option.label.toLowerCase().includes(input.toLowerCase())
										}
										options={cache.students
											.filter(student =>
												!members?.includes(student.id) || student.id === form.getFieldValue(['members', name, 'id'])
											)
											.map(student => ({
												label: `${student.name.first} ${student.name.last} (${student.id})`,
												value: student.id
											}))}
									/>
								</Form.Item>
								<Form.Item
									{...restField}
									name={[name, 'role']}
									label='Role'
									rules={[{ required: true, message: 'Please enter the role!' }]}
									style={{ flex: 1 }}
								>
									<Input placeholder='Role (e.g., President)' />
								</Form.Item>
								<Form.Item
									{...restField}
									name={[name, 'publisher']}
									label='Publisher'
									valuePropName='checked'
									tooltip='If checked, this member can publish announcements on behalf of the organization.'
									style={{ textAlign: 'center' }}
								>
									<Checkbox />
								</Form.Item>
								<Form.Item label=' '>
									<Button
										icon={<MinusOutlined />}
										onClick={() => remove(name)}
									/>
								</Form.Item>
							</Flex>
						))}
					</Flex>
				)}
			</Form.List>
		</Form>
	);
};

export default Organization;


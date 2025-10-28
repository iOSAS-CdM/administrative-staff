import React from 'react';
import { useNavigate, useRoutes } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

import {
	App,
	Form,
	Input,
	Segmented,
	Flex,
	Avatar,
	Select,
	Typography,
	Button,
	Upload,
	Image
} from 'antd';

import {
	TeamOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import ItemCard from '../../../components/ItemCard';

import { useCache } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';
import { usePageProps } from '../../../contexts/PagePropsContext';

import Organization from '../../../classes/Organization';

import { API_Route } from '../../../main';
import authFetch from '../../../utils/authFetch';
import ContentPage from '../../../components/ContentPage';

/** @typedef {[Organization[], React.Dispatch<React.SetStateAction<Organization[]>>]} OrganizationsState */

/**
 * @type {React.FC}
 */
const Organizations = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	React.useEffect(() => {
		setSelectedKeys(['organizations']);
	}, [setSelectedKeys]);

	const isMobile = useMobile();
	const { cache } = useCache();

	/** @typedef {'all' | 'college-wide' | 'institute-wide'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState('all');

	const [search, setSearch] = React.useState('');
	/** @type {[import('../../../classes/Record').RecordProps[], React.Dispatch<React.SetStateAction<import('../../../classes/Record').RecordProps[]>>]} */
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearching] = React.useState(false);

	const navigate = useNavigate();

	const [NewOrganizationForm] = Form.useForm();
	const logo = Form.useWatch('logo', NewOrganizationForm);
	const cover = Form.useWatch('cover', NewOrganizationForm);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Student Organizations',
			actions: [
				<Segmented
					vertical={isMobile}
					options={[
						{ label: 'All', value: 'all' },
						{ label: 'College-wide', value: 'college-wide' },
						{ label: 'Institute-wide', value: 'institute-wide' },
					]}
					value={category}
					onChange={(value) => setCategory(value)}
				/>,
				<Button
					type='primary'
					icon={<TeamOutlined />}
					onClick={() => {
						Modal.confirm({
							title: 'Create New Organization',
							icon: null,
							closable: { 'aria-label': 'Close' },
							width: 512,
							centered: true,
							content: (
								<Form
									form={NewOrganizationForm}
									layout='vertical'
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
									<Form.Item
										label='Logo'
										name='logo'
										valuePropName='fileList.fileList'
										getValueFromEvent={e => {
											if (Array.isArray(e))
												return e;
											return e && e.fileList;
										}}
										style={{ textAlign: 'center', justifyContent: 'center' }}
									>
										<Upload.Dragger
											listType='picture'
											action={'/upload.do'}
											beforeUpload={() => false}
											accept='image/*'
										>
											Upload Logo
										</Upload.Dragger>
									</Form.Item>
									<Form.Item
										label='Cover Image'
										name='cover'
										valuePropName='fileList.fileList'
										getValueFromEvent={e => {
											if (Array.isArray(e))
												return e;
											return e && e.fileList;
										}}
									>
										<Upload.Dragger
											listType='picture'
											action={'/upload.do'}
											beforeUpload={() => false}
											accept='image/*'
										>
											Upload Cover Image
										</Upload.Dragger>
									</Form.Item>
								</Form>
							),
							onOk: () => new Promise((resolve, reject) => {
								NewOrganizationForm.validateFields()
									.then(async (values) => {
										const formData = new FormData();
										formData.append('shortName', values.shortName);
										formData.append('fullName', values.fullName);
										formData.append('type', values.type);
										if (values.logo && values.logo[0]?.originFileObj)
											formData.append('logo', values.logo[0].originFileObj);
										if (values.cover && values.cover[0]?.originFileObj)
											formData.append('cover', values.cover[0].originFileObj);

										const response = await authFetch(`${API_Route}/organizations`, {
											method: 'POST',
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

										navigate(`/dashboard/students/organization/${data.id}`, { replace: true });
										resolve();
									})
									.catch(info => {
										reject(info);
									});
							})
						});
					}}
				>
					Create Organization
				</Button>
			]
		});
	}, [setHeader, setSelectedKeys, category, isMobile]);
	const app = App.useApp();
	const Modal = app.modal;

	return (
		<ContentPage
			fetchUrl={`${API_Route}/organizations?category=${category}`}
			emptyText='No organizations found'
			cacheKey='organizations'
			transformData={(data) => data.organizations || []}
			renderItem={(organization) => (
				<OrganizationCard
					organization={organization}
					loading={organization.placeholder}
				/>
			)}
		/>
	);
};

export default Organizations;

/**
 * @type {React.FC<{
 * 	organization: import('../../../classes/Organization').Organization,
 * 	loading: Boolean
 * }>}
 */
const OrganizationCard = ({ organization, loading }) => {
	/** @type {[import('../../../classes/Organization').Organization, React.Dispatch<React.SetStateAction<import('../../../classes/Organization').Organization>>]} */
	const [thisOrganization, setThisOrganization] = React.useState(organization);
	const navigate = useNavigate();

	React.useEffect(() => {
		if (organization)
			setThisOrganization(organization);
	}, [organization]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<ItemCard
			loading={loading}

			status={
				organization.status === 'dismissed' ? 'dismissed' :
					organization.status === 'restricted' && 'restricted'
			}

			cover={!thisOrganization.placeholder && (
				<Image
					src={thisOrganization.cover || '/Placeholder Image.svg'}
					alt={`${thisOrganization.shortName} Cover`}
					style={{ aspectRatio: '2/1', objectFit: 'cover' }}
					onClick={(e) => { e.stopPropagation(); }}
				/>
			)}

			onClick={() => {
				if (loading) {
					Modal.error({
						title: 'Error',
						content: 'This is a placeholder organization. Please try again later.',
						centered: true
					});
					return;
				};
				navigate(`/dashboard/students/organization/${thisOrganization.id}`, {
					state: { id: thisOrganization.id }
				});
			}}
		>
			<Flex vertical justify='flex-start' align='center' gap={16} style={{ width: '100%' }}>
				<div
					style={{
						position: 'relative',
						height: 16,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Avatar
						src={thisOrganization.logo}
						size='large'
						style={{
							position: 'absolute',
							width: 64,
							height: 64,
							bottom: 0
						}}
					/>
				</div>
				<Flex vertical justify='flex-start' align='center'>
					<Title level={3} style={{ textAlign: 'center' }}>{thisOrganization.shortName}</Title>
					<Text style={{ textAlign: 'center' }}>{thisOrganization.fullName}</Text>
				</Flex>
				<Avatar.Group
					max={{
						count: 4
					}}
				>
					{thisOrganization.members.map((member, index) => (
						<Avatar
							key={index}
							src={member.student.profilePicture}
							style={{ cursor: 'pointer' }}
							onClick={(e) => {
								e.stopPropagation();
								navigate(`/dashboard/students/profile/${member.student.id}`, {
									state: { id: member.student.id }
								});
							}}
						/>
					))}
				</Avatar.Group>
			</Flex>
		</ItemCard>
	);
};
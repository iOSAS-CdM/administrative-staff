import React from 'react';
import { useNavigate, useRoutes } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

import {
	App,
	Input,
	Segmented,
	Flex,
	Empty,
	Row,
	Col,
	Avatar,
	Typography,
	Spin,
	Image
} from 'antd';

import {
	SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import ItemCard from '../../../components/ItemCard';

import { useCache } from '../../../contexts/CacheContext';
import { useMobile } from '../../../contexts/MobileContext';

import Organization from '../../../classes/Organization';

/** @typedef {[Organization[], React.Dispatch<React.SetStateAction<Organization[]>>]} OrganizationsState */

/**
 * @type {React.FC<{
 * 	setHeader: (header: any) => void,
 * 	setSelectedKeys: (keys: string[]) => void
 * }>}
 */
const Organizations = ({ setHeader, setSelectedKeys }) => {
	React.useEffect(() => {
		setSelectedKeys(['organizations']);
	}, [setSelectedKeys]);

	const isMobile = useMobile();
	const { cache } = useCache();

	const navigate = useNavigate();

	/** @typedef {'active' | 'college-wide' | 'institute-wide' | 'restricted' | 'archived'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState();
	/** @type {[String, React.Dispatch<React.SetStateAction<String>>]} */
	const [search, setSearch] = React.useState('');

	/**
	 * @type {{
	 * 	active: Organization[],
	 * 	'college-wide': Organization[],
	 * 	'institute-wide': Organization[],
	 * 	restricted: Organization[],
	 * 	archived: Organization[]
	 * }}
	 */
	const categorizedOrganizations = React.useMemo(() => {
		const categorized = {
			active: [],
			'college-wide': [],
			'institute-wide': [],
			restricted: [],
			archived: []
		};

		for (const organization of (cache.organizations || [])) {
			categorized[organization.status].push(organization);

			if (organization.status === 'active')
				categorized[organization.type].push(organization);
		};

		return categorized;
	}, [cache.organizations, category]);

	const routes = useRoutes([
		{ path: '/active', element: <CategoryPage categorizedOrganizations={categorizedOrganizations['active']} /> },
		{ path: '/college-wide', element: <CategoryPage categorizedOrganizations={categorizedOrganizations['college-wide']} /> },
		{ path: '/institute-wide', element: <CategoryPage categorizedOrganizations={categorizedOrganizations['institute-wide']} /> },
		{ path: '/restricted', element: <CategoryPage categorizedOrganizations={categorizedOrganizations['restricted']} /> },
		{ path: '/archived', element: <CategoryPage categorizedOrganizations={categorizedOrganizations['archived']} /> }
	]);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Student Organizations',
			actions: [
				<Flex style={{ flexGrow: isMobile ? 1 : '' }} key='search'>
					<Input
						placeholder='Search'
						allowClear
						prefix={<SearchOutlined />}
						onChange={(e) => {
							const value = e.target.value;
							clearTimeout(window.profileDebounceTimer);
							const debounceTimer = setTimeout(() => {
								setSearch(value);
							}, 8); // 2^3
							window.profileDebounceTimer = debounceTimer;
						}}
						style={{ width: '100%', minWidth: isMobile ? '100%' : 256 }} // 2^8
					/>
				</Flex>,
				<Segmented
					vertical={isMobile}
					options={[
						{ label: 'Active', value: 'active' },
						{ label: 'College-wide', value: 'college-wide' },
						{ label: 'Institute-wide', value: 'institute-wide' },
						{ label: 'Restricted', value: 'restricted' },
						{ label: 'Archived', value: 'archived' }
					]}
					value={category}
					onChange={(value) => {
						navigate(`/dashboard/students/organizations/${value}`);
					}}
				/>
			]
		});
	}, [setHeader, setSelectedKeys, category, isMobile]);
	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex vertical gap={16} style={{ width: '100%' }}>
			{routes}
		</Flex>
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
				organization.status === 'archived' ? 'archived' :
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

/**
 * @param {{
 * 	categorizedOrganizations: Organization[];
 * }} props
 * @returns {JSX.Element}
 */
const CategoryPage = ({ categorizedOrganizations }) => {
	const navigate = useNavigate();
	const isMobile = useMobile();
	const { cache } = useCache();
	return (
		<>
			{categorizedOrganizations.length > 0 ? (
				<Row gutter={[16, 16]}>
					<AnimatePresence mode='popLayout'>
						{categorizedOrganizations.map((organization, index) => (
							<Col key={organization.id} span={!isMobile ? 12 : 24}>
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<OrganizationCard
										organization={organization}
										loading={organization.placeholder}
									/>
								</motion.div>
							</Col>
						))}
					</AnimatePresence>
				</Row>
			) : (
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
						{(cache.organizations || []).length !== 0 ? (
						<Spin />
					) : (
						<Empty description='No organizations found' />
					)}
				</div>
			)}
		</>
	);
};
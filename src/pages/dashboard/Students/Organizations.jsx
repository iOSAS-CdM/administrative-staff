import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Input,
	Button,
	Segmented,
	Flex,
	Empty,
	Row,
	Col,
	Avatar,
	Typography,
	Spin
} from 'antd';

import {
	SearchOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import ItemCard from '../../../components/ItemCard';

import { MobileContext, OSASContext } from '../../../main';

import Organization from '../../../classes/Organization';
import Student from '../../../classes/Student';

/** @typedef {[Organization[], React.Dispatch<React.SetStateAction<Organization[]>>]} OrganizationsState */

const Organizations = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['organizations']);
	}, [setSelectedKeys]);

	const { mobile } = React.useContext(MobileContext);
	const { osas } = React.useContext(OSASContext);

	/** @typedef {'active' | 'college-wide' | 'institute-wide' | 'restricted' | 'archived'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState('active');
	/** @type {[String, React.Dispatch<React.SetStateAction<String>>]} */
	const [search, setSearch] = React.useState('');

	/** @type {OrganizationsState} */
	const [organizations, setOrganizations] = React.useState([]);
	/** @type {OrganizationsState} */
	const [categorizedOrganizations, setCategorizedOrganizations] = React.useState([]);
	/** @type {OrganizationsState} */
	const [displayedOrganizations, setDisplayedOrganizations] = React.useState([]);

	React.useEffect(() => {
		if (osas.organizations.length > 0)
			setOrganizations(osas.organizations);
	}, [osas.organizations]);

	React.useEffect(() => {
		if (organizations.length > 0)
			setCategorizedOrganizations(organizations.filter(organization => (
				organization.status === category ||
				(organization.type === category && (category === 'college-wide' || category === 'institute-wide')) && organization.status === 'active' ||
				(organization.status === 'active' && category === 'active') ||
				(organization.status === 'restricted' && category === 'restricted') ||
				(organization.status === 'archived' && category === 'archived')
			)));
	}, [organizations, category]);

	React.useEffect(() => {
		if (search.trim() === '') {
			setDisplayedOrganizations(categorizedOrganizations);
			return;
		};

		const searchTerm = search.toLowerCase();
		const searchedOrganizations = categorizedOrganizations.filter(organization => {
			const fullName = organization.fullName.toLowerCase();
			const shortName = organization.shortName.toLowerCase();
			return fullName.includes(searchTerm) || shortName.includes(searchTerm);
		});

		setDisplayedOrganizations([]);
		setTimeout(() => {
			setDisplayedOrganizations(searchedOrganizations);
		}, 8); // 2^3
	}, [search, categorizedOrganizations]);

	React.useEffect(() => {
		setHeader({
			title: 'Student Organizations',
			actions: [
				<Flex style={{ flexGrow: mobile ? 1 : '' }} key='search'>
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
						style={{ width: '100%', minWidth: mobile ? '100%' : 256 }} // 2^8
					/>
				</Flex>,
				<Segmented
					vertical={mobile}
					options={[
						{ label: 'Active', value: 'active' },
						{ label: 'College-wide', value: 'college-wide' },
						{ label: 'Institute-wide', value: 'institute-wide' },
						{ label: 'Restricted', value: 'restricted' },
						{ label: 'Archived', value: 'archived' }
					]}
					value={category}
					onChange={(value) => {
						setCategory(value);
					}}
				/>
			]
		});
	}, [setHeader, setSelectedKeys, category, mobile]);
	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex vertical gap={16} style={{ width: '100%' }}>
			{/************************** Student Organizations **************************/}
			{displayedOrganizations.length > 0 ? (
				<Row gutter={[16, 16]}>
					{displayedOrganizations.map((organization, index) => (
						<Col key={organization.id} span={!mobile ? 8 : 24}>
							<OrganizationCard
								organization={organization}
								loading={organization.placeholder}
								navigate={navigate}
							/>
						</Col>
					))}
				</Row>
			) : (
				
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
					{organizations.length !== 0 ? (
						<Spin />
					) : (
						<Empty description='No profiles found' />
					)}
				</div>
			)}
		</Flex>
	);
};

export default Organizations;

/**
 * @param {{
 * 	organization: import('../../../classes/Organization').Organization,
 * 	loading: Boolean,
 * 	navigate: ReturnType<typeof useNavigate>
 * }} param0
 * @returns {JSX.Element}
 */
const OrganizationCard = ({ organization, loading, navigate }) => {
	/** @type {[import('../../../classes/Organization').Organization, React.Dispatch<React.SetStateAction<import('../../../classes/Organization').Organization>>]} */
	const [thisOrganization, setThisOrganization] = React.useState(organization);

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
				navigate(`/dashboard/students/organizations/${thisOrganization.id}`, {
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
							onClick={() => {
								navigate(`/dashboard/students/profiles/${member.student.studentId}`, {
									state: { studentId: member.student.studentId }
								});
							}}
						/>
					))}
				</Avatar.Group>
			</Flex>
		</ItemCard>
	);
};
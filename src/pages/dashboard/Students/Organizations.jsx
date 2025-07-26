import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Table,
	Input,
	Button,
	Segmented,
	Flex,
	Empty,
	Image,
	Row,
	Col,
	Avatar,
	Typography
} from 'antd';

import {
	SearchOutlined,
	FilterOutlined,
	EditOutlined,
	LockOutlined,
	RightOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

import EditStudent from '../../../modals/EditStudent';
import RestrictStudent from '../../../modals/RestrictStudent';

import ItemCard from '../../../components/ItemCard';

import { MobileContext } from '../../../main';

import Organization from '../../../classes/Organization';
import Student from '../../../classes/Student';

/** @typedef {[Organization[], React.Dispatch<React.SetStateAction<Organization[]>>]} OrganizationsState */

const Organizations = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['organizations']);
	}, [setSelectedKeys]);

	const { mobile, setMobile } = React.useContext(MobileContext);

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
		/** @type {Organization[]} */
		const placeholderOrganizations = [];
		for (let i = 0; i < 10; i++) {
			const placeholderOrganization = new Organization({
				shortName: `Organization ${i + 1}`,
				fullName: `Placeholder Organization ${i + 1}`,
				description: 'This is a placeholder organization for testing purposes.',
				email: `placeholder${i + 1}@example.com`,
				phone: `+63 912 345 ${Math.floor(Math.random() * 1000)}`,
				logo: '/Placeholder Image.svg',
				cover: '/Placeholder Image.svg',
				status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'restricted' : 'archived',
				type: i % 2 === 0 ? 'college-wide' : 'institute-wide',
				members: [],
				placeholder: true
			});
			placeholderOrganizations.push(placeholderOrganization);
		};
		setOrganizations(placeholderOrganizations);

		setTimeout(() => {
			/** @type {Organization[]} */
			const organizationsData = [];

			for (let i = 0; i < 10; i++) {
				const id = `organization-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;
				if (organizations.some(organization => organization.id === id))
					continue;

				/** @type {import('../../../classes/Organization').OrganizationMember[]} */
				const members = [];
				for (let j = 0; j < 10; j++) {
					const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];
					const programs = {
						'ics': ['BSCpE', 'BSIT'],
						'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
						'ibe': ['BSBA-HRM', 'BSE']
					};
					const student = new Student({
						id: Math.floor(Math.random() * 1000) + 1,
						name: {
							first: 'user.name.first',
							middle: 'user.name.middle',
							last: 'user.name.last'
						},
						email: 'user.email',
						phone: 'user.phone',
						studentId: id + `-${i + 1}`,
						institute: institute,
						program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
						year: Math.floor(Math.random() * 4) + 1,
						profilePicture: `https://randomuser.me/api/portraits/${['men', 'women'][j % 2]}/${Math.floor(Math.random() * 100)}.jpg`,
						placeholder: false,
						status: ['active', 'restricted'][Math.floor(Math.random() * 2)]
					});
					members.push({
						student: student,
						role: ['Member', 'President', 'Vice President', 'Secretary', 'Treasurer'][Math.floor(Math.random() * 5)]
					});
				};

				const organization = new Organization({
					id: id,
					shortName: `Organization ${i + 1}`,
					fullName: `Organization Full Name ${i + 1}`,
					description: `This is the description for organization ${i + 1}.`,
					email: `org${i + 1}@example.com`,
					phone: `+63 912 345 ${Math.floor(Math.random() * 1000)}`,
					logo: '/Placeholder Image.svg',
					cover: '/Placeholder Image.svg',
					status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'restricted' : 'archived',
					type: i % 2 === 0 ? 'college-wide' : 'institute-wide',
					members: members
				});
				organizationsData.push(organization);
			};
			setOrganizations(organizationsData);
		}, remToPx(200));
	}, []);

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
		}, remToPx(0.5));
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
							}, remToPx(0.5));
							window.profileDebounceTimer = debounceTimer;
						}}
						style={{ width: '100%', minWidth: mobile ? '100%' : remToPx(20) }}
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
		<Flex vertical gap={16} style={{ width: '100%', height: '100%' }}>
			{/************************** Student Organizations **************************/}
			{displayedOrganizations.length > 0 ? (
				<Row gutter={[16, 16]}>
					{displayedOrganizations.map((organization, index) => (
						<Col key={organization.id} span={!mobile ? 8 : 24} style={{ height: '100%' }}>
							<OrganizationCard
								organization={organization}
								animationDelay={index * 0.1}
								loading={organization.placeholder}
								navigate={navigate}
							/>
						</Col>
					))}
				</Row>
			) : (
				<Empty description='No organizations found' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
			)}
		</Flex>
	);
};

export default Organizations;

/**
 * @param {{
 * 	organization: import('../../../classes/Organization').Organization,
 * 	animationDelay: Number,
 * 	loading: Boolean,
 * 	navigate: ReturnType<typeof useNavigate>
 * }} param0
 * @returns {JSX.Element}
 */
const OrganizationCard = ({ organization, animationDelay, loading, navigate }) => {
	const [mounted, setMounted] = React.useState(false);

	/** @type {[import('../../../classes/Organization').Organization, React.Dispatch<React.SetStateAction<import('../../../classes/Organization').Organization>>]} */
	const [thisOrganization, setThisOrganization] = React.useState(organization);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setMounted(true);
		}, animationDelay * 1000 || 0);

		return () => clearTimeout(timer);
	}, [animationDelay]);

	React.useEffect(() => {
		if (organization)
			setThisOrganization(organization);
	}, [organization]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<ItemCard
			loading={loading}
			mounted={mounted}

			status={
				organization.status === 'archived' ? 'archived' :
					organization.status === 'restricted' && 'restricted'
			}

			actions={[
				{
					content: (
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
											state: { student: member }
										});
									}}
								/>
							))}
						</Avatar.Group>
					),
					align: 'left'
				},
				{
					content: (
						<RightOutlined key='view' />
					),
					onClick: () => {
						if (thisOrganization.placeholder)
							Modal.error({
								title: 'Error',
								content: 'This is a placeholder organization. Please try again later.',
								centered: true
							});
						else
							navigate(`/dashboard/students/organizations/${thisOrganization.id}`, {
								state: { organization: thisOrganization }
							});
					},
					align: 'right'
				}
			]}

			cover={!thisOrganization.placeholder && (
				<Image
					src={thisOrganization.cover || '/Placeholder Image.svg'}
					alt={`${thisOrganization.shortName} Cover`}
					style={{ aspectRatio: '3/1', objectFit: 'cover' }}
				/>
			)}
		>
			<Flex justify='flex-start' align='flex-start' gap={16} style={{ width: '100%' }}>
				<Avatar
					src={thisOrganization.logo}
					size='large'
					style={{ width: remToPx(6), height: remToPx(6) }}
				/>
				<Flex vertical justify='flex-start' align='flex-start'>
					<Title level={3}>{thisOrganization.shortName}<Text type='secondary' style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{thisOrganization.studentId}</Text></Title>
					<Text>{thisOrganization.fullName}</Text>
				</Flex>
			</Flex>
		</ItemCard>
	);
};
import React from 'react';
import { useLocation, useNavigate, useRoutes, Navigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import {
	App,
	Input,
	Tooltip,
	Button,
	Segmented,
	Popover,
	Flex,
	Spin,
	Empty,
	Checkbox,
	Divider,
	Row,
	Col,
	Dropdown,
	Avatar,
	Typography
} from 'antd';

import {
	FilterOutlined,
	EditOutlined,
	LockOutlined,
	EllipsisOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import EditStudent from '../../../modals/EditStudent';
import RestrictStudent from '../../../modals/RestrictStudent';

import ItemCard from '../../../components/ItemCard';

import { API_Route, MobileContext } from '../../../main';
import { useCache } from '../../../contexts/CacheContext';

import Student from '../../../classes/Student';
import authFetch from '../../../utils/authFetch';

const Filters = ({ setFilter, category, mobile }) => (
	<Flex vertical gap={8}>
		<Divider>
			<Text strong>Filters</Text>
		</Divider>
		<Flex vertical>
			<Text strong>Year</Text>
			<Checkbox.Group
				onChange={(value) => {
					setFilter((prev) => ({
						...prev,
						years: value
					}));
				}}
			>
				<Flex vertical>
					<Checkbox value={1}>1st Year</Checkbox>
					<Checkbox value={2}>2nd Year</Checkbox>
					<Checkbox value={3}>3rd Year</Checkbox>
					<Checkbox value={4}>4th Year</Checkbox>
				</Flex>
			</Checkbox.Group>
		</Flex>

		<Flex vertical>
			<Text strong>Program</Text>
			<Checkbox.Group
				onChange={(value) => {
					setFilter((prev) => ({
						...prev,
						programs: value
					}));
				}}
			>
				<Flex vertical>
					{(category === 'ics' || category === 'active' || category === 'restricted' || category === 'archived') && (
						<>
							<Text type='secondary'>Institute of Computing Studies</Text>
							<Checkbox value='BSCpE'>
								{mobile ?
									<Tooltip title='Bachelor of Science in Computer Engineering'>BSCpE</Tooltip>
									: 'Bachelor of Science in Computer Engineering (BSCpE)'
								}
							</Checkbox>
							<Checkbox value='BSIT'>
								{mobile ?
									<Tooltip title='Bachelor of Science in Information Technology'>BSIT</Tooltip>
									: 'Bachelor of Science in Information Technology (BSIT)'
								}
							</Checkbox>
						</>
					)}
					{(category === 'ite' || category === 'active' || category === 'restricted' || category === 'archived') && (
						<>
							<Text type='secondary'>Institute of Teacher Education</Text>
							<Checkbox value='BSEd-SCI'>
								{mobile ?
									<Tooltip title='Bachelor of Secondary Education major in Science'>BSEd-SCI</Tooltip>
									: 'Bachelor of Secondary Education major in Science (BSEd-SCI)'
								}
							</Checkbox>
							<Checkbox value='BEEd-GEN'>
								{mobile ?
									<Tooltip title='Bachelor of Elementary Education - Generalist'>BEEd-GEN</Tooltip>
									: 'Bachelor of Elementary Education - Generalist (BEEd-GEN)'
								}
							</Checkbox>
							<Checkbox value='BEEd-ECED'>
								{mobile ?
									<Tooltip title='Bachelor of Early Childhood Education'>BEEd-ECED</Tooltip>
									: 'Bachelor of Early Childhood Education (BEEd-ECED)'
								}
							</Checkbox>
							<Checkbox value='BTLEd-ICT'>
								{mobile ?
									<Tooltip title='Bachelor of Technology and Livelihood Education major in Information and Communication Technology'>BTLEd-ICT</Tooltip>
									: 'Bachelor of Technology and Livelihood Education major in Information and Communication Technology (BTLEd-ICT)'
								}
							</Checkbox>
							<Checkbox value='TCP'>
								{mobile ?
									<Tooltip title='Teacher Certificate Program'>18 Units-TCP</Tooltip>
									: 'Teacher Certificate Program (18 Units-TCP)'
								}
							</Checkbox>
						</>
					)}
					{(category === 'ibe' || category === 'active' || category === 'restricted' || category === 'archived') && (
						<>
							<Text type='secondary'>Institute of Business Entrepreneurship</Text>
							<Checkbox value='BSBA-HRM'>
								{mobile ?
									<Tooltip title='Bachelor of Science in Business Administration Major in Human Resource Management'>BSBA-HRM</Tooltip>
									: 'Bachelor of Science in Business Administration Major in Human Resource Management (BSBA-HRM)'
								}
							</Checkbox>
							<Checkbox value='BSE'>
								{mobile ?
									<Tooltip title='Bachelor of Science in Entrepreneurship'>BSE</Tooltip>
									: 'Bachelor of Science in Entrepreneurship (BSE)'
								}
							</Checkbox>
						</>
					)}
				</Flex>
			</Checkbox.Group>
		</Flex>

		<Button
			type='primary'
			size='small'
			onClick={() => {
				setFilter({
					years: [],
					programs: []
				});
			}}
		>
			Reset
		</Button>
	</Flex>
);

/**
 * @param {import('../../../components/Menubar').PageProps} props
 * @returns {JSX.Element}
 */
const Profiles = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['profiles']);
	}, [setSelectedKeys]);

	const location = useLocation();

	const { mobile } = React.useContext(MobileContext);
	const { cache, pushToCache } = useCache();

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchStudents = async () => {
			if (cache.peers?.length > 0) return; // Already fetched

			// Fetch students from the backend
			const request = await authFetch(`${API_Route}/users/students`, { signal: controller.signal });
			if (!request.ok) return;

			/** @type {import('../../../types').Student[]} */
			const data = await request.json();
			if (!data || !Array.isArray(data)) return;
			pushToCache('peers', data, false);
		};
		fetchStudents();

		return () => controller.abort();
	}, [cache.peers]);

	/** @typedef {'ics' | 'ite' | 'ibe' | 'active' | 'restricted'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const category = location.pathname.split('/').pop();
	/**
	 * @typedef {{
	 * 		years: Number[],
	 * 		programs: String[]
	 * 	}} Filter
	 */
	/** @type {[Filter, React.Dispatch<React.SetStateAction<Filter>>]} */
	const [filter, setFilter] = React.useState({
		years: [],
		programs: []
	});
	/** @type {[String, React.Dispatch<React.SetStateAction<String>>]} */
	const [search, setSearch] = React.useState('');

	/** @type {Student[]} */
	const filteredStudents = React.useMemo(() => {
		/** @type {Student[]} */
		const filtered = [];

		// Filter by year and program
		for (const student of cache.peers?.filter(peer => peer.role === 'student' || peer.role === 'unverified-student')) {
			if (filter.years.length > 0 && !filter.years.includes(student.year))
				continue;
			if (filter.programs.length > 0 && !filter.programs.includes(student.program))
				continue;
			filtered.push(student);
		};

		if (search.trim() !== '') {
			const searchTerm = search.toLowerCase().trim();
			return filtered.filter(student => {
				return (
					student.name.first.toLowerCase().includes(searchTerm) ||
					student.name.middle.toLowerCase().includes(searchTerm) ||
					student.name.last.toLowerCase().includes(searchTerm) ||
					`${student.name.first} ${student.name.middle} ${student.name.last}`.toLowerCase().includes(searchTerm) ||
					`${student.name.first} ${student.name.last}`.toLowerCase().includes(searchTerm) ||
					student.id.toLowerCase().includes(searchTerm) ||
					student.email.toLowerCase().includes(searchTerm)
				);
			});
		};

		return filtered;
	}, [cache.peers, filter, search]);
	/**
	 * @type {{
	 * 	ics: Student[];
	 * 	ite: Student[];
	 * 	ibe: Student[];
	 * 	active: Student[];
	 * 	restricted: Student[];
	 * 	archived: Student[];
	 * }}
	 */
	const categorizedStudents = React.useMemo(() => {
		const categorized = {
			ics: [],
			ite: [],
			ibe: [],
			active: [],
			restricted: [],
			archived: []
		};

		for (const student of filteredStudents) {
			if (student.institute === 'ics' && student.status === 'active')
				categorized.ics.push(student);
			if (student.institute === 'ite' && student.status === 'active')
				categorized.ite.push(student);
			if (student.institute === 'ibe' && student.status === 'active')
				categorized.ibe.push(student);
			if (student.status === 'active')
				categorized.active.push(student);
			if (student.status === 'restricted')
				categorized.restricted.push(student);
			if (student.status === 'archived')
				categorized.archived.push(student);
		};

		return categorized;
	}, [filteredStudents]);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Verified Profiles',
			actions: [
				<Flex style={{ flexGrow: mobile ? 1 : '' }} key='search'>
					<Input.Search
						placeholder='Search'
						allowClear
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
					options={[
						{ label: 'Active', value: 'active' },
						{ label: 'ICS', value: 'ics' },
						{ label: 'ITE', value: 'ite' },
						{ label: 'IBE', value: 'ibe' },
						{ label: 'Restricted', value: 'restricted' },
						{ label: 'Archived', value: 'archived' }
					]}
					value={category}
					onChange={(value) => {
						navigate(`/dashboard/students/profiles/${value}`);
					}}
				/>,
				<>
					{!mobile ? (
						<Popover
							trigger={['click']}
							placement='bottom'
							arrow
							content={(menu) => <Filters setFilter={setFilter} category={category} mobile={mobile} />}
						>
							<Button
								icon={<FilterOutlined />}
								onClick={(e) => e.stopPropagation()}
							/>
						</Popover>
					) : <Filters setFilter={setFilter} category={category} mobile={mobile} />}
				</>
			]
		});
	}, [setHeader, setSelectedKeys, category, filter, search, mobile]);

	const routes = useRoutes([
		{ path: '/active', element: <CategoryPage institutionalizedStudents={categorizedStudents.active} /> },
		{ path: '/ics', element: <CategoryPage institutionalizedStudents={categorizedStudents.ics} /> },
		{ path: '/ite', element: <CategoryPage institutionalizedStudents={categorizedStudents.ite} /> },
		{ path: '/ibe', element: <CategoryPage institutionalizedStudents={categorizedStudents.ibe} /> },
		{ path: '/restricted', element: <CategoryPage institutionalizedStudents={categorizedStudents.restricted} /> },
		{ path: '/archived', element: <CategoryPage institutionalizedStudents={categorizedStudents.archived} /> }
	]);

	return (
		<Flex vertical gap={16} style={{ width: '100%' }}>
			{routes}
		</Flex>
	);
};

export default Profiles;

/**
 * @param {{
 * 	student: Student,
 * 	loading: Boolean,
 * 	navigate: ReturnType<typeof useNavigate>
 * }} props 
 * @returns {JSX.Element}
 */
const StudentCard = ({ student, loading, navigate }) => {
	/** @type {[Student, React.Dispatch<React.SetStateAction<Student[]>>]} */
	const [thisStudent, setThisStudent] = React.useState(student);

	React.useEffect(() => {
		if (student)
			setThisStudent(student);
	}, [student]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<ItemCard
			loading={loading}

			status={
				student.status === 'archived' ? 'archived' :
				student.status === 'restricted' && 'restricted'
			}

			onClick={(e) => {
				if (thisStudent.placeholder)
					Modal.error({
						title: 'Error',
						content: 'This is a placeholder student profile. Please try again later.',
						centered: true
					});
				else
					navigate(`/dashboard/students/profile/${thisStudent.id}`);
			}}
		>
			<Flex justify='flex-start' align='center' gap={16} style={{ width: '100%' }}>
				<Avatar
					src={thisStudent.profilePicture}
					size='large'
					style={{ width: 64, height: 64 }}
				/>
				<Flex vertical justify='flex-start' align='flex-start' style={{ flex: 1 }}>
					<Title level={4}>{thisStudent.name.first} {thisStudent.name.middle} {thisStudent.name.last} <Text type='secondary' style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{thisStudent.id}</Text></Title>
					<Text>{
						thisStudent.institute === 'ics' ? 'Institute of Computing Studies' :
							thisStudent.institute === 'ite' ? 'Institute of Teacher Education' :
								thisStudent.institute === 'ibe' ? 'Institute of Business Entrepreneurship' : ''
					}</Text>
				</Flex>
				<Dropdown
					arrow
					placement='bottom'
					menu={{
						items: [
							{
								key: 'edit',
								icon: <EditOutlined />,
								label: <Text>Edit</Text>
							},
							{
								key: 'restrict',
								icon: <LockOutlined />,
								label: <Text>Restrict</Text>
							}
						],
						onClick: (e) => {
							e.stopPropagation?.();
							e.domEvent.stopPropagation();
							if (thisStudent.placeholder)
								Modal.error({
									title: 'Error',
									content: 'This is a placeholder student profile. Please try again later.',
									centered: true
								});
							else if (e.key === 'edit')
								EditStudent(Modal, thisStudent, setThisStudent);
							else if (e.key === 'restrict')
								RestrictStudent(Modal, thisStudent, setThisStudent);
						}
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<Button
						type='default'
						icon={<EllipsisOutlined />}
						onClick={(e) => e.stopPropagation()}
					/>
				</Dropdown>
			</Flex>
		</ItemCard>
	);
};

/**
 * @param {{
 * 	institutionalizedStudents: Student[];
 * }} props
 * @returns {JSX.Element}
 */
const CategoryPage = ({ institutionalizedStudents }) => {
	const navigate = useNavigate();
	const { mobile } = React.useContext(MobileContext);
	// const { osas } = React.useContext(OSASContext);
	const { cache } = useCache();
	return (
		<>
			{institutionalizedStudents.length > 0 ? (
				<Row gutter={[16, 16]}>
					<AnimatePresence mode='popLayout'>
						{institutionalizedStudents.map((student, index) => (
							<Col key={student.id} span={!mobile ? 12 : 24}>
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -20 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<StudentCard
										student={student}
										loading={student.placeholder}
										navigate={navigate}
									/>
								</motion.div>
							</Col>
						))}
					</AnimatePresence>
				</Row>
			) : (
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
						{cache.peers?.filter(peer => peer.role === 'student' || peer.role === 'unverified-student').length !== 0 ? (
						<Spin />
					) : (
						<Empty description='No profiles found' />
					)}
				</div>
			)}
		</>
	);
};
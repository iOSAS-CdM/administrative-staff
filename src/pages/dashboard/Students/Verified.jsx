import React from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import {
	App,
	Input,
	Tooltip,
	Button,
	Tag,
	Flex,
	Spin,
	Empty,
	Checkbox,
	Divider,
	Row,
	Col,
	Dropdown,
	Avatar,
	Typography,
	Pagination
} from 'antd';

import {
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
const Verified = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['verified']);
	}, [setSelectedKeys]);

	const { mobile } = React.useContext(MobileContext);
	const { cache, pushToCache } = useCache();
	const [loading, setLoading] = React.useState(true);
	const [page, setPage] = React.useState(0);
	const [thisStudents, setThisStudents] = React.useState([]);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchStudents = async () => {
			// Fetch students from the backend
			const request = await authFetch(`${API_Route}/users/students/?limit=20&offset=${page * 20}`, { signal: controller.signal });
			setLoading(false);
			if (!request.ok) return;

			/** @type {{students: import('../../../classes/Student').StudentProps[], length: Number}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) return;
			pushToCache('peers', data.students, false);
			setThisStudents(data.students);
		};
		fetchStudents();

		return () => controller.abort();
	}, [page]);

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
				</Flex>
			]
		});
	}, [setHeader, setSelectedKeys, mobile]);
	return (
		<Flex vertical gap={32} style={{ width: '100%' }}>
			<StudentPage students={thisStudents} loading={loading} />
			{!loading && thisStudents && thisStudents.length > 0 && (
				<div
					onClick={() => {
						const pageContent = document.getElementById('page-content');
						if (pageContent)
							pageContent.scrollTo({ top: 0, behavior: 'smooth' });
					}}
				>
					<Flex justify='center' style={{ width: '100%' }}>
						<Pagination
							current={page + 1}
							pageSize={20}
							onChange={(page) => {
								setPage(page - 1);
								const pageContent = document.getElementById('page-content');
								if (pageContent)
									pageContent.scrollTo({ top: 0, behavior: 'smooth' });
							}}
							showSizeChanger={false}
							total={cache.peers ? cache.peers.length : 0}
						/>
					</Flex>
				</div>
			)}
		</Flex>
	);
};

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
				<Flex vertical justify='flex-start' align='flex-start' gap={8} style={{ flex: 1 }}>
					<Title level={3}>{thisStudent.name.first} {thisStudent.name.last}</Title>
					<Flex align='center' gap={8} wrap>
						<Tag><Text style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{thisStudent.id}</Text></Tag>
						<Tag color={thisStudent.institute === 'ics' ? 'orange' : thisStudent.institute === 'ite' ? 'blue' : thisStudent.institute === 'ibe' ? 'yellow' : 'gray'}><Text style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{thisStudent.institute.toUpperCase()}</Text></Tag>
					</Flex>
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
 * 	students: Student[];
 * 	loading: Boolean;
 * }} props
 * @returns {JSX.Element}
 */
const StudentPage = ({ students, loading }) => {
	const navigate = useNavigate();
	const { mobile } = React.useContext(MobileContext);

	return (
		<>
			{students.length > 0 ? (
				<Row gutter={[16, 16]}>
					<AnimatePresence mode='popLayout'>
						{students.map((student, index) => (
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
						{loading ? (
						<Spin />
					) : (
						<Empty description='No profiles found' />
					)}
				</div>
			)}
		</>
	);
};

export default Verified;
export { StudentCard, StudentPage };
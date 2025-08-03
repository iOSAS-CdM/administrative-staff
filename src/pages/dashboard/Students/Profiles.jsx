import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Input,
	Tooltip,
	Button,
	Segmented,
	Popover,
	Flex,
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
	SearchOutlined,
	FilterOutlined,
	EditOutlined,
	LockOutlined,
	RightOutlined,
	EllipsisOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

import EditStudent from '../../../modals/EditStudent';
import RestrictStudent from '../../../modals/RestrictStudent';

import ItemCard from '../../../components/ItemCard';

import { MobileContext, OSASContext } from '../../../main';

import Student from '../../../classes/Student';

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

/** @typedef {[Student[], React.Dispatch<React.SetStateAction<Student[]>>]} StudentsState */

const Profiles = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['profiles']);
	}, [setSelectedKeys]);

	const { mobile, setMobile } = React.useContext(MobileContext);
	const { osas, setOsas } = React.useContext(OSASContext);

	/** @typedef {'ics' | 'ite' | 'ibe' | 'active' | 'restricted'} Category */
	/** @type {[Category, React.Dispatch<React.SetStateAction<Category>>]} */
	const [category, setCategory] = React.useState('active');
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

	/** @type {StudentsState} */
	const [students, setStudents] = React.useState([]);
	/** @type {StudentsState} */
	const [institutionizedStudents, setInstitutionizedStudents] = React.useState([]);
	/** @type {StudentsState} */
	const [filteredStudents, setFilteredStudents] = React.useState([]);
	/** @type {StudentsState} */
	const [displayedStudents, setDisplayedStudents] = React.useState([]);

	React.useEffect(() => {
		if (osas.students.length > 0)
			setStudents(osas.students);
	}, [osas.students]);

	React.useEffect(() => {
		if (students.length > 0)
			setInstitutionizedStudents(students.filter(student =>
				(student.institute === category && student.status === 'active')
				|| (category === 'active' && student.status === 'active')
				|| (category === 'restricted' && student.status === 'restricted')
				|| (category === 'archived' && student.status === 'archived'))
			);
	}, [students, category]);

	React.useEffect(() => {
		/** @type {Student[]} */
		const filtered = [];

		// Filter by year and program
		for (const student of institutionizedStudents) {
			if (filter.years.length > 0 && !filter.years.includes(student.year))
				continue;
			if (filter.programs.length > 0 && !filter.programs.includes(student.program))
				continue;
			filtered.push(student);
		};

		setFilteredStudents(filtered);
	}, [institutionizedStudents, filter]);

	React.useEffect(() => {
		if (search.trim() === '') {
			setDisplayedStudents(filteredStudents);
			return;
		};
		setDisplayedStudents([]);

		const searchTerm = search.toLowerCase();
		const searchedStudents = filteredStudents.filter(student => {
			return (
				student.name.first.toLowerCase().includes(searchTerm) ||
				student.name.middle.toLowerCase().includes(searchTerm) ||
				student.name.last.toLowerCase().includes(searchTerm) ||
				`${student.name.first} ${student.name.middle} ${student.name.last}`.toLowerCase().includes(searchTerm) ||
				`${student.name.first} ${student.name.last}`.toLowerCase().includes(searchTerm) ||
				student.studentId.toLowerCase().includes(searchTerm) ||
				student.email.toLowerCase().includes(searchTerm)
			);
		});
		setTimeout(() => {
			setDisplayedStudents(searchedStudents);
		}, remToPx(0.5));
	}, [search, filteredStudents, mobile]);

	React.useEffect(() => {
		setHeader({
			title: 'Student Profiles',
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
						setCategory(value);
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

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex vertical gap={16} style={{ width: '100%', height: '100%' }}>
			{/************************** Profiles **************************/}
			{displayedStudents.length > 0 ? (
				<Row gutter={[16, 16]}>
					{displayedStudents.map((student, index) => (
						<Col key={student.studentId} span={!mobile ? 12 : 24} style={{ height: '100%' }}>
							<StudentCard
								student={student}
								loading={student.placeholder}
								navigate={navigate}
							/>
						</Col>
					))}
				</Row>
			) : (
				<Empty description='No profiles found' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
			)}
		</Flex>
	);
};

export default Profiles;

/**
 * @param {{
 * 	student: Student,
 * 	loading: Boolean,
 * 	navigate: ReturnType<typeof useNavigate>
 * }} param0 
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
				if (e.target.closest('.student-card-dropdown, .ant-dropdown-menu'))
					return;
				if (thisStudent.placeholder)
					Modal.error({
						title: 'Error',
						content: 'This is a placeholder student profile. Please try again later.',
						centered: true
					});
				else
					navigate(`/dashboard/students/profiles/${thisStudent.studentId}`, {
						state: { studentId: thisStudent.studentId }
					});
			}}
		>
			<Flex justify='flex-start' align='center' gap={16} style={{ width: '100%' }}>
				<Avatar
					src={thisStudent.profilePicture}
					size='large'
					style={{ width: 64, height: 64 }}
				/>
				<Flex vertical justify='flex-start' align='flex-start' style={{ flex: 1 }}>
					<Title level={4}>{thisStudent.name.first} {thisStudent.name.middle} {thisStudent.name.last} <Text type='secondary' style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{thisStudent.studentId}</Text></Title>
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
				>
					<Button
						type='default'
						className='student-card-dropdown'
						icon={<EllipsisOutlined />}
					/>
				</Dropdown>
			</Flex>
		</ItemCard>
	);
};
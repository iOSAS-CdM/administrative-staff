import React from 'react';
import { useNavigate } from 'react-router';
import {
	App,
	Input,
	Tooltip,
	Button,
	Tag,
	Flex,
	Spin,
	Checkbox,
	Divider,
	Dropdown,
	Avatar,
	Typography
} from 'antd';

import ContentPage from '../../../components/ContentPage';

import {
	EditOutlined,
	LockOutlined,
	EllipsisOutlined,
	CheckOutlined
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
	const [search, setSearch] = React.useState('');
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearching] = React.useState(false);

	const { cache, pushToCache } = useCache();

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchSearchResults = async () => {
			if (search.length === 0) return setSearchResults([]);

			// Fetch students from the backend
			setSearching(true);
			const request = await authFetch(`${API_Route}/users/search/students/?q=${encodeURIComponent(search)}`, { signal: controller.signal });
			if (!request?.ok) return;

			/** @type {{students: import('../../../classes/Student').StudentProps[], length: Number}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) return;
			setSearchResults(data.students);
			setSearching(false);
			pushToCache('peers', data.students, false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search]);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Verified Profiles',
			actions: [
				<Flex style={{ flexGrow: mobile ? 1 : '' }} key='search'>
					<Dropdown
						showArrow={false}
						open={search.length > 0}
						position='bottomRight'
						placement='bottomRight'
						menu={{
							items: searchResults.length > 0 ? searchResults.map((student) => ({
								key: student.id,
								label: (
									<div
										style={{ width: '100%' }}
									>
										<Flex align='center' gap={8}>
											<Avatar src={student.profilePicture} size='small' />
											<Text style={{ flex: 1 }}>{student.name.first} {student.name.last} ({student.id})</Text>
											<Tag color={student.institute === 'ics' ? 'orange' : student.institute === 'ite' ? 'blue' : student.institute === 'ibe' ? 'yellow' : 'gray'}><Text style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{student.institute.toUpperCase()}</Text></Tag>
										</Flex>
									</div>
								)
							})) : [{
								key: 'no-results',
								label: <Text>No results found</Text>,
								disabled: true
							}],
							placement: 'bottomRight',
							style: { width: mobile ? '100%' : 256, maxHeight: 512, overflowY: 'auto' },
							onClick: (e) => {
								setSearch('');
								navigate(`/dashboard/students/profile/${e.key}`);
							}
						}}
					>
						<Input.Search
							placeholder='Search'
							allowClear
							suffix={searching ? <Spin size='small' /> : null}
							onChange={(e) => {
								const value = e.target.value;
								clearTimeout(window.profileDebounceTimer);
								const debounceTimer = setTimeout(() => {
									setSearch(value);
								}, 512);
								window.profileDebounceTimer = debounceTimer;
							}}
							style={{ width: '100%', minWidth: mobile ? '100%' : 256 }} // 2^8
						/>
					</Dropdown>
				</Flex>
			]
		});
	}, [setHeader, setSelectedKeys, mobile, search, searchResults, searching]);
	return (
		<ContentPage
			fetchUrl={`${API_Route}/users/students/`}
			emptyText='No profiles found'
			cacheKey='peers'
			transformData={(data) => data.students || []}
			totalItems={cache.peers?.filter(student => student.role === 'student').length + 1 || 0}
			renderItem={(student) => (
				<StudentCard
					student={student}
					loading={student.placeholder}
					navigate={navigate}
				/>
			)}
		/>
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
							...thisStudent?.role === 'unverified-student' ? [
								{
									key: 'verify',
									icon: <CheckOutlined />,
									label: <Text>Verify</Text>
								}
							] : [],
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
							else if (e.key === 'verify')
								Modal.confirm({
									title: 'Verify Student',
									content: `Are you sure you want to verify ${thisStudent.name.first} ${thisStudent.name.last}'s profile? This action cannot be undone.`,
									centered: true,
									onOk: async () => {
										const request = await authFetch(`${API_Route}/users/student/${thisStudent.id}/verify`, {
											method: 'POST'
										});
										if (!request?.ok) {
											Modal.error({
												title: 'Error',
												content: 'An error occurred while trying to verify this student. Please try again later.',
												centered: true
											});
											return;
										};
										navigate(`/dashboard/students/profile/${thisStudent.id}`);

										Modal.success({
											title: 'Success',
											content: `${thisStudent.name.first} ${thisStudent.name.last}'s profile has been verified.`,
											centered: true
										});
									}
								});
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
const StudentPage = () => {
	const navigate = useNavigate();

	return (
		<ContentPage
			fetchUrl={`${API_Route}/users/students/`}
			emptyText='No profiles found'
			cacheKey='peers'
			transformData={(data) => data.students || []}
			renderItem={(student) => (
				<StudentCard
					student={student}
					loading={student.placeholder}
					navigate={navigate}
				/>
			)}
		/>
	);
};

export default Verified;
export { StudentCard, StudentPage };
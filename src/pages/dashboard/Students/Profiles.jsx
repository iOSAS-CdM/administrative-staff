import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Form,
	Input,
	Card,
	Button,
	Segmented,
	Dropdown,
	Flex,
	Empty,
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

import '../../../styles/pages/Dashboard.css';

const Profiles = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	React.useEffect(() => {
		setHeader({
			title: 'Student Profiles',
			actions: null
		});
	}, [setHeader]);
	React.useEffect(() => {
		setSelectedKeys(['profiles']);
	}, [setSelectedKeys]);

	const [category, setCategory] = React.useState('all');
	const FilterForm = React.useRef(null);
	const [students, setStudents] = React.useState([]);
	const [displayedStudents, setDisplayedStudents] = React.useState([]);

	React.useEffect(() => {
		const placeholderStudent = [];
		for (let i = 0; i < 20; i++) {
			const id = `placeholder-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;
			if (students.some(student => student.studentId === id)) {
				continue;
			};
			placeholderStudent.push({
				id: id,
				name: {
					first: `First ${i + 1}`,
					middle: `Middle ${i + 1}`,
					last: `Last ${i + 1}`
				},
				email: `student${i + 1}@example.com`,
				studentId: id,
				institute: ['ics', 'ite', 'ibe'][i % 3],
				profilePicture: null,
				placeholder: true,
				status: 'active'
			});
		};
		setStudents(placeholderStudent);

		fetch('https://randomuser.me/api/?results=20&inc=name,email,phone,login,picture')
			.then(response => response.json())
			.then(data => {
				const fetchedStudents = [];
				for (let i = 0; i < data.results.length; i++) {
					const user = data.results[i];
					fetchedStudents.push({
						id: i + 1,
						name: {
							first: user.name.first,
							middle: user.name.middle || '',
							last: user.name.last
						},
						email: user.email,
						phone: user.phone,
						studentId: (() => {
							let id;
							do {
								id = `25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}`;
							} while (fetchedStudents.some(student => student.studentId === id));
							return id;
						})(),
						institute: ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)],
						profilePicture: user.picture.large,
						placeholder: false,
						status: ['active', 'restricted', 'archived'][Math.floor(Math.random() * 3)]
					});
				};
				setStudents(fetchedStudents);
			})
			.catch(error => console.error('Error fetching student data:', error));
	}, []);
	
	React.useEffect(() => {
		setDisplayedStudents(students);
		categorizeFilter('all');
	}, [students]);

	const categorizeFilter = (value) => {
		let filteredStudents = students;

		if (value !== 'all')
			filteredStudents = students.filter(student => student.institute === value);

		setDisplayedStudents([]);
		setTimeout(() => {
			setDisplayedStudents(filteredStudents);
		}, remToPx(2));
	};

	const searchCategorizedStudent = (searchTerm) => {
		setCategory('all');

		if (searchTerm.trim() === '') {
			setDisplayedStudents(students);
			return;
		};

		const filteredStudents = students.filter(student => {
			const fullName = `${student.name.first} ${student.name.middle} ${student.name.last}`.toLowerCase();
			const studentId = student.studentId.toLowerCase();
			const email = student.email.toLowerCase();
			return fullName.includes(searchTerm.toLowerCase()) ||
				studentId.includes(searchTerm.toLowerCase()) ||
				email.includes(searchTerm.toLowerCase());
		});

		setDisplayedStudents([]);
		setTimeout(() => {
			setDisplayedStudents(filteredStudents);
		}, remToPx(2));
	};

	return (
		<Flex vertical gap='small' style={{ width: '100%', height: '100%' }}>
			{/************************** Filter **************************/}
			<Form
				id='filter'
				layout='vertical'
				ref={FilterForm}
				style={{ width: '100%' }}
				initialValues={{ search: '', category: 'all' }}
			>
				<Flex justify='space-between' align='center' gap='small'>
					<Card size='small' {...mobile ? { style: { width: '100%' } } : {}}>
						<Form.Item
							name='search'
							style={{ margin: 0 }}
						>
							<Input
								placeholder='Search'
								allowClear
								prefix={<SearchOutlined />}
								onChange={(e) => searchCategorizedStudent(e.target.value)}
							/>
						</Form.Item>
					</Card>
					<Card size='small'>
						<Form.Item
							name='category'
							style={{ margin: 0 }}
						>
							{!mobile ?
								<Segmented
									options={[
										{ label: 'All', value: 'all' },
										{ label: 'ICS', value: 'ics' },
										{ label: 'ITE', value: 'ite' },
										{ label: 'IBE', value: 'ibe' },
										{ label: 'Archived', value: 'archived' }
									]}
									value={category}
									onChange={(value) => {
										setCategory(value);
										categorizeFilter(value);
										FilterForm.current.setFieldsValue({ search: '' });
									}}
									style={{ width: '100%' }}
								/>
								:
								<Dropdown
									trigger={['click']}
									placement='bottomRight'
									arrow
									popupRender={(menu) => (
										<Card size='small'>
											<Segmented
												options={[
													{ label: 'All', value: 'all' },
													{ label: 'Guidance Officer', value: 'guidance' },
													{ label: 'Prefect of Discipline Officer', value: 'prefect' },
													{ label: 'Student Affairs Officer', value: 'student-affairs' }
												]}
												vertical
												value={category}
												onChange={(value) => {
													setCategory(value);
													categorizeFilter(value);
													FilterForm.current.setFieldsValue({ search: '' });
												}}
												style={{ width: '100%' }}
											/>
										</Card>
									)}
								>
									<Button
										icon={<FilterOutlined />}
										onClick={(e) => e.stopPropagation()}
									/>
								</Dropdown>
							}
						</Form.Item>
					</Card>
				</Flex>
			</Form>

			{/************************** Profiles **************************/}
			{displayedStudents.length > 0 ? (
				<Row gutter={[16, 16]}>
					{displayedStudents.map((student, index) => (
						<Col key={student.id} span={!mobile ? 8 : 24} style={{ height: '100%' }}>
							<StudentCard
								student={student}
								animationDelay={index * 0.1}
								loading={student.placeholder}
								navigate={navigate}
							/>
						</Col>
					))}
				</Row>
			) : (
				<Flex justify='center' align='center' style={{ height: '100%' }}>
					<Empty description='No profiles found' />
				</Flex>
			)}
		</Flex>
	);
};

export default Profiles;

const StudentCard = ({ student, animationDelay, loading, navigate }) => {
	const [mounted, setMounted] = React.useState(false);

	const [thisStudent, setThisStudent] = React.useState(student);

	React.useEffect(() => {
		const timer = setTimeout(() => {
			setMounted(true);
		}, animationDelay * 1000 || 0);

		return () => clearTimeout(timer);
	}, [animationDelay]);

	React.useEffect(() => {
		if (student) {
			setThisStudent(student);
		};
	}, [student]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Card
			size='small'
			hoverable
			loading={loading}
			className={mounted ? 'student-card-mounted' : 'student-card-unmounted'}
			style={{ height: '100%' }}
			actions={[
				<EditOutlined onClick={() => { }} key='edit' />,
				<LockOutlined onClick={() => { }} key='restrict' />,
				<RightOutlined onClick={() => {
					if (thisStudent.placeholder) {
						Modal.error({
							title: 'Error',
							content: 'This is a placeholder student profile. Please try again later.',
							centered: true
						});
					} else {
						navigate(`/dashboard/students/profiles/${thisStudent.studentId}`, {
							state: { student: thisStudent }
						});
					};
				}} key='view' />
			]}
		>
			<Flex justify='flex-start' align='flex-start' gap='small' style={{ width: '100%' }}>
				<Avatar
					src={thisStudent.profilePicture}
					size='large'
				/>
				<Flex vertical justify='flex-start' align='flex-start'>
					<Title level={4}>{thisStudent.name.first} {thisStudent.name.middle} {thisStudent.name.last} <Text type='secondary' style={{ unicodeBidi: 'bidi-override' }}>{thisStudent.studentId}</Text></Title>
					<Text>{
						thisStudent.institute === 'ics' ? 'Institute of Computing Studies' :
							thisStudent.institute === 'ite' ? 'Institute of Teacher Education' :
								thisStudent.institute === 'ibe' ? 'Institute of Business Entrepreneurship' : ''
					}</Text>
				</Flex>
			</Flex>
		</Card>
	);
};
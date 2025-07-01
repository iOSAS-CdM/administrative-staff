import React from 'react';
import { useNavigate } from 'react-router';

import {
	App,
	Table,
	Input,
	Card,
	Button,
	Segmented,
	Dropdown,
	Flex,
	Empty,
	Checkbox,
	Divider,
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
	RightOutlined,
	TableOutlined,
	UnorderedListOutlined
} from '@ant-design/icons';

import remToPx from '../../../utils/remToPx';

const { Title, Text } = Typography;

import EditStudent from '../../../modals/EditStudent';
import RestrictStudent from '../../../modals/RestrictStudent';

import ItemCard from '../../../components/ItemCard';

const Profiles = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['profiles']);
	}, [setSelectedKeys]);

	const [institute, setInstitute] = React.useState('all');
	const [filter, setFilter] = React.useState({
		years: [],
		programs: []
	});
	const [search, setSearch] = React.useState('');

	const FilterForm = React.useRef(null);

	const [students, setStudents] = React.useState([]);
	const [institutionizedStudents, setInstitutionizedStudents] = React.useState([]);
	const [filteredStudents, setFilteredStudents] = React.useState([]);
	const [displayedStudents, setDisplayedStudents] = React.useState([]);

	React.useEffect(() => {
		const placeholderStudent = [];
		for (let i = 0; i < 20; i++) {
			const id = `placeholder-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;
			if (students.some(student => student.studentId === id)) {
				continue;
			};
			const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];
			const programs = {
				'ics': ['BSCpE', 'BSIT'],
				'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
				'ibe': ['BSBA-HRM', 'BSE']
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
				institute: institute,
				program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
				year: Math.floor(Math.random() * 4) + 1,
				profilePicture: null,
				placeholder: true,
				status: 'active'
			});
		};
		setStudents(placeholderStudent);

		fetch('https://randomuser.me/api/?results=100&inc=name,email,phone,login,picture')
			.then(response => response.json())
			.then(data => {
				const fetchedStudents = [];

				for (let i = 0; i < data.results.length; i++) {
					const user = data.results[i];
					const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];
					const programs = {
						'ics': ['BSCpE', 'BSIT'],
						'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
						'ibe': ['BSBA-HRM', 'BSE']
					};

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
						institute: institute,
						program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
						year: Math.floor(Math.random() * 4) + 1,
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
		if (students.length > 0)
			setInstitutionizedStudents(students.filter(student => student.institute === institute || institute === 'all' || (institute === 'restricted' && student.status === 'restricted')|| (institute === 'archived' && student.status === 'archived')));
	}, [students, institute]);

	React.useEffect(() => {
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

		const searchTerm = search.toLowerCase();
		const searchedStudents = filteredStudents.filter(student => {
			return (
				student.name.first.toLowerCase().includes(searchTerm) ||
				student.name.middle.toLowerCase().includes(searchTerm) ||
				student.name.last.toLowerCase().includes(searchTerm) ||
				`${student.name.first} ${student.name.middle} ${student.name.last}`.toLowerCase().includes(searchTerm) ||
				student.studentId.toLowerCase().includes(searchTerm) ||
				student.email.toLowerCase().includes(searchTerm)
			);
		});

		setDisplayedStudents([]);
		setTimeout(() => {
			setDisplayedStudents(searchedStudents);
		}, remToPx(0.5));
	}, [search, filteredStudents]);

	const [view, setView] = React.useState('card');

	React.useEffect(() => {
		setHeader({
			title: 'Student Profiles',
			actions: [
				<Flex>
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
						style={{ minWidth: remToPx(20) }}
					/>
				</Flex>,
				<Flex gap={8}>
					{!mobile && (
						<Segmented
							options={[
								{ label: 'All', value: 'all' },
								{ label: 'ICS', value: 'ics' },
								{ label: 'ITE', value: 'ite' },
								{ label: 'IBE', value: 'ibe' },
								{ label: 'Restricted', value: 'restricted' },
								{ label: 'Archived', value: 'archived' }
							]}
							value={institute}
							onChange={(value) => {
								setInstitute(value);
							}}
						/>
					)}

					<Dropdown
						trigger={['click']}
						placement='bottomRight'
						arrow
						popupRender={(menu) => (
							<Card size='small'>
								<Flex vertical gap={8}>
									{mobile &&
										<Segmented
											options={[
												{ label: 'All', value: 'all' },
												{ label: 'ICS', value: 'ics' },
												{ label: 'ITE', value: 'ite' },
												{ label: 'IBE', value: 'ibe' },
												{ label: 'Restricted', value: 'restricted' },
												{ label: 'Archived', value: 'archived' }
											]}
											vertical
											value={institute}
											onChange={(value) => {
												setInstitute(value);
											}}
											style={{ width: '100%' }}
										/>
									}
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
												{(institute === 'ics' || institute === 'all' || institute === 'restricted' || institute === 'archived') && (
													<>
														<Text type='secondary'>Institute of Computing Studies</Text>
														<Checkbox value='BSCpE'>Bachelor of Science in Computer Engineering (BSCpE)</Checkbox>
														<Checkbox value='BSIT'>Bachelor of Science in Information Technology (BSIT)</Checkbox>
													</>
												)}
												{(institute === 'ite' || institute === 'all' || institute === 'restricted' || institute === 'archived') && (
													<>
														<Text type='secondary'>Institute of Teacher Education</Text>
														<Checkbox value='BSEd-SCI'>Bachelor of Secondary Education major in Science (BSEd-SCI)</Checkbox>
														<Checkbox value='BEEd-GEN'>Bachelor of Elementary Education - Generalist (BEEd-GEN)</Checkbox>
														<Checkbox value='BEEd-ECED'>Bachelor of Early Childhood Education (BEEd-ECED)</Checkbox>
														<Checkbox value='BTLEd-ICT'>Bachelor of Technology and Livelihood Education major in Information and Communication Technology (BTLEd-ICT)</Checkbox>
														<Checkbox value='TCP'>Teacher Certificate Program (18 Units-TCP)</Checkbox>
													</>
												)}
												{(institute === 'ibe' || institute === 'all' || institute === 'restricted' || institute === 'archived') && (
													<>
														<Text type='secondary'>Institute of Business Entrepreneurship</Text>
														<Checkbox value='BSBA-HRM'>Bachelor of Science in Business Administration Major in Human Resource Management (BSBA-HRM)</Checkbox>
														<Checkbox value='BSE'>Bachelor of Science in Entrepreneurship (BSE)</Checkbox>
													</>
												)}
											</Flex>
										</Checkbox.Group>
									</Flex>

									<Button
										type='primary'
										size='small'
										onClick={() => { }}
									>
										Reset
									</Button>
								</Flex>
							</Card>
						)}
					>
						<Button
							icon={<FilterOutlined />}
							onClick={(e) => e.stopPropagation()}
						/>
					</Dropdown>

					<Button
						icon={view === 'table' ? <UnorderedListOutlined /> : <TableOutlined />}
						onClick={() => {
							setView(view === 'table' ? 'card' : 'table');
						}}
					/>
				</Flex>
			]
		});
	}, [setHeader, institute]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex vertical gap={16} style={{ width: '100%', height: '100%' }}>
			{/************************** Profiles **************************/}
			{displayedStudents.length > 0 ? (
				view === 'card' ? (
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
					<Table dataSource={displayedStudents} pagination={false} rowKey='studentId' size='small' style={{ minWidth: '100%' }} scroll={{ x: '100%' }}>
						<Table.Column align='center' title='Student ID' dataIndex='studentId' key='studentId' />
						<Table.Column align='center' title='Profile Picture' dataIndex='profilePicture' render={(text, record) => (
							<Avatar src={text} size='large' />
						)} />
						<Table.Column align='center' title='Name'>
							<Table.Column
								align='center'
								title='First'
								dataIndex={['name', 'first']}
								key='firstName'
							/>
							<Table.Column
								align='center'
								title='Middle'
								dataIndex={['name', 'middle']}
								key='middleName'
							/>
							<Table.Column
								align='center'
								title='Last'
								dataIndex={['name', 'last']}
								key='lastName'
							/>
						</Table.Column>
						<Table.Column align='center' title='Email' dataIndex='email' key='email' />
						<Table.Column
							title='Actions'
							align='center'
							render={(text, record) => (
								<Flex gap={8} justify='center' align='center'>
									<Button
										icon={<EditOutlined />}
										onClick={() => {
											if (record.placeholder)
												Modal.error({
													title: 'Error',
													content: 'This is a placeholder student profile. Please try again later.',
													centered: true
												});
											else
												EditStudent(Modal, record, (updatedStudent) => {
													setDisplayedStudents((prev) => prev.map((s) => s.studentId === updatedStudent.studentId ? updatedStudent : s));
												});
										}}
									/>
									<Button
										icon={<LockOutlined />}
										onClick={() => {
											if (record.placeholder)
												Modal.error({
													title: 'Error',
													content: 'This is a placeholder student profile. Please try again later.',
													centered: true
												});
											else
												RestrictStudent(Modal, thisStudent, (updatedStudent) => {
													setDisplayedStudents((prev) => prev.map((s) => s.studentId === updatedStudent.studentId ? updatedStudent : s));
												});
										}}
									/>
									<Button
										icon={<RightOutlined />}
										onClick={() => {
											if (record.placeholder)
												Modal.error({
													title: 'Error',
													content: 'This is a placeholder student profile. Please try again later.',
													centered: true
												});
											else
												navigate(`/dashboard/students/profiles/${record.studentId}`, {
													state: { student: record }
												});
										}}
									/>
								</Flex>
							)}
						/>
					</Table>
				)
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
		<ItemCard
			loading={loading}
			mounted={mounted}

			status={
				student.status === 'archived' ? 'archived' :
				student.status === 'restricted' && 'restricted'
			}

			actions={[
				{
					content: (
						<EditOutlined key='edit' />
					),
					onClick: () => {
						if (thisStudent.placeholder)
							Modal.error({
								title: 'Error',
								content: 'This is a placeholder student profile. Please try again later.',
								centered: true
							});
						else
							EditStudent(Modal, thisStudent, setThisStudent);
					}
				},
				{
					content: (
						<LockOutlined key='restrict' />
					),
					onClick: () => {
						if (thisStudent.placeholder)
							Modal.error({
								title: 'Error',
								content: 'This is a placeholder student profile. Please try again later.',
								centered: true
							});
						else
							RestrictStudent(Modal, thisStudent, setThisStudent);
					}
				},
				{
					content: (
						<RightOutlined key='view' />
					),
					onClick: () => {
						if (thisStudent.placeholder)
							Modal.error({
								title: 'Error',
								content: 'This is a placeholder student profile. Please try again later.',
								centered: true
							});
						else
							navigate(`/dashboard/students/profiles/${thisStudent.studentId}`, {
								state: { student: thisStudent }
							});
					}
				}
			]}
		>
			<Flex justify='flex-start' align='flex-start' gap={16} style={{ width: '100%' }}>
				<Avatar
					src={thisStudent.profilePicture}
					size='large'
					style={{ width: remToPx(6), height: remToPx(6) }}
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
		</ItemCard >
	);
};
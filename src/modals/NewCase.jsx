import React from 'react';
import dayjs from 'dayjs';

import {
	Form,
	Input,
	Upload,
	Select,
	Flex,
	Typography,
	Button,
	Image,
	Space,
	DatePicker
} from 'antd';

import {
	BankOutlined,
	UploadOutlined,
	ScanOutlined,
	ClearOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const NewCaseForm = React.createRef();

const CaseForm = () => {
	/** @type {import('../classes/Student').StudentProps[]} */
	const [students, setStudents] = React.useState([]);

	/** @typedef {[(import('../classes/Student').StudentProps & { disabled: Boolean })[], React.Dispatch<React.SetStateAction<(import('../classes/Student').StudentProps & { disabled: Boolean })[]>>]} StudentsState */

	/** @type {StudentsState} */
	const [complainantOptionStudents, setComplainantOptionStudents] = React.useState([]);
	/** @type {StudentsState} */
	const [complaineeOptionStudents, setComplaineeOptionStudents] = React.useState([]);

	React.useEffect(() => {
		fetch('https://randomuser.me/api/?results=100&inc=name,email,phone,login,picture')
			.then(response => response.json())
			.then(data => {
				/** @type {import('../classes/Student').StudentProps[]} */
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
		setComplainantOptionStudents(students.filter(student => student.status === 'active' || student.status === 'restricted'));
		setComplaineeOptionStudents(students.filter(student => student.status === 'active' || student.status === 'restricted'));
	}, [students]);

	const [file, setFile] = React.useState(null);
	const [severity, setSeverity] = React.useState('minor'); // 'minor', 'major', 'severe'

	return (
		<Form
			layout='vertical'
			ref={NewCaseForm}
			onFinish={(values) => { }}
			initialValues={{
				violation: '',
				date: dayjs(new Date()),
				tags: {
					severity: '', // 'minor', 'major', 'severe'
				},
				complainants: [],
				complainees: [],
				description: '',
				repository: []
			}}
			style={{ width: '100%' }}
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
		>
			<Flex gap={32}>
				<Flex vertical style={{ flex: 1 }}>
					<Form.Item
						name='violation'
						label='Violation'
						rules={[{ required: true, message: 'Please enter a violation!' }]}
					>
						<Select
							placeholder='Select a violation'
							options={[
								{ label: 'Cheating', value: 'cheating' },
								{ label: 'Plagiarism', value: 'plagiarism' },
								{ label: 'Disruptive Behavior', value: 'disruptive_behavior' },
								{ label: 'Harassment', value: 'harassment' }
							]}
							style={{ width: '100%' }}
							showSearch
							filterOption={(input, option) =>
								option.label.toLowerCase().includes(input.toLowerCase())
							}
						/>
					</Form.Item>
					<Form.Item
						name='date'
						label='Date'
						rules={[{ required: true, message: 'Please enter a date!' }]}
					>
						<DatePicker
							style={{ width: '100%' }}
							placeholder='Select a date'
							format='MMMM DD, YYYY'
							disabledDate={(current) => current && current > new Date()}
						/>
					</Form.Item>
					<Form.Item
						name={['tags', 'severity']}
						label='Severity'
						rules={[{ required: true, message: 'Please select a severity!' }]}
						style={{ flex: 1 }}
						status={{
							minor: 'default',
							major: 'warning',
							severe: 'error'
						}[severity]}
					>
						<Select
							placeholder='Select severity'
							options={[
								{ label: 'Minor', value: 'minor' },
								{ label: 'Major', value: 'major' },
								{ label: 'Severe', value: 'severe' }
							]}
							style={{ width: '100%' }}
							filterOption={(input, option) =>
								option.label.toLowerCase().includes(input.toLowerCase())
							}
							onChange={(value) => {
								setSeverity(value);
							}}
						/>
					</Form.Item>
					<Form.Item
						name='complainants'
						label='Complainants'
						rules={[{ required: true, message: 'Please enter complainants!' }]}
					>
						<Select
							mode='tags'
							placeholder='Select complainants'
							options={complainantOptionStudents.map(student => ({
								label: `${student.name.first} ${student.name.last} (${student.studentId})`,
								value: student.studentId,
								disabled: student.disabled
							}))}
							onChange={(value) => {
								// Disable selected students from the complainee options
								const selectedStudents = new Set(value);
								const updatedComplaineeOptions = complaineeOptionStudents.map(student => ({
									...student,
									disabled: selectedStudents.has(student.studentId)
								}));
								setComplaineeOptionStudents(updatedComplaineeOptions);
							}}
							style={{ width: '100%' }}
							showSearch
							filterOption={(input, option) =>
								option.label.toLowerCase().includes(input.toLowerCase())
							}
						/>
					</Form.Item>
					<Form.Item
						name='complainees'
						label='Complainees'
						rules={[{ required: true, message: 'Please enter complainees!' }]}
					>
						<Select
							mode='tags'
							placeholder='Select complainees'
							options={complaineeOptionStudents.map(student => ({
								label: `${student.name.first} ${student.name.last} (${student.studentId})`,
								value: student.studentId,
								disabled: student.disabled
							}))}
							onChange={(value) => {
								// Disable selected students from the complainant options
								const selectedStudents = new Set(value);
								const updatedComplainantOptions = complainantOptionStudents.map(student => ({
									...student,
									disabled: selectedStudents.has(student.studentId)
								}));
								setComplainantOptionStudents(updatedComplainantOptions);
							}}
							style={{ width: '100%' }}
							showSearch
							filterOption={(input, option) =>
								option.label.toLowerCase().includes(input.toLowerCase())
							}
						/>
					</Form.Item>
					<Form.Item
						name='description'
						label='Description'
						rules={[{ required: true, message: 'Please enter a description!' }]}
					>
						<Input.TextArea
							placeholder='Enter a detailed description of the case'
							rows={4}
							style={{ width: '100%' }}
							showCount
							maxLength={5000}
						/>
					</Form.Item>
				</Flex>

				<Flex vertical={!!file} gap={16}>
					<Upload.Dragger
						listType='picture'
						beforeUpload={(file) => {
							if (FileReader && file) {
								const reader = new FileReader();
								reader.onload = (e) => {
									setFile(e.target.result);
									NewCaseForm.current.setFieldsValue({
										repository: [e.target.result]
									});
								};
								reader.readAsDataURL(file);
							};
							return false;
						}} // Prevent auto upload
						showUploadList={false}
						style={{
							position: 'relative',
							width: 256,
							height: '100%'
						}}
						accept='.jpg,.jpeg,.png'
					>
						<Flex vertical justify='center' align='center' style={{ width: '100%', height: '100%' }} gap={8}>
							{file ? (
								<>
									<Image
										src={file}
										alt='Uploaded file preview'
										preview={false}
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											borderRadius: 'var(--border-radius)'
										}}
									/>
								</>
							) : (
								<>
									<UploadOutlined style={{ fontSize: 32 }} />
									<Title level={5} style={{ margin: 0 }}>
										Upload Case Image
									</Title>
									<Paragraph type='secondary' style={{ textAlign: 'center' }}>
										Open your Mobile App<br />
										or drag and drop a file here.
									</Paragraph>
								</>
							)}
						</Flex>
					</Upload.Dragger>

					{file && (
						<Flex justify='space-between' align='center' gap={8} style={{ width: '100%' }}>
							<Button
								type='default'
								icon={<ClearOutlined />}
								onClick={() => {
									setFile(null);
								}}
							>
								Clear
							</Button>
							<Button
								type='primary'
								icon={<ScanOutlined />}
								style={{ flexGrow: 1 }}
								onClick={() => { }}
							>
								Scan
							</Button>
						</Flex>
					)}
				</Flex>
			</Flex>
		</Form>
	);
};

const NewCase = async (Modal) => {
	Modal.info({
		title: 'Open a new Case',
		centered: true,
		closable: { 'aria-label': 'Close' },
		content: (
			<CaseForm />
		),
		icon: <BankOutlined />,
		width: {
			xs: '100%',
			sm: '100%',
			md: '100%',
			lg: 512, // 2^9
			xl: 1024, // 2^10
			xxl: 1024 // 2^10
		},
		footer: (_, { CancelBtn, OkBtn }) => (
			<Flex justify='flex-end' align='center' gap='small'>
				<Text type='secondary' italic>
					Fill up all the required fields *
				</Text>
				<CancelBtn />
				<OkBtn />
			</Flex>
		),
		okText: 'Submit',
		okButtonProps: {
			icon: <UploadOutlined />
		},
		onOk: () => {
			return new Promise((resolve, reject) => {
				NewCaseForm.current.validateFields()
					.then((values) => {
						// Process the form values here
						console.log('Form Values:', values);
						NewCaseForm.current.resetFields();
						resolve();
					})
					.catch((errorInfo) => {
						reject(errorInfo);
					});
			});
		},
		cancelText: 'Cancel',
		cancelButtonProps: {
			icon: <ClearOutlined />,
			hidden: false
		},
		onCancel: () => {
			return new Promise((resolve) => {
				NewCaseForm.current.resetFields();
				resolve();
			});
		}
	});
};

export default NewCase;

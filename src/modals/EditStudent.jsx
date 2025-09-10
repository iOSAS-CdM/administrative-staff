import React from 'react';

import {
	Form,
	Input,
	InputNumber,
	Button,
	Select,
	Upload,
	Avatar,
	Flex,
	Typography,
	Space
} from 'antd';

import {
	SwapOutlined,
	UploadOutlined,
	EditOutlined,
	SaveOutlined,
	ClearOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const EditStudentForm = React.createRef();

import { API_Route } from '../main';
import authFetch from '../utils/authFetch';

/**
 * @param {{
 * 	student: import('../classes/Student').StudentProps
 * }} props
 * @returns {JSX.Element}
 */
const StudentForm = ({ student }) => {
	const [ProfilePicture, setProfilePicture] = React.useState(student.profilePicture || '');

	const [institute, setInstitute] = React.useState(student.institute);
	const programsPerInstitute = {
		'ics': ['BSCpE', 'BSIT'],
		'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
		'ibe': ['BSBA-HRM', 'BSE']
	};
	const programs = {
		'BSCpE': 'Bachelor of Science in Computer Engineering',
		'BSIT': 'Bachelor of Science in Information Technology',
		'BSEd-SCI': 'Bachelor of Secondary Education major in Science',
		'BEEd-GEN': 'Bachelor of Elementary Education - Generalist',
		'BEEd-ECED': 'Bachelor of Early Childhood Education',
		'BTLEd-ICT': 'Bachelor of Technology and Livelihood Education major in Information and Communication Technology',
		'TCP': 'Teacher Certificate Program',
		'BSBA-HRM': 'Bachelor of Science in Business Administration Major in Human Resource Management',
		'BSE': 'Bachelor of Science in Entrepreneurship'
	};

	return (
		<Form
			layout='vertical'
			ref={EditStudentForm}
			onFinish={(values) => { }}
			initialValues={student}
			style={{ width: '100%' }}
		>
			<Flex justify='center' align='flex-start' gap={32}>
				<Form.Item
					name='profilePicture'
					rules={[{ required: true, message: 'Please upload a profile picture!' }]}
				>
					<Flex vertical justify='center' align='center' gap={16}>
						<Upload
							listType='picture-card'
							showUploadList={false}
							beforeUpload={(file) => {
								// Open the file
								const reader = new FileReader();
								reader.onload = (e) => {
									file.preview = e.target.result;
									setProfilePicture(e.target.result);
									EditStudentForm.current.setFieldsValue({
										profilePicture: e.target.result
									});
								};
								reader.readAsDataURL(file);
								return false;
							}}
							style={{
								width: 128,
								height: 128
							}}
						>
							{ProfilePicture ? (
								<Avatar
									src={ProfilePicture}
									shape='square'
									style={{
										width: 128,
										height: 128,
										objectFit: 'cover'
									}}
								/>
							) : (
								<UploadOutlined style={{ fontSize: 'calc(var(--space-XL))' }} />
							)}
						</Upload>
						<Text type='secondary' style={{ textAlign: 'center' }}>
							Click to replace profile picture *
						</Text>
					</Flex>
				</Form.Item>

				<Flex vertical>
					<Space.Compact style={{ width: '100%' }}>
						<Form.Item
							name={['name', 'first']}
							rules={[{ required: true, message: 'Please input the first name!' }]}
							style={{ width: 'calc(100% /3)' }}
						>
							<Input placeholder='First Name *' />
						</Form.Item>
						<Form.Item
							name={['name', 'middle']}
							rules={[{ required: false }]}
							style={{ width: 'calc(100% /3)' }}
						>
							<Input placeholder='Middle Name' />
						</Form.Item>
						<Form.Item
							name={['name', 'last']}
							rules={[{ required: true, message: 'Please input the last name!' }]}
							style={{ width: 'calc(100% /3)' }}
						>
							<Input placeholder='Last Name *' />
						</Form.Item>
					</Space.Compact>
					<Form.Item
						name='email'
						rules={[{ required: true, message: 'Please input the email!' }]}
					>
						<Input placeholder='Email *' type='email' />
					</Form.Item>
					<Form.Item
						name='id'
						rules={[{ required: true, message: 'Please input the Student ID!' }]}
						style={{ width: '100%' }}
					>
						<Input placeholder='Student ID *' />
					</Form.Item>
				</Flex>
			</Flex>
			<Flex vertical>
				<Form.Item
					name='institute'
					rules={[{ required: true, message: 'Please select the institute!' }]}
				>
					<Select
						placeholder='Select Institute *'
						options={[
							{ label: 'Institute of Computing Studies', value: 'ics' },
							{ label: 'Institute of Teacher Education', value: 'ite' },
							{ label: 'Institute of Business Entrepreneurship', value: 'ibe' }
						]}
						onChange={(value) => {
							setInstitute(value);
							EditStudentForm.current.setFieldsValue({ program: programsPerInstitute[value][0] });
						}}
						style={{ width: '100%' }}
					/>
				</Form.Item>
				<Space.Compact style={{ width: '100%' }} block>
					<Form.Item
						name='program'
						rules={[{ required: true, message: 'Please select the program!' }]}
						style={{ width: '100%' }}
					>
						<Select
							placeholder='Select Institute *'
							options={(institute ? programsPerInstitute[institute] : []).map(prog => ({
								label: programs[prog],
								value: prog
							}))}
							style={{ width: '100%' }}
						/>
					</Form.Item>
					<Form.Item
						name='year'
						rules={[{ required: true, message: 'Please input the year!' }]}
					>
						<InputNumber placeholder='Year *' min={1} max={4} />
					</Form.Item>
				</Space.Compact>
			</Flex>
		</Form>
	);
};

/**
 * @param {import('antd/es/modal/useModal').HookAPI} Modal
 * @param {import('../classes/Student').StudentProps} student
 * @param {React.Dispatch<React.SetStateAction<import('../classes/Student').StudentProps>>} setThisStudent
 * 
 * @returns {Promise<void>}
 */
const EditStudent = async (Modal, student, setThisStudent) => {
	console.log(student);
	await Modal.info({
		title: 'Edit Student',
		centered: true,
		closable: { 'aria-label': 'Close' },
		content: (
			<StudentForm student={student} />
		),
		icon: <EditOutlined />,
		width: {
			xs: '100%',
			sm: 512, // 2^9
			md: 512, // 2^9
			lg: 512, // 2^9
			xl: 512, // 2^9
			xxl: 512 // 2^9
		},
		footer: (_, { CancelBtn, OkBtn }) => (
			<Flex justify='flex-end' align='center' gap={16}>
				<CancelBtn />
				<OkBtn />
			</Flex>
		),
		okText: 'Save',
		okButtonProps: {
			icon: <SaveOutlined />
		},
		onOk: () => {
			return new Promise((resolve, reject) => {
				EditStudentForm.current.validateFields()
					.then(async (values) => {
						delete values.role;
						// Submit the form values to the backend
						const request = await authFetch(`${API_Route}/users/student/${student.id}`, {
							method: 'PUT',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(values)
						});
						if (!request.ok) {
							const errorData = await request.json();
							reject(new Error(errorData.message || 'Failed to update student'));
							return;
						};
						const data = await request.json();
						setThisStudent(data);
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
				EditStudentForm.current.resetFields();
				resolve();
			});
		}
	});
};

export default EditStudent;

import React from 'react';

import {
	Form,
	Input,
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

/**
 * @param {{
 * 	student: import('../classes/Student').StudentProps
 * }} props
 * @returns {JSX.Element}
 */
const StudentForm = ({ student }) => {
	const [ProfilePicture, setProfilePicture] = React.useState(student.profilePicture || '');

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
					<Space.Compact style={{ width: '100%' }}>
						<Form.Item
							name='id'
							rules={[{ required: true, message: 'Please input the employee ID!' }]}
							style={{ width: '100%' }}
						>
							<Input placeholder='Employee ID *' />
						</Form.Item>
						<Button
							type='primary'
							icon={<SwapOutlined />}
							style={{ width: 'fit-content' }}
							onClick={() => {
								EditStudentForm.current.setFieldsValue({
									id: `${String((new Date()).getFullYear()).slice(1)}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
								});
							}}
						>
							Generate ID
						</Button>
					</Space.Compact>
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
							style={{ width: '100%' }}
						/>
					</Form.Item>
				</Flex>
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
	Modal.info({
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
			xl: 512 * 1.5, // 2^10
			xxl: 1024 // 2^10
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
					.then((values) => {
						setThisStudent(values);
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

import React from 'react';

import {
	Form,
	Input,
	Flex
} from 'antd';

import {
	SaveOutlined,
	ClearOutlined,
	BankOutlined
} from '@ant-design/icons';

const RestrictStudentForm = React.createRef();

/**
 * Function to restrict student.
 * @param {import('antd/es/modal/useModal').HookAPI} Modal - The Ant Design Modal component.
 * @param {Object} student - The student data to be restricted.
 */
const RestrictStudent = async (Modal, student) => {
	Modal.warning({
		title: 'Restrict Student',
		centered: true,
		closable: { 'aria-label': 'Close' },
		icon: <BankOutlined />,
		width: {
			xs: '100%',
			sm: '100%',
			md: '100%',
			lg: 512, // 2^9
			xl: 1024, // 2^10
			xxl: 1024 // 2^10
		},
		content: (
			<Form
				layout='vertical'
				ref={RestrictStudentForm}
				initialValues={{
					studentId: student.id,
					reason: ''
				}}
			>
				<Form.Item
					name='reason'
					label='Reason for Restriction'
					rules={[{ required: true, message: 'Please provide a reason for the restriction.' }]}
				>
					<Input.TextArea rows={4} placeholder='Enter the reason for restricting this student.' />
				</Form.Item>
			</Form>
		),
		footer: (_, { CancelBtn, OkBtn }) => (
			<Flex justify='flex-end' align='center' gap='small'>
				<CancelBtn />
				<OkBtn />
			</Flex>
		),
		okText: 'Restrict',
		okButtonProps: {
			icon: <SaveOutlined />
		},
		onOk: () => {
			return new Promise((resolve, reject) => {
				RestrictStudentForm.current.validateFields()
					.then((values) => {
						console.log('Student restricted:', values);
						resolve();
					})
					.catch((errorInfo) => {
						console.error('Validation failed:', errorInfo);
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
			RestrictStudentForm.current.resetFields();
			console.log('Restriction cancelled');
		}
	});
};

export default RestrictStudent;

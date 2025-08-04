import React from 'react';

import {
	Form,
	Input,
	Typography
} from 'antd';

import {
	SaveOutlined,
	ClearOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import remToPx from '../utils/remToPx';

const RestrictStudentForm = React.createRef();

/**
 * Function to restrict student.
 * @param {import('antd/es/modal/useModal').HookAPI} Modal - The Ant Design Modal component.
 * @param {Object} student - The student data to be restricted.
 */
const RestrictStudent = async (Modal, student) => {
	Modal.warning({
		title: 'Restrict Student',
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
			setAddingNew(false);
			return new Promise((resolve) => {
				newStudent = null; // Reset newStudent if cancelled
				resolve();
			});
		}
	});
};

export default RestrictStudent;

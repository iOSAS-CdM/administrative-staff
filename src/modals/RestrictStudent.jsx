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

import { API_Route } from '../main';
import authFetch from '../utils/authFetch';

const RestrictStudentForm = React.createRef();

/**
 * Function to restrict student.
 * @param {import('antd/es/modal/useModal').HookAPI} Modal - The Ant Design Modal component.
 * @param {Object} student - The student data to be restricted.
 * @param {Function} setStudent - Optional callback to update the student state after restriction
 */
const RestrictStudent = async (Modal, student, setStudent) => {
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
					id: student.id,
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
			<Flex justify='flex-end' align='center' gap={16}>
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
					.then(async (values) => {
						try {
							const request = await authFetch(`${API_Route}/users/student/${student.id}/restrict`, {
								method: 'PATCH',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									reason: values.reason
								})
							});

							if (!request?.ok) {
								const errorData = await request.json().catch(() => ({}));
								Modal.error({
									title: 'Error',
									content: errorData.message || 'An error occurred while trying to restrict this student. Please try again later.',
									centered: true
								});
								reject();
								return;
							}

							const restrictedStudent = await request.json();

							// Update student state if callback provided
							if (setStudent && typeof setStudent === 'function') {
								setStudent(restrictedStudent);
							}

							Modal.success({
								title: 'Success',
								content: `${student.name.first} ${student.name.last} has been restricted successfully.`,
								centered: true
							});

							resolve();
						} catch (error) {
							console.error('Error restricting student:', error);
							Modal.error({
								title: 'Error',
								content: 'An unexpected error occurred. Please try again later.',
								centered: true
							});
							reject(error);
						}
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

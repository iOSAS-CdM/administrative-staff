import React from 'react';

import {
	Form,
	Input,
	Flex
} from 'antd';

import {
	SendOutlined,
	ClearOutlined,
	BellOutlined
} from '@ant-design/icons';

import { API_Route } from '../main';
import authFetch from '../utils/authFetch';

const SummonStudentForm = React.createRef();

/**
 * Function to summon student.
 * @param {import('antd/es/modal/useModal').HookAPI} Modal - The Ant Design Modal component.
 * @param {Object} student - The student data to be summoned.
 */
const SummonStudent = async (Modal, student) => {
	Modal.info({
		title: 'Summon Student',
		centered: true,
		closable: { 'aria-label': 'Close' },
		icon: <BellOutlined />,
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
				ref={SummonStudentForm}
				initialValues={{
					id: student.id,
					message: ''
				}}
			>
				<p>
					Send a summon notification to <strong>{student.name.first} {student.name.last}</strong> ({student.email}).
					The student will receive both a push notification and an email.
				</p>
				<Form.Item
					name='message'
					label='Message'
					rules={[{ required: true, message: 'Please provide a message for the summon.' }]}
				>
					<Input.TextArea
						rows={4}
						placeholder='Enter the reason for summoning this student (e.g., "Please report to OSAS office to discuss your recent attendance records.")'
					/>
				</Form.Item>
			</Form>
		),
		footer: (_, { CancelBtn, OkBtn }) => (
			<Flex justify='flex-end' align='center' gap={16}>
				<CancelBtn />
				<OkBtn />
			</Flex>
		),
		okText: 'Send Summon',
		okButtonProps: {
			icon: <SendOutlined />
		},
		onOk: () => {
			return new Promise((resolve, reject) => {
				SummonStudentForm.current.validateFields()
					.then(async (values) => {
						try {
							const request = await authFetch(`${API_Route}/users/student/${student.id}/summon`, {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									message: values.message
								})
							});

							if (!request?.ok) {
								const errorData = await request.json().catch(() => ({}));
								Modal.error({
									title: 'Error',
									content: errorData.message || 'An error occurred while trying to summon this student. Please try again later.',
									centered: true
								});
								reject();
								return;
							}

							await request.json();

							Modal.success({
								title: 'Success',
								content: `${student.name.first} ${student.name.last} has been summoned successfully. They will receive a push notification and email.`,
								centered: true
							});

							resolve();
						} catch (error) {
							console.error('Error summoning student:', error);
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
			SummonStudentForm.current.resetFields();
			console.log('Summon cancelled');
		}
	});
};

export default SummonStudent;

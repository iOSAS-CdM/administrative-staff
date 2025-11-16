import React from 'react';

import {
	Typography,
	Flex
} from 'antd';

import {
	UnlockOutlined,
	ClearOutlined
} from '@ant-design/icons';

import { API_Route } from '../main';
import authFetch from '../utils/authFetch';

const { Text } = Typography;

/**
 * Function to unrestrict student.
 * @param {import('antd/es/modal/useModal').HookAPI} Modal - The Ant Design Modal component.
 * @param {Object} student - The student data to be unrestricted.
 * @param {Function} setStudent - Optional callback to update the student state after unrestriction
 */
const UnrestrictStudent = async (Modal, student, setStudent) => {
	Modal.confirm({
		title: 'Unrestrict Student',
		centered: true,
		closable: { 'aria-label': 'Close' },
		icon: <UnlockOutlined />,
		width: {
			xs: '100%',
			sm: 512, // 2^9
			md: 512, // 2^9
			lg: 512, // 2^9
			xl: 512, // 2^9
			xxl: 512 // 2^9
		},
		content: (
			<Flex vertical gap={16}>
				<Text>
					Are you sure you want to unrestrict <Text strong>{student.name.first} {student.name.last}</Text>?
				</Text>
				<Text type="secondary">
					This will restore their access to iOSAS.
				</Text>
				{student.reason && (
					<Flex vertical gap={4}>
						<Text strong>Current Restriction Reason:</Text>
						<Text type="secondary" style={{ fontStyle: 'italic' }}>
							{student.reason}
						</Text>
					</Flex>
				)}
			</Flex>
		),
		okText: 'Unrestrict',
		okType: 'primary',
		okButtonProps: {
			icon: <UnlockOutlined />
		},
		onOk: async () => {
			try {
				const request = await authFetch(`${API_Route}/users/student/${student.id}/unrestrict`, {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					}
				});

				if (!request?.ok) {
					const errorData = await request.json().catch(() => ({}));
					Modal.error({
						title: 'Error',
						content: errorData.message || 'An error occurred while trying to unrestrict this student. Please try again later.',
						centered: true
					});
					return Promise.reject();
				}

				const unrestrictedStudent = await request.json();

				// Update student state if callback provided
				if (setStudent && typeof setStudent === 'function') {
					setStudent(unrestrictedStudent);
				}

				Modal.success({
					title: 'Success',
					content: `${student.name.first} ${student.name.last} has been unrestricted successfully.`,
					centered: true
				});

				return Promise.resolve();
			} catch (error) {
				console.error('Error unrestricting student:', error);
				Modal.error({
					title: 'Error',
					content: 'An unexpected error occurred. Please try again later.',
					centered: true
				});
				return Promise.reject(error);
			}
		},
		cancelText: 'Cancel',
		cancelButtonProps: {
			icon: <ClearOutlined />
		}
	});
};

export default UnrestrictStudent;

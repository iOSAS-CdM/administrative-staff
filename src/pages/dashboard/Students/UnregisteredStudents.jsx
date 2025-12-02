import React from 'react';
import { useNavigate } from 'react-router';
import { Input, Button, Flex, Typography, App, Modal, AutoComplete, Table, Tag, Spin, Checkbox, Tooltip } from 'antd';
import { SearchOutlined, UserAddOutlined, LockOutlined } from '@ant-design/icons';
import { usePageProps } from '../../../contexts/PagePropsContext';
import { API_Route } from '../../../main';
import authFetch from '../../../utils/authFetch';
import { useCache } from '../../../contexts/CacheContext';
import { useRefresh } from '../../../contexts/RefreshContext';
import { RecordCard } from '../Discipline/Records';

const { Text, Title } = Typography;

/**
 * @type {React.FC}
 */
const UnregisteredStudents = () => {
	const navigate = useNavigate();
	const { setHeader, setSelectedKeys } = usePageProps();
	const { message, modal } = App.useApp();
	const { cache } = useCache();
	const { setRefresh } = useRefresh();

	const [loading, setLoading] = React.useState(false);
	const [unregisteredStudents, setUnregisteredStudents] = React.useState([]);
	const [searchQuery, setSearchQuery] = React.useState('');
	const [selectedStudent, setSelectedStudent] = React.useState(null);
	const [recordsModalVisible, setRecordsModalVisible] = React.useState(false);
	const [studentRecords, setStudentRecords] = React.useState([]);
	const [loadingRecords, setLoadingRecords] = React.useState(false);
	const [selectedRecordIds, setSelectedRecordIds] = React.useState([]);
	const [assignModalVisible, setAssignModalVisible] = React.useState(false);
	const [studentSearch, setStudentSearch] = React.useState('');
	const [studentOptions, setStudentOptions] = React.useState([]);
	const [selectedRegisteredStudent, setSelectedRegisteredStudent] = React.useState(null);
	const [assigning, setAssigning] = React.useState(false);

	// Fetch list of unregistered students
	const fetchUnregisteredStudents = React.useCallback(async () => {
		setLoading(true);
		try {
			const url = searchQuery
				? `${API_Route}/users/unregistered-students/search?q=${encodeURIComponent(searchQuery)}`
				: `${API_Route}/users/unregistered-students`;

			const response = await authFetch(url);
			if (!response?.ok) {
				message.error('Failed to fetch unregistered students');
				return;
			}
			const data = await response.json();
			setUnregisteredStudents(data.unregisteredStudents || []);
		} catch (error) {
			console.error('Error fetching unregistered students:', error);
			message.error('An error occurred while fetching data');
		} finally {
			setLoading(false);
		}
	}, [searchQuery]);

	React.useEffect(() => {
		fetchUnregisteredStudents();
	}, [fetchUnregisteredStudents]);

	const handleRowClick = async (studentName) => {
		setSelectedStudent(studentName);
		setRecordsModalVisible(true);
		setLoadingRecords(true);
		setStudentRecords([]);
		setSelectedRecordIds([]);

		try {
			const response = await authFetch(`${API_Route}/users/unregistered-students/${encodeURIComponent(studentName)}`);
			if (!response?.ok) {
				message.error('Failed to fetch student records');
				return;
			}
			const data = await response.json();
			const records = data.records || [];
			setStudentRecords(records);
			// Pre-select all non-archived records
			const nonArchivedIds = records.filter(r => !r.archived).map(r => r.id);
			setSelectedRecordIds(nonArchivedIds);
		} catch (error) {
			console.error('Error fetching records:', error);
			message.error('An error occurred while fetching records');
		} finally {
			setLoadingRecords(false);
		}
	};

	const handleAssignStudent = () => {
		if (selectedRecordIds.length === 0) {
			message.warning('Please select at least one record to assign');
			return;
		}
		setRecordsModalVisible(false);
		setAssignModalVisible(true);
		setStudentSearch('');
		setStudentOptions([]);
		setSelectedRegisteredStudent(null);
	};

	const handleRecordToggle = (recordId, archived) => {
		if (archived) return; // Don't allow toggling archived records

		setSelectedRecordIds(prev => {
			if (prev.includes(recordId)) {
				return prev.filter(id => id !== recordId);
			} else {
				return [...prev, recordId];
			}
		});
	};

	const searchStudents = async (value) => {
		if (!value || value.trim().length < 2) {
			setStudentOptions([]);
			return;
		}

		try {
			const response = await authFetch(`${API_Route}/users/search/students?q=${encodeURIComponent(value)}`);
			if (!response?.ok) return;

			const data = await response.json();
			const options = (data.students || []).map(student => ({
				value: student.id,
				label: `${student.name.first} ${student.name.last} (${student.id})`,
				student: student
			}));
			setStudentOptions(options);
		} catch (error) {
			console.error('Error searching students:', error);
		}
	};

	const handleAssignConfirm = async () => {
		if (!selectedRegisteredStudent) {
			message.warning('Please select a student to assign');
			return;
		}

		if (selectedRecordIds.length === 0) {
			message.warning('Please select at least one record to assign');
			return;
		}

		setAssigning(true);
		try {
			const response = await authFetch(
				`${API_Route}/users/unregistered-students/${encodeURIComponent(selectedStudent)}/assign/${selectedRegisteredStudent.id}`,
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ recordIds: selectedRecordIds })
				}
			);

			if (!response?.ok) {
				const error = await response.json();
				message.error(error.message || 'Failed to assign student');
				return;
			}

			message.success(`Successfully assigned ${selectedRecordIds.length} record(s) to student`);
			setAssignModalVisible(false);
			setRecordsModalVisible(false);
			setSelectedRecordIds([]);
			// Refresh the data
			setRefresh({ timestamp: Date.now() });
			fetchUnregisteredStudents();
		} catch (error) {
			console.error('Error assigning student:', error);
			message.error('An error occurred while assigning student');
		} finally {
			setAssigning(false);
		}
	};

	React.useEffect(() => {
		setHeader({
			title: 'Unregistered Students',
			actions: []
		});
		setSelectedKeys(['unregistered-students']);
	}, [setHeader, setSelectedKeys]);

	const columns = [
		{
			title: 'Student Name/ID',
			dataIndex: 'name',
			key: 'name',
			render: (text) => <Text strong>{text}</Text>
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 120,
			render: (_, record) => (
				<Button
					type='link'
					size='small'
					onClick={(e) => {
						e.stopPropagation();
						handleRowClick(record.name);
					}}
				>
					View Records
				</Button>
			)
		}
	];

	const dataSource = unregisteredStudents.map((student, index) => ({
		key: index,
		name: student
	}));

	return (
		<Flex vertical gap={16} style={{ width: '100%', height: '100%' }}>
			<Input
				placeholder='Search unregistered students...'
				prefix={<SearchOutlined />}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				allowClear
				size='large'
			/>

			<Table
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				onRow={(record) => ({
					onClick: () => handleRowClick(record.name),
					style: { cursor: 'pointer' }
				})}
				pagination={{
					pageSize: 20,
					showSizeChanger: true,
					showTotal: (total) => `Total ${total} unregistered students`
				}}
			/>

			{/* Records Modal */}
			<Modal
				title={
					<Text strong>Records for '{selectedStudent}'</Text>
				}
				open={recordsModalVisible}
				onCancel={() => setRecordsModalVisible(false)}
				footer={null}
				width={1200}
				style={{ top: 20 }}
			>
				{loadingRecords ? (
					<Flex justify='center' align='center' style={{ padding: 48 }}>
						<Spin size='large' />
					</Flex>
				) : studentRecords.length === 0 ? (
					<Flex vertical align='center' justify='center' style={{ padding: 48 }}>
						<Text type='secondary'>No records found for this student</Text>
					</Flex>
				) : (
					<Flex vertical gap={16}>
						<Flex justify='space-between' align='center' style={{ padding: '0 16px' }}>
							<Text type='secondary'>
								Selected: {selectedRecordIds.length} / {studentRecords.filter(r => !r.archived).length} records
							</Text>
							<Flex gap={8}>
								<Button
									size='small'
									onClick={() => {
										const nonArchivedIds = studentRecords.filter(r => !r.archived).map(r => r.id);
										setSelectedRecordIds(nonArchivedIds);
									}}
								>
									Select All
								</Button>
								<Button
									size='small'
									onClick={() => setSelectedRecordIds([])}
								>
									Deselect All
								</Button>
								<Button
									type='primary'
									icon={<UserAddOutlined />}
									onClick={handleAssignStudent}
									size='small'
								>
									Assign to Student
								</Button>
							</Flex>
						</Flex>
						<Flex vertical gap={16} style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', padding: 16 }}>
							{studentRecords.map((record, index) => (
								<div
									key={index}
									style={{
										padding: 16,
										border: selectedRecordIds.includes(record.id) ? '2px solid var(--ant-color-primary)' : '1px solid var(--ant-color-border)',
										borderRadius: 8,
										cursor: record.archived ? 'not-allowed' : 'pointer',
										transition: 'all 0.2s',
										opacity: record.archived ? 0.6 : 1,
										position: 'relative'
									}}
									onClick={() => {
										if (!record.archived) {
											handleRecordToggle(record.id, record.archived);
										}
									}}
								>
									<Flex gap={16}>
										<Flex align='flex-start' style={{ paddingTop: 4 }}>
											{record.archived ? (
												<Tooltip title='Archived records cannot be assigned'>
													<LockOutlined style={{ fontSize: 20, color: 'var(--ant-color-text-disabled)' }} />
												</Tooltip>
											) : (
												<Checkbox
													checked={selectedRecordIds.includes(record.id)}
													onChange={(e) => {
														e.stopPropagation();
														handleRecordToggle(record.id, record.archived);
													}}
												/>
											)}
										</Flex>
										<Flex vertical gap={8} style={{ flex: 1 }}>
											<Flex justify='space-between' align='center'>
												<Title level={5} style={{ margin: 0 }}>{record.title}</Title>
												<Flex gap={8}>
													{record.archived && <Tag color='orange'>Archived</Tag>}
													<Tag color={
														record.tags?.severity === 'grave' ? 'red' :
															record.tags?.severity === 'major' ? 'orange' : 'default'
													}>
														{record.tags?.severity?.toUpperCase()}
													</Tag>
													<Tag>{record.tags?.status?.toUpperCase()}</Tag>
												</Flex>
											</Flex>
											<Text type='secondary'>{record.description}</Text>
											<Text type='secondary' style={{ fontSize: 12 }}>
												Violation: {record.violation?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
											</Text>
											<Text type='secondary' style={{ fontSize: 12 }}>
												Date: {new Date(record.date).toLocaleDateString('en-US', {
													year: 'numeric',
													month: 'long',
													day: 'numeric'
												})}
											</Text>
											<Button
												type='link'
												size='small'
												style={{ alignSelf: 'flex-start', padding: 0 }}
												onClick={(e) => {
													e.stopPropagation();
													setRecordsModalVisible(false);
													navigate(`/dashboard/discipline/record/${record.id}`);
												}}
											>
												View Full Record →
											</Button>
										</Flex>
									</Flex>
								</div>
							))}
						</Flex>
					</Flex>
				)}
			</Modal>

			{/* Assign Student Modal */}
			<Modal
				title={`Assign '${selectedStudent}' to Registered Student`}
				open={assignModalVisible}
				onCancel={() => setAssignModalVisible(false)}
				onOk={handleAssignConfirm}
				confirmLoading={assigning}
				okText='Assign'
				cancelText='Cancel'
			>
				<Flex vertical gap={16} style={{ marginTop: 16 }}>
					<Text>Search for a registered student to assign these records to:</Text>
					<AutoComplete
						placeholder='Search by name or student ID...'
						value={studentSearch}
						onChange={setStudentSearch}
						onSearch={searchStudents}
						onSelect={(value, option) => {
							setSelectedRegisteredStudent(option.student);
							setStudentSearch(option.label);
						}}
						options={studentOptions}
						style={{ width: '100%' }}
						size='large'
					/>
					{selectedRegisteredStudent && (
						<div style={{ padding: 12, backgroundColor: 'var(--ant-color-bg-container)', border: '1px solid var(--ant-color-border)', borderRadius: 8 }}>
							<Text strong>Selected Student:</Text>
							<br />
							<Text>{selectedRegisteredStudent.name.first} {selectedRegisteredStudent.name.last}</Text>
							<br />
							<Text type='secondary'>{selectedRegisteredStudent.id}</Text>
							<br />
							<Text type='secondary'>{selectedRegisteredStudent.email}</Text>
						</div>
					)}
				</Flex>
			</Modal>
		</Flex>
	);
};

export default UnregisteredStudents;

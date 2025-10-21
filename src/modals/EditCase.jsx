import React from 'react';
import dayjs from 'dayjs';

import {
	Form,
	Input,
	Select,
	Flex,
	Typography,
	Spin,
	DatePicker
} from 'antd';

import {
	EditOutlined,
	ClearOutlined,
	SaveOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const EditCaseForm = React.createRef();

import { API_Route } from '../main';
import { useCache, CacheContext } from '../contexts/CacheContext';

import authFetch from '../utils/authFetch';

/**
 * @type {React.FC<{
 * 	record: import('../classes/Record').RecordProps
 * }>}
 */
const CaseForm = ({ record }) => {
	const { pushToCache } = useCache();

	const [search, setSearch] = React.useState('');
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearchingComplainant] = React.useState(false);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchSearchResults = async () => {
			if (search.length === 0) {
				setSearchResults([]);
				return;
			};

			// Fetch students from the backend
			setSearchingComplainant(true);
			const request = await authFetch(`${API_Route}/users/search/students/?q=${encodeURIComponent(search)}`, { signal: controller.signal });
			if (!request?.ok) return;

			/** @type {{students: import('../../../classes/Student').StudentProps[], length: Number}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) return;
			setSearchResults(data.students);
			setSearchingComplainant(false);
			pushToCache('students', data.students, false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search]);

	const [severity, setSeverity] = React.useState(record?.tags?.severity?.toLowerCase() || 'minor'); // 'minor', 'major', 'severe'

	const [complainants, setComplainants] = React.useState(record?.complainants?.map(c => c.id) || []);
	const [complainees, setComplainees] = React.useState(record?.complainees?.map(c => c.id) || []);

	return (
		<Form
			layout='vertical'
			ref={EditCaseForm}
			onFinish={(values) => { }}
			initialValues={record ? {
				...record,
				date: dayjs(record.date),
				complainants: record.complainants?.map(c => c.id) || [],
				complainees: record.complainees?.map(c => c.id) || [],
				severity: record.tags?.severity?.toLowerCase() || 'minor'
			} : {
				violation: '',
				date: dayjs(new Date()),
				severity: 'minor',
				complainants: [],
				complainees: [],
				description: '',
				files: []
			}}
			style={{ width: '100%' }}
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
		>
			<Flex vertical style={{ flex: 1 }}>
				<Form.Item
					name='title'
					label='Title'
					rules={[{ required: true, message: 'Please enter a title!' }]}
				>
					<Input
						placeholder='Enter a brief title for the case'
						style={{ width: '100%' }}
						maxLength={100}
					/>
				</Form.Item>
				<Form.Item
					name='violation'
					label='Violation'
					rules={[{ required: true, message: 'Please enter a violation!' }]}
				>
					<Select
						placeholder='Select a violation'
						options={[
							{ label: 'Bullying', value: 'bullying' },
							{ label: 'Cheating', value: 'cheating' },
							{ label: 'Disruptive Behavior', value: 'disruptive_behavior' },
							{ label: 'Fraud', value: 'fraud' },
							{ label: 'Gambling', value: 'gambling' },
							{ label: 'Harassment', value: 'harassment' },
							{ label: 'Improper Uniform', value: 'improper_uniform' },
							{ label: 'Litering', value: 'littering' },
							{ label: 'Plagiarism', value: 'plagiarism' },
							{ label: 'Possession of Prohibited Items', value: 'prohibited_items' },
							{ label: 'Vandalism', value: 'vandalism' },
							{ label: 'Other', value: 'other' }
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
					name='severity'
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
				>
					<Select
						mode='tags'
						placeholder='Select complainants'
						options={searchResults.filter(student => !complainees.includes(student.id)).map(student => ({
							label: `${student.name.first} ${student.name.last} (${student.id})`,
							value: student.id
						}))}
						suffixIcon={searching ? <Spin size='small' /> : null}
						onChange={(value) => {
							setComplainants(value);
							setSearchResults([]);
						}}
						onSearch={(value) => {
							setSearch(value);
						}}
						style={{ width: '100%' }}
						showSearch
						filterOption={(input, option) => {
							if (complainants.includes(option.value) || complainees.includes(option.value)) return false;
							return option.label.toLowerCase().includes(input.toLowerCase());
						}}
					/>
				</Form.Item>
				<Form.Item
					name='complainees'
					label='Complainees'
				>
					<Select
						mode='tags'
						placeholder='Select complainees'
						options={searchResults.filter(student => !complainants.includes(student.id)).map(student => ({
							label: `${student.name.first} ${student.name.last} (${student.id})`,
							value: student.id
						}))}
						suffixIcon={searching ? <Spin size='small' /> : null}
						onChange={(value) => {
							setComplainees(value);
							setSearchResults([]);
						}}
						onSearch={(value) => {
							setSearch(value);
						}}
						style={{ width: '100%' }}
						showSearch
						filterOption={(input, option) => {
							if (complainants.includes(option.value) || complainees.includes(option.value)) return false;
							return option.label.toLowerCase().includes(input.toLowerCase());
						}}
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
		</Form>
	);
};

/**
 * @param {import('antd/es/modal/useModal').HookAPI} Modal
 * @param {import('../classes/Record').RecordProps} record
 * @param {React.Dispatch<React.SetStateAction<import('../classes/Record').RecordProps>>} [setThisRecord]
 * 
 * @returns {Promise<void>}
 */
const EditCase = async (Modal, record, setThisRecord) => {
	let newRecord;
	await Modal.info({
		title: 'Edit Case',
		centered: true,
		closable: { 'aria-label': 'Close' },
		content: (
			<CacheContext.Provider value={{}}>
				<CaseForm record={record} />
			</CacheContext.Provider>
		),
		icon: <EditOutlined />,
		width: {
			xs: '100%',
			sm: '100%',
			md: '100%',
			lg: '100%', // 2^9
			xl: 1024, // 2^10
			xxl: 1024 // 2^10
		},
		footer: (_, { CancelBtn, OkBtn }) => (
			<Flex justify='flex-end' align='center' gap={16}>
				<Text type='secondary' italic>
					Fill up all the required fields *
				</Text>
				<CancelBtn />
				<OkBtn />
			</Flex>
		),
		okText: 'Update',
		okButtonProps: {
			icon: <SaveOutlined />
		},
		onOk: () => {
			return new Promise((resolve, reject) => {
				EditCaseForm.current.validateFields()
					.then(async (values) => {
						// Process the form values here
						const request = await authFetch(`${API_Route}/records/${record.id}`, {
							method: 'PATCH',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								...values,
								date: values.date.toDate()
							})
						});
						if (!request?.ok) {
							const errorData = await request.json();
							reject(new Error(errorData.message || 'Failed to update the case. Please try again.'));
							return;
						};

						const data = await request.json();
						if (setThisRecord)
							setThisRecord(data);

						// Reset the form after successful submission
						EditCaseForm.current.resetFields();
						newRecord = data;
						resolve(data);
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
				EditCaseForm.current.resetFields();
				resolve();
			});
		}
	});

	return newRecord;
};

export default EditCase;

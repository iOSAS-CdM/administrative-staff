import React from 'react';
import dayjs from 'dayjs';

import {
	Form,
	Input,
	AutoComplete,
	Select,
	Flex,
	Typography,
	Spin,
	DatePicker,
	Button
} from 'antd';

import {
	EditOutlined,
	ClearOutlined,
	SaveOutlined,
	MinusOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const EditCaseForm = React.createRef();

import { API_Route } from '../main';
import { useCache, CacheProvider } from '../contexts/CacheContext';

import authFetch from '../utils/authFetch';

/**
 * @type {React.FC<{
 * 	record: import('../classes/Record').RecordProps
 * }>}
 */
const CaseForm = ({ record }) => {
	const { pushToCache, cache } = useCache();
	const [form] = Form.useForm();

	// separate search text states
	const [complainantSearch, setComplainantSearch] = React.useState('');
	const [complaineeSearch, setComplaineeSearch] = React.useState('');

	// separate search results
	const [complainantSearchResults, setComplainantSearchResults] = React.useState([]);
	const [complaineeSearchResults, setComplaineeSearchResults] = React.useState([]);

	// loading flags
	const [complainantSearching, setComplainantSearching] = React.useState(false);
	const [complaineeSearching, setComplaineeSearching] = React.useState(false);

	// severity local state for validateStatus
	const [severity, setSeverity] = React.useState(
		(record?.tags?.severity && record.tags.severity.toLowerCase()) || 'minor'
	);

	// convenience watchers for current complainants/complainees values
	const complainants = Form.useWatch('complainants', form) || [];
	const complainees = Form.useWatch('complainees', form) || [];

	/**
	 * Fetch helper for students
	 */
	const fetchStudentResults = async (query, setLoading, setResults, controller) => {
		if (!query || query.length === 0) {
			setResults([]);
			return;
		};
		setLoading(true);
		try {
			const request = await authFetch(`${API_Route}/users/search/students/?q=${encodeURIComponent(query)}`, { signal: controller.signal });
			if (!request?.ok) {
				setLoading(false);
				return;
			}
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) {
				setLoading(false);
				return;
			}
			setResults(data.students);
			pushToCache('students', data.students, false);
		} catch (err) {
			// ignore abort/network errors
		} finally {
			setLoading(false);
		};
	};

	// debounced effects for complainant search
	React.useEffect(() => {
		const controller = new AbortController();
		if (!complainantSearch) {
			setComplainantSearchResults([]);
			return () => controller.abort();
		}
		const t = setTimeout(() => fetchStudentResults(complainantSearch, setComplainantSearching, setComplainantSearchResults, controller), 300);
		return () => {
			clearTimeout(t);
			controller.abort();
		};
	}, [complainantSearch]);

	// debounced effects for complainee search
	React.useEffect(() => {
		const controller = new AbortController();
		if (!complaineeSearch) {
			setComplaineeSearchResults([]);
			return () => controller.abort();
		}
		const t = setTimeout(() => fetchStudentResults(complaineeSearch, setComplaineeSearching, setComplaineeSearchResults, controller), 300);
		return () => {
			clearTimeout(t);
			controller.abort();
		};
	}, [complaineeSearch]);

	React.useEffect(() => {
		if (!record) return;

		const participantIds = [
			...(record.complainants?.map(c => c.id) || []),
			...(record.complainees?.map(c => c.id) || [])
		];

		// filter out students already cached
		const cachedIds = new Set((cache.students || []).map(s => s.id));
		const uncached = participantIds.filter(id => !cachedIds.has(id));

		if (uncached.length === 0) return;

		const controller = new AbortController();

		(async () => {
			try {
				const request = await authFetch(`${API_Route}/users/students/batch${uncached.length > 0 ? `?ids=${uncached.map(id => encodeURIComponent(id)).join(',')}` : ''}`, {
					signal: controller.signal
				});
				if (!request?.ok) return;
				const data = await request.json();
				if (Array.isArray(data.students)) {
					pushToCache('students', data.students, false);
				}
			} catch (err) {
				// ignore aborts
			}
		})();

		return () => controller.abort();
	}, [record]);

	return (
		<Form
			layout='vertical'
			ref={EditCaseForm}
			form={form}
			onFinish={() => { }}
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
					description: ''
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
						disabledDate={(current) => current && current.isAfter(dayjs())}
					/>
				</Form.Item>

				<Form.Item
					name='severity'
					label='Severity'
					rules={[{ required: true, message: 'Please select a severity!' }]}
					style={{ flex: 1 }}
					validateStatus={{
						minor: 'success',
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

				{/* Complainants - Form.List with AutoComplete to add */}
				<Flex gap={32} style={{ width: '100%' }}>
					<Form.List name='complainants'>
						{(fields, { add, remove }) => (
							<Flex vertical gap={8} style={{ flex: 1 }}>
								<Form.Item label='Complainants'>
									<AutoComplete
										placeholder='Search or enter complainant ID'
										options={complainantSearchResults
											.filter(student =>
												!complainees.includes(student.id) &&
												!complainants.includes(student.id)
											)
											.map(student => ({
												label: `${student.name.first} ${student.name.last} (${student.id})`,
												value: student.id
											}))
										}
										suffixIcon={complainantSearching ? <Spin size='small' /> : null}
										value={complainantSearch}
										onChange={(value) => setComplainantSearch(value)}
										onSelect={(value) => {
											// add selected value to the list
											add(value);
											setComplainantSearch('');
											setComplainantSearchResults([]);
										}}
										onBlur={() => {
											// manual entry on blur
											if (complainantSearch && !complainants.includes(complainantSearch)) {
												add(complainantSearch);
												setComplainantSearch('');
											}
										}}
										onKeyDown={(e) => {
											// Enter to add manual entry
											if (e.key === 'Enter' && complainantSearch && !complainants.includes(complainantSearch)) {
												e.preventDefault();
												add(complainantSearch);
												setComplainantSearch('');
											}
										}}
										style={{ width: '100%' }}
										filterOption={(input, option) =>
											option.label.toLowerCase().includes(input.toLowerCase())
										}
									/>
								</Form.Item>

								{fields.map(({ key, name, ...restField }) => (
									<Flex key={key} align='center' gap={8}>
										<Form.Item
											{...restField}
											name={name}
											rules={[{ required: true, message: 'Please select a complainant!' }]}
											style={{ flex: 1 }}
										>
											<Select
												placeholder='Select a complainant'
												showSearch
												optionFilterProp='label'
												filterOption={(input, option) =>
													option.label.toLowerCase().includes(input.toLowerCase())
												}
												options={(cache.students || [])
													.filter(student => !complainees.includes(student.id))
													.map(student => ({
														label: `${student.name.first} ${student.name.last} (${student.id})`,
														value: student.id
													}))}
											/>
										</Form.Item>
										<Form.Item>
											<Button
												icon={<MinusOutlined />}
												onClick={() => remove(name)}
											/>
										</Form.Item>
									</Flex>
								))}
							</Flex>
						)}
					</Form.List>

					{/* Complainees - Form.List with AutoComplete to add */}
					<Form.List name='complainees'>
						{(fields, { add, remove }) => (
							<Flex vertical gap={8} style={{ flex: 1 }}>
								<Form.Item label='Complainees (Accused)'>
									<AutoComplete
										placeholder='Search or enter complainee ID'
										options={complaineeSearchResults
											.filter(student =>
												!complainants.includes(student.id) &&
												!complainees.includes(student.id)
											)
											.map(student => ({
												label: `${student.name.first} ${student.name.last} (${student.id})`,
												value: student.id
											}))
										}
										suffixIcon={complaineeSearching ? <Spin size='small' /> : null}
										value={complaineeSearch}
										onChange={(value) => setComplaineeSearch(value)}
										onSelect={(value) => {
											add(value);
											setComplaineeSearch('');
											setComplaineeSearchResults([]);
										}}
										onBlur={() => {
											if (complaineeSearch && !complainees.includes(complaineeSearch)) {
												add(complaineeSearch);
												setComplaineeSearch('');
											}
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter' && complaineeSearch && !complainees.includes(complaineeSearch)) {
												e.preventDefault();
												add(complaineeSearch);
												setComplaineeSearch('');
											}
										}}
										style={{ width: '100%' }}
										filterOption={(input, option) =>
											option.label.toLowerCase().includes(input.toLowerCase())
										}
									/>
								</Form.Item>

								{fields.map(({ key, name, ...restField }) => (
									<Flex key={key} align='center' gap={8}>
										<Form.Item
											{...restField}
											name={name}
											rules={[{ required: true, message: 'Please select a complainee!' }]}
											style={{ flex: 1 }}
										>
											<Select
												placeholder='Select a complainee'
												showSearch
												optionFilterProp='label'
												filterOption={(input, option) =>
													option.label.toLowerCase().includes(input.toLowerCase())
												}
												options={(cache.students || [])
													.filter(student => !complainants.includes(student.id))
													.map(student => ({
														label: `${student.name.first} ${student.name.last} (${student.id})`,
														value: student.id
													}))}
											/>
										</Form.Item>
										<Form.Item>
											<Button
												icon={<MinusOutlined />}
												onClick={() => remove(name)}
											/>
										</Form.Item>
									</Flex>
								))}
							</Flex>
						)}
					</Form.List>
				</Flex>
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
			<CacheProvider>
				<CaseForm record={record} />
			</CacheProvider>
		),
		icon: <EditOutlined />,
		width: 1024,
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
						}

						const data = await request.json();
						if (setThisRecord)
							setThisRecord(data);

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

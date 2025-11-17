import React from 'react';
import dayjs from 'dayjs';

import {
	Form,
	Input,
	Upload,
	Select,
	Flex,
	Typography,
	Button,
	Spin,
	AutoComplete,
	DatePicker,
	List
} from 'antd';

import {
	BankOutlined,
	UploadOutlined,
	ScanOutlined,
	ClearOutlined,
	MinusCircleOutlined,
	MinusOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

/**
 * React ref for the NewCase form instance
 * @type {React.RefObject<import('antd').FormInstance>}
 */
const NewCaseForm = React.createRef();

import { API_Route } from '../main';
import { useCache, CacheProvider } from '../contexts/CacheContext';

import authFetch from '../utils/authFetch';

/**
 * CaseForm component for creating new disciplinary cases
 * Handles form input, student search, file uploads, and form validation
 * @component
 * @param {object} props
 * @param {any} props.message - Message API for displaying notifications
 * @param {object} [props.initialData] - Initial data for pre-filling the form
 * @returns {JSX.Element} The rendered form component
 */
const CaseForm = ({ message, initialData }) => {
	/**
	 * Cache context hook for managing student data
	 */
	const { pushToCache, getFromCache, cache } = useCache();
	const [form] = Form.useForm();

	/**
	 * Search query string for finding students
	 * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
	 */
	const [search, setSearch] = React.useState('');

	/**
	 * Search query string for complainants
	 * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
	 */
	const [complainantSearch, setComplainantSearch] = React.useState('');

	/**
	 * Search query string for complainees
	 * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
	 */
	const [complaineesSearch, setComplaineesSearch] = React.useState('');

	/**
	 * Array of complainant search results
	 * @type {[import('../classes/Student').StudentProps[], React.Dispatch<React.SetStateAction<import('../classes/Student').StudentProps[]>>]}
	 */
	const [complainantSearchResults, setComplainantSearchResults] = React.useState([]);

	/**
	 * Array of complainees search results
	 * @type {[import('../classes/Student').StudentProps[], React.Dispatch<React.SetStateAction<import('../classes/Student').StudentProps[]>>]}
	 */
	const [complaineesSearchResults, setComplaineesSearchResults] = React.useState([]);

	/**
	 * Loading state for complainant search operations
	 * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
	 */
	const [complainantSearching, setComplainantSearching] = React.useState(false);

	/**
	 * Loading state for complainees search operations
	 * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
	 */
	const [complaineesSearching, setComplaineesSearching] = React.useState(false);

	/**
	 * Helper function to fetch student search results
	 * @param {string} query - The search query
	 * @param {React.Dispatch<React.SetStateAction<boolean>>} setLoading - Loading state setter
	 * @param {React.Dispatch<React.SetStateAction<import('../classes/Student').StudentProps[]>>} setResults - Results setter
	 * @param {AbortController} controller - Abort controller for cancelling request
	 */
	const fetchStudentResults = async (query, setLoading, setResults, controller) => {
		if (query.length === 0) {
			setResults([]);
			return;
		};

		setLoading(true);
		const request = await authFetch(`${API_Route}/users/search/students?q=${encodeURIComponent(query)}`, { signal: controller.signal });
		if (!request?.ok) return;

		const data = await request.json();
		if (!data || !Array.isArray(data.students)) return;
		setResults(data.students);
		setLoading(false);
		pushToCache('students', data.students, false);
	};

	/**
	 * Effect hook to handle complainant search functionality
	 */
	React.useEffect(() => {
		const controller = new AbortController();
		fetchStudentResults(complainantSearch, setComplainantSearching, setComplainantSearchResults, controller);
		return () => controller.abort();
	}, [complainantSearch]);

	/**
	 * Effect hook to handle complainees search functionality
	 */
	React.useEffect(() => {
		const controller = new AbortController();
		fetchStudentResults(complaineesSearch, setComplaineesSearching, setComplaineesSearchResults, controller);
		return () => controller.abort();
	}, [complaineesSearch]);

	/**
	 * Current severity level of the case
	 * @type {[('minor'|'major'|'grave'), React.Dispatch<React.SetStateAction<('minor'|'major'|'grave')>>]}
	 */
	const [severity, setSeverity] = React.useState('minor');

	/**
	 * Array of complainant student IDs
	 * @type {string[]}
	 */
	const complainants = Form.useWatch('complainants', form);
	/**
	 * Array of complainee (accused) student IDs
	 * @type {string[]}
	 */
	const complainees = Form.useWatch('complainees', form);

	/**
	 * Normalizes file upload event to extract file list
	 * @param {any} e - Upload event or file array
	 * @returns {import('antd/es/upload/interface').UploadFile<any>[] | undefined} Normalized file list
	 */
	const normFile = (e) => {
		if (Array.isArray(e))
			return e;
		return e?.fileList;
	};

	const [scanning, setScanning] = React.useState(false);

	// Set initial data when provided
	React.useEffect(() => {
		if (initialData) {
			form.setFieldsValue({
				violation: initialData.violation || '',
				complainants: initialData.complainants || [],
				complainees: initialData.complainees || [],
				description: initialData.description || '',
				title: initialData.title || '',
				date: initialData.date ? dayjs(initialData.date) : dayjs(new Date()),
				severity: initialData.severity || '',
				files: initialData.files || []
			});
		}
	}, [initialData, form]);

	return (
		<Form
			layout='vertical'
			ref={NewCaseForm}
			form={form}
			onFinish={(values) => { }}
			initialValues={{
				violation: initialData?.violation || '',
				date: initialData?.date ? dayjs(initialData.date) : dayjs(new Date()),
				tags: {
					severity: initialData?.severity || '', // 'minor', 'major', 'grave'
				},
				complainants: initialData?.complainants || [],
				complainees: initialData?.complainees || [],
				description: initialData?.description || '',
				title: initialData?.title || '',
				files: initialData?.files || [] // Array of upload file objects
			}}
			style={{ width: '100%' }}
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
			disabled={scanning}
		>
			<Flex vertical gap={32} style={{ width: '100%' }}>
				<Flex gap={32} style={{ width: '100%' }}>
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
								format='MMMM DD, YYYY - hh:mm A'
								showTime
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
								grave: 'error'
							}[severity]}
						>
							<Select
								placeholder='Select severity'
								options={[
									{ label: 'Minor', value: 'minor' },
									{ label: 'Major', value: 'major' },
									{ label: 'Grave', value: 'grave' }
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
					</Flex>
					<Flex vertical gap={16}>
						<Form.Item
							name='files'
							label='Case Images'
							valuePropName='fileList.fileList'
							getValueFromEvent={normFile}
							style={{
								width: 256
							}}
						>
							<Upload.Dragger
								listType='picture'
								action='/upload.do'
								beforeUpload={() => false} // Prevent auto upload
								accept='image/*'
								multiple
								style={{
									width: 256
								}}
							>
								<Flex vertical justify='center' align='center' gap={8} style={{ minHeight: 100 }}>
									<UploadOutlined style={{ fontSize: 32 }} />
									<Title level={5} style={{ margin: 0 }}>
										Upload Case Images
									</Title>
									<Paragraph type='secondary' style={{ textAlign: 'center' }}>
										Open your Mobile App<br />
										or drag and drop files here.
									</Paragraph>
								</Flex>
							</Upload.Dragger>
						</Form.Item>
						<Flex justify='space-between' align='center' gap={8} style={{ width: '100%' }}>
							<Button
								type='primary'
								icon={<ScanOutlined />}
								block
								disabled={false}
								loading={scanning}
								onClick={() => new Promise(async (resolve) => {
									setScanning(true);
									/**
									 * @type {import('antd/es/upload/interface').UploadFile<any>[]}
									 */
									const files = NewCaseForm.current.getFieldValue('files') || [];
									const form = new FormData();
									for (const file of files)
										if (file.originFileObj)
											form.append('files', file.originFileObj);
									form.append('form', JSON.stringify({
										title: "string",
										violation: "'bullying' | 'cheating' | 'disruptive_behavior' | 'fraud' | 'gambling' | 'harassment' | 'improper_uniform' | 'littering' | 'plagiarism' | 'prohibited_items' | 'vandalism' | 'other'",
										date: "dateThour",
										severity: "'minor' | 'major' | 'grave'",
										description: "string"
									}));
									const scanResponse = await authFetch(`${API_Route}/ocr/process`, {
										method: 'POST',
										body: form
									}).catch(() => null);
									if (!scanResponse?.ok) {
										setScanning(false);
										NewCaseForm.current.setFields([{
											name: 'files',
											errors: ['Failed to scan and process images. Please try again.']
										}]);
										return;
									};
									/** @type {Record<string, string | number | boolean>} */
									const fillData = await scanResponse.json();
									if (fillData.title) NewCaseForm.current.setFieldValue('title', fillData.title);
									if (fillData.violation) NewCaseForm.current.setFieldValue('violation', fillData.violation);
									if (fillData.date) NewCaseForm.current.setFieldValue('date', dayjs(fillData.date));
									if (fillData.severity) {
										NewCaseForm.current.setFieldValue('severity', fillData.severity);
										setSeverity(fillData.severity);
									};
									if (fillData.description) NewCaseForm.current.setFieldValue('description', fillData.description);
									NewCaseForm.current.setFields([{
										name: 'files',
										errors: []
									}]);
									message.success('Successfully scanned and filled the form!');
									setScanning(false);
									resolve();
								})}
							>
								Scan
							</Button>
						</Flex>
					</Flex>
				</Flex>

				<Flex gap={32} style={{ width: '100%' }}>
					{/* Complainants */}
					<Form.List name='complainants'>
						{(fields, { add, remove }) => (
							<Flex vertical gap={8} style={{ flex: 1 }}>
								<Form.Item label='Complainants'>
									<AutoComplete
										placeholder='Search or enter complainant ID'
										options={complainantSearchResults
											.filter(student =>
												!complainees?.includes(student.id) &&
												!complainants?.includes(student.id)
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
											add(value);
											setComplainantSearch('');
											setComplainantSearchResults([]);
										}}
										onBlur={() => {
											if (complainantSearch && !complainants?.includes(complainantSearch)) {
												add(complainantSearch);
												setComplainantSearch('');
											};
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter' && complainantSearch && !complainants?.includes(complainantSearch)) {
												e.preventDefault();
												add(complainantSearch);
												setComplainantSearch('');
											};
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
												options={cache.students
													.filter(student => !complainees?.includes(student.id))
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

					{/* Complainees */}
					<Form.List name='complainees'>
						{(fields, { add, remove }) => (
							<Flex vertical gap={8} style={{ flex: 1 }}>
								<Form.Item label='Complainees (Accused)'>
									<AutoComplete
										placeholder='Search or enter complainee ID'
										options={complaineesSearchResults
											.filter(student =>
												!complainants?.includes(student.id) &&
												!complainees?.includes(student.id)
											)
											.map(student => ({
												label: `${student.name.first} ${student.name.last} (${student.id})`,
												value: student.id
											}))
										}
										suffixIcon={complaineesSearching ? <Spin size='small' /> : null}
										value={complaineesSearch}
										onChange={(value) => setComplaineesSearch(value)}
										onSelect={(value) => {
											add(value);
											setComplaineesSearch('');
											setComplaineesSearchResults([]);
										}}
										onBlur={() => {
											if (complaineesSearch && !complainees?.includes(complaineesSearch)) {
												add(complaineesSearch);
												setComplaineesSearch('');
											}
										}}
										onKeyDown={(e) => {
											if (e.key === 'Enter' && complaineesSearch && !complainees?.includes(complaineesSearch)) {
												e.preventDefault();
												add(complaineesSearch);
												setComplaineesSearch('');
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
												options={cache.students
													.filter(student => !complainants?.includes(student.id))
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
 * Creates and displays a modal dialog for creating new disciplinary cases
 * Handles form submission, file uploads, and validation
 * @async
 * @function
 * @param {import('antd').ModalStaticFunctions} Modal - Ant Design Modal API instance
 * @param {import('antd').MessageInstance} message - Ant Design Message API instance
 * @param {object} [initialData] - Initial data for pre-filling the form
 * @returns {Promise<void>} Promise that resolves when modal is closed
 * @example
 * // Usage in a component
 * import { Modal } from 'antd';
 * await NewCase(Modal, message, { violation: 'bullying', complainants: ['123'] });
 */
const NewCase = async (Modal, message, initialData = null) => {
	await Modal.info({
		title: initialData ? 'Create Record from Case' : 'Open a new Case',
		centered: true,
		closable: { 'aria-label': 'Close' },
		content: (
			<CacheProvider>
				<CaseForm message={message} initialData={initialData} />
			</CacheProvider>
		),
		icon: <BankOutlined />,
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
		okText: 'Submit',
		okButtonProps: {
			icon: <UploadOutlined />
		},
		/**
		 * Handles form submission when OK button is clicked
		 * Validates form fields, submits case data, and uploads files
		 * @returns {Promise<void>} Promise that resolves on successful submission
		 */
		onOk: () => {
			return new Promise((resolve, reject) => {
				NewCaseForm.current.validateFields()
					.then(async (values) => {
						// Process the form values here
						console.log('Form Values:', values);

						// Prepare data for submission (exclude files from main payload)
						/**
						 * @type {{
						 * 	files: {
						 * 		file: import('antd/es/upload/interface').UploadFile<any>;
						 * 		fileList: import('antd/es/upload/interface').UploadFile<any>[];
						 * 	};
						 * 	caseData: import('../classes/Record').RecordProps
						 * }}
						 */
						const { files, ...caseData } = values;

						const request = await authFetch(`${API_Route}/records`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								...caseData,
								// Convert to ISO string to preserve the selected date/time
								// Backend will parse this correctly as UTC
								date: values.date.toISOString()
							})
						});

						if (!request?.ok) {
							reject(new Error('Failed to submit the form. Please try again.'));
							return;
						};

						const data = await request.json();
						if (!data) {
							reject(new Error('No data returned from server'));
							return;
						};

						// Upload files if any
						if (files.fileList && files.fileList.length > 0) {
							const formData = new FormData();
							for (const file of files.fileList)
								if (file.originFileObj)
									formData.append('files', file.originFileObj);

							const uploadResponse = await authFetch(`${API_Route}/repositories/record/${data.id}/files`, {
								method: 'POST',
								body: formData
							});

							if (!uploadResponse.ok) {
								const errorData = await uploadResponse.json();
								reject(new Error(errorData.message || 'Case created but failed to upload files.'));
								return;
							};
						};

						// Reset the form after successful submission
						NewCaseForm.current.resetFields();
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
		/**
		 * Handles modal cancellation
		 * Resets form fields and closes the modal
		 * @returns {Promise<void>} Promise that resolves when cancellation is complete
		 */
		onCancel: () => {
			return new Promise((resolve) => {
				NewCaseForm.current.resetFields();
				resolve();
			});
		}
	});
};

export default NewCase;

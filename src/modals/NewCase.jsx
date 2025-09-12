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
	Image,
	Spin,
	DatePicker
} from 'antd';

import {
	BankOutlined,
	UploadOutlined,
	ScanOutlined,
	ClearOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const NewCaseForm = React.createRef();

import { API_Route } from '../main';
import { useCache, CacheContext } from '../contexts/CacheContext';

import authFetch from '../utils/authFetch';

const CaseForm = () => {
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
			pushToCache('peers', data.students, false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search]);

	const [file, setFile] = React.useState(null);
	const [severity, setSeverity] = React.useState('minor'); // 'minor', 'major', 'severe'

	const [complainants, setComplainants] = React.useState([]);
	const [complainees, setComplainees] = React.useState([]);

	return (
		<Form
			layout='vertical'
			ref={NewCaseForm}
			onFinish={(values) => { }}
			initialValues={{
				violations: [],
				date: dayjs(new Date()),
				tags: {
					severity: '', // 'minor', 'major', 'severe'
				},
				complainants: [],
				complainees: [],
				description: '',
				repository: []
			}}
			style={{ width: '100%' }}
			labelCol={{ span: 24 }}
			wrapperCol={{ span: 24 }}
		>
			<Flex gap={32}>
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
						name='violations'
						label='Violations'
						rules={[{ required: true, message: 'Please enter a violations!' }]}
					>
						<Select
							placeholder='Select a violations'
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
								{ label: 'Other', value: 'other' },
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
						name={['tags', 'severity']}
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
						rules={[{ required: true, message: 'Please enter complainants!' }]}
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
						rules={[{ required: true, message: 'Please enter complainees!' }]}
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

				<Flex vertical={!!file} gap={16}>
					<Upload.Dragger
						listType='picture'
						beforeUpload={(file) => {
							if (FileReader && file) {
								const reader = new FileReader();
								reader.onload = (e) => {
									setFile(e.target.result);
									NewCaseForm.current.setFieldsValue({
										repository: [e.target.result]
									});
								};
								reader.readAsDataURL(file);
							};
							return false;
						}} // Prevent auto upload
						showUploadList={false}
						style={{
							position: 'relative',
							width: 256,
							height: '100%'
						}}
						accept='.jpg,.jpeg,.png'
					>
						<Flex vertical justify='center' align='center' style={{ width: '100%', height: '100%' }} gap={8}>
							{file ? (
								<>
									<Image
										src={file}
										alt='Uploaded file preview'
										preview={false}
										style={{
											width: '100%',
											height: '100%',
											objectFit: 'cover',
											borderRadius: 'var(--border-radius)'
										}}
									/>
								</>
							) : (
								<>
									<UploadOutlined style={{ fontSize: 32 }} />
									<Title level={5} style={{ margin: 0 }}>
										Upload Case Image
									</Title>
									<Paragraph type='secondary' style={{ textAlign: 'center' }}>
										Open your Mobile App<br />
										or drag and drop a file here.
									</Paragraph>
								</>
							)}
						</Flex>
					</Upload.Dragger>

					{file && (
						<Flex justify='space-between' align='center' gap={8} style={{ width: '100%' }}>
							<Button
								type='default'
								icon={<ClearOutlined />}
								onClick={() => {
									setFile(null);
								}}
							>
								Clear
							</Button>
							<Button
								type='primary'
								icon={<ScanOutlined />}
								style={{ flexGrow: 1 }}
								onClick={() => { }}
							>
								Scan
							</Button>
						</Flex>
					)}
				</Flex>
			</Flex>
		</Form>
	);
};

const NewCase = async (Modal) => {
	Modal.info({
		title: 'Open a new Case',
		centered: true,
		closable: { 'aria-label': 'Close' },
		content: (
			<CacheContext.Provider value={{}}>
				<CaseForm />
			</CacheContext.Provider>
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
		onOk: () => {
			return new Promise((resolve, reject) => {
				NewCaseForm.current.validateFields()
					.then((values) => {
						// Process the form values here
						console.log('Form Values:', values);
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
		onCancel: () => {
			return new Promise((resolve) => {
				NewCaseForm.current.resetFields();
				resolve();
			});
		}
	});
};

export default NewCase;

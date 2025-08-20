import React from 'react';

import {
	Form,
	Upload,
	Input,
	Button,
	Typography,
	Flex,
	Card,
	Divider,
	Dropdown,
	Segmented
} from 'antd';

import {
	LeftOutlined,
	UploadOutlined,
	FontSizeOutlined,
	BoldOutlined,
	ItalicOutlined,
	UnderlineOutlined,
	StrikethroughOutlined,
	UnorderedListOutlined,
	OrderedListOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined
} from '@ant-design/icons';

import { marked } from 'marked';

const { Text, Paragraph, Title } = Typography;

import { OSASContext, MobileContext } from '../../../main';

/**
 * @typedef {{
 *   cover: String,
 *   title: String,
 *   description: String,
 *   editMode: Boolean,
 *   date: Date
 * }} Announcement
 */

const NewAnnouncement = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setHeader({
			title: 'Create a new Announcement',
			actions: [
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate(-1)}
				>
					Back
				</Button>
			]
		});
	}, [setHeader]);

	React.useEffect(() => {
		setSelectedKeys(['announcements']);
	}, [setSelectedKeys]);

	const { osas } = React.useContext(OSASContext);

	const { mobile } = React.useContext(MobileContext);

	const AnnouncementForm = React.useRef(null);
	const [cover, setCover] = React.useState('');
	const [mode, setMode] = React.useState('editing'); // editing | preview

	const InsertHeading = (level) => {
		const textArea = document.getElementById('text-area');
		if (!textArea) return;

		const start = textArea.selectionStart;
		const end = textArea.selectionEnd;
		const text = textArea.value;

		// find start of current line
		const lineStart = text.lastIndexOf('\n', start - 1) + 1;
		const lineEnd = text.indexOf('\n', start);
		const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;

		const currentLine = text.slice(lineStart, actualLineEnd);

		let newLine = currentLine;

		if (level === 'text') {
			// Remove heading if 'Normal'
			newLine = currentLine.replace(/^#{1,6}\s*/, '');
		} else {
			// Build heading prefix (##... + space)
			const hashes = '#'.repeat(Number(level.replace('h', '')));
			newLine = `${hashes} ${currentLine.replace(/^#{1,6}\s*/, '')}`;
		};

		const newText = text.slice(0, lineStart) + newLine + text.slice(actualLineEnd);

		// Update value
		AnnouncementForm.current.setFieldsValue({ description: newText });
		textArea.value = newText;

		// Restore selection
		const cursorShift = newLine.length - currentLine.length;
		textArea.setSelectionRange(start + cursorShift, end + cursorShift);

		textArea.focus();
	};
	const InsertBeforeAndAfter = (before, after) => {
		const textArea = document.getElementById('text-area');
		if (!textArea) return;

		const start = textArea.selectionStart;
		const end = textArea.selectionEnd;
		const text = textArea.value;

		const selected = text.slice(start, end);
		const newText = text.slice(0, start) + before + selected + after + text.slice(end);

		// Update value in form and textarea
		AnnouncementForm.current.setFieldsValue({ description: newText });
		textArea.value = newText;

		// Restore cursor/selection
		if (selected.length > 0)
			textArea.setSelectionRange(start + before.length, end + before.length);
		else
			textArea.setSelectionRange(start + before.length, start + before.length);

		textArea.focus();
	};
	const InsertList = (type) => {
		const textArea = document.getElementById('text-area');
		if (!textArea) return;

		const start = textArea.selectionStart;
		const end = textArea.selectionEnd;
		const text = textArea.value;

		// Find start and end line boundaries
		const lineStart = text.lastIndexOf('\n', start - 1) + 1;
		const lineEnd = text.indexOf('\n', end);
		const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;

		const selectedText = text.slice(lineStart, actualLineEnd);
		const lines = selectedText.split('\n');

		let newLines = [];

		if (type === 'ul')
			newLines = lines.map(line => line.replace(/^(\s*)([-*+] )?/, '$1- '));
		else if (type === 'ol')
			newLines = lines.map((line, i) => line.replace(/^(\s*)(\d+\. )?/, `$1${i + 1}. `));
		else if (type === 'indent')
			newLines = lines.map(line => '    ' + line); // add 4 spaces
		else if (type === 'outdent')
			newLines = lines.map(line => line.replace(/^ {1,4}/, '')); // remove up to 4 spaces

		const newText = text.slice(0, lineStart) + newLines.join('\n') + text.slice(actualLineEnd);

		// Update
		AnnouncementForm.current.setFieldsValue({ description: newText });
		textArea.value = newText;

		// Restore selection (expand/shrink depending on added text)
		const diff = newText.length - text.length;
		textArea.setSelectionRange(start, end + diff);

		textArea.focus();
	};

	return (
		<Flex vertical gap={16}>
			<Card>
				{mode === 'editing' && (
					<Upload.Dragger
						listType='picture'
						beforeUpload={(file) => {
							if (FileReader && file) {
								const reader = new FileReader();
								reader.onload = (e) => {
									setCover(e.target.result);
									AnnouncementForm.current.setFieldsValue({
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
							width: '100%',
							height: 256
						}}
						accept='.jpg,.jpeg,.png'
					>
						{cover ? (
							<img
								src={cover}
								alt='Uploaded file preview'
								preview={false}
								style={{
									width: '100%',
									height: 256,
									objectFit: 'cover',
									borderRadius: 'var(--border-radius)'
								}}
							/>
						) : (
							<>
								<UploadOutlined style={{ fontSize: 32 }} />
								<Title level={5} style={{ margin: 0 }}>
									Upload Cover Image
								</Title>
								<Paragraph type='secondary' style={{ textAlign: 'center' }}>
									Click or drag and drop a file here.
								</Paragraph>
							</>
						)}
					</Upload.Dragger>
				)}
				{mode === 'preview' && cover && (
					<img
						src={cover}
						alt='Uploaded file preview'
						style={{
							width: '100%',
							height: 256,
							objectFit: 'cover',
							borderRadius: 'var(--border-radius)'
						}}
					/>
				)}
			</Card>

			<Card>
				<Flex vertical gap={16}>
					<Form
						ref={AnnouncementForm}
						layout='vertical'
						initialValues={{
							title: '',
							description: ''
						}}
					>
						{mode === 'editing' && (
							<Flex vertical gap={16}>
								<Form.Item
									name='title'
									rules={[{ required: true, message: 'Please enter a title' }]}
								>
									<Input placeholder='Title' />
								</Form.Item>
								<Flex justify='center' align='center' wrap gap={16}>
									<Dropdown
										menu={{
											items: [
												{ label: <h1>Heading 1</h1>, key: 'h1' },
												{ label: <h2>Heading 2</h2>, key: 'h2' },
												{ label: <h3>Heading 3</h3>, key: 'h3' },
												{ label: <h4>Heading 4</h4>, key: 'h4' },
												{ label: <h5>Heading 5</h5>, key: 'h5' },
												{ label: <p>Normal</p>, key: 'text' }
											],
											onClick: ({ key }) => { InsertHeading(key) }
										}}
									>
										<Button size='small' icon={<FontSizeOutlined />} />
									</Dropdown>
									<Divider type='vertical' />
									<Flex justify='center' align='center' gap={8}>
										<Button size='small' icon={<BoldOutlined />} onClick={() => InsertBeforeAndAfter('**', '**')} />
										<Button size='small' icon={<ItalicOutlined />} onClick={() => InsertBeforeAndAfter('*', '*')} />
										<Button size='small' icon={<UnderlineOutlined />} onClick={() => InsertBeforeAndAfter('<u>', '</u>')} />
										<Button size='small' icon={<StrikethroughOutlined />} onClick={() => InsertBeforeAndAfter('~~', '~~')} />
									</Flex>
									<Divider type='vertical' />
									<Flex justify='center' align='center' gap={8}>
										<Button size='small' icon={<UnorderedListOutlined />} onClick={() => InsertList('ul')} />
										<Button size='small' icon={<OrderedListOutlined />} onClick={() => InsertList('ol')} />
										<Button size='small' icon={<MenuFoldOutlined />} onClick={() => InsertList('indent')} />
										<Button size='small' icon={<MenuUnfoldOutlined />} onClick={() => InsertList('outdent')} />
									</Flex>
								</Flex>
								<Form.Item
									name='description'
									rules={[{ required: true, message: 'Please enter a description' }]}
								>
									<Input.TextArea id='text-area' rows={8} count={{ show: true, max: 4096 }} placeholder='Announcement' />
								</Form.Item>
							</Flex>
						)}
						{mode === 'preview' && (
							<div>
								<h1>{AnnouncementForm.current.getFieldValue('title')}</h1>
								<div
									style={{ padding: 16 }}
									dangerouslySetInnerHTML={{ __html: `<div>${marked.parse(AnnouncementForm.current.getFieldValue('description'))}</div>` }}
								/>
							</div>
						)}
					</Form>



					<Flex justify='flex-end' align='center' gap={16}>
						<Segmented
							options={[
								{ label: 'Edit', value: 'editing' },
								{ label: 'Preview', value: 'preview' }
							]}
							value={mode}
							onChange={setMode}
						/>
						<Button type='default'>
							Cancel
						</Button>
						<Button type='primary' htmlType='submit'>
							Create Announcement
						</Button>
					</Flex>
				</Flex>
			</Card>
		</Flex>
	);
};

export default NewAnnouncement;
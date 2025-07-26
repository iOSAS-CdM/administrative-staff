import React from 'react';
import { useLocation } from 'react-router';
import moment from 'moment';

import {
	Card,
	Button,
	Flex,
	Row,
	Col,
	Avatar,
	Typography,
	Calendar,
	App,
	Image
} from 'antd';

import {
	EditOutlined,
	LockOutlined,
	LeftOutlined,
	PlusOutlined,
	BellOutlined,
	FileAddOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import remToPx from '../../../utils/remToPx';

import PanelCard from '../../../components/PanelCard';

const Organization = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	const location = useLocation();

	/** @type {[import('../../../classes/Organization').Organization, React.Dispatch<React.SetStateAction<import('../../../classes/Organization')>>]} */
	const [thisOrganization, setThisOrganization] = React.useState(location.state?.organization || {
		id: 'org-1',
		shortName: 'Org 1',
		fullName: 'Organization One',
		description: 'This is a sample organization.',
		email: 'org1@example.com',
		logo: '/Placeholder Image.svg',
		cover: '/Placeholder Image.svg',
		status: 'active',
		type: 'college-wide',
		members: []
	});

	React.useEffect(() => {
		setHeader({
			title: `Student Organization ${thisOrganization.id || ''}`,
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
		setSelectedKeys(['organizations']);
	}, [setSelectedKeys]);

	const [repository, setRepository] = React.useState([]);
	React.useEffect(() => {
		if (thisOrganization.placeholder) {
			setRepository([]);
		} else {
			setRepository([
				{
					name: 'Document 1',
					extension: 'pdf',
					id: 'doc-1',
					thumbnail: '/Placeholder Image.svg'
				},
				{
					name: 'Document 2',
					extension: 'pdf',
					id: 'doc-2',
					thumbnail: '/Placeholder Image.svg'
				},
				{
					name: 'Image 1',
					extension: 'jpg',
					id: 'img-1',
					thumbnail: '/Placeholder Image.svg'
				},
				{
					name: 'Image 2',
					extension: 'png',
					id: 'img-2',
					thumbnail: '/Placeholder Image.svg'
				}
			]);
		};
	}, [thisOrganization]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex
			vertical
			gap={16}
		>
			<Row gutter={[16, 16]}>
				{!mobile ? (
					<Col span={24}>
						<Card
							cover={
								<Image
									src={thisOrganization.cover || '/Placeholder Image.svg'}
									alt={`${thisOrganization.shortName} Cover`}
									style={{ aspectRatio: '6/1', objectFit: 'cover' }}
								/>
							}
						>
							<Flex justify='flex-start' align='flex-end' gap={16} style={{ width: '100%' }}>
								<Flex
									style={{
										position: 'relative',
										width: remToPx(20),
										height: '100%'
									}}
								>
									<Avatar
										src={thisOrganization.logo}
										size='large'
										shape='square'
										style={{
											position: 'absolute',
											width: remToPx(20),
											height: remToPx(20),
											bottom: 0,
											border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
										}}
									/>
								</Flex>
								<Flex vertical justify='center' align='flex-start' gap={4} style={{ flex: 1, }}>
									<Title level={1}>{thisOrganization.shortName}</Title>
									<Title level={5}>{thisOrganization.fullName}</Title>
								</Flex>
								<Flex justify='flex-end' align='center' gap={8} style={{ height: '100%' }}>
									<Button
										type='primary'
										icon={<EditOutlined />}
									>
										Edit
									</Button>
									<Button
										type='primary'
										danger
										icon={<LockOutlined />}
									>
										Restrict
									</Button>
								</Flex>
							</Flex>
						</Card>
					</Col>
				) : (
					<Col span={24}>
						<Card
							cover={
								<Image
									src={thisOrganization.cover || '/Placeholder Image.svg'}
									alt={`${thisOrganization.shortName} Cover`}
									style={{ aspectRatio: '2/1', objectFit: 'cover' }}
								/>
							}
						>
							<Flex vertical justify='flex-start' align='center' gap={16}>
								<Flex
									justify='center'
									align='center'
									gap={16}
									style={{
										position: 'relative',
										width: '100%',
										height: '100%'
									}}
								>
									<Avatar
										src={thisOrganization.logo}
										size='large'
										shape='square'
										style={{
											position: 'absolute',
											width: remToPx(20),
											height: remToPx(20),
											bottom: 0,
											border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
										}}
									/>
								</Flex>
								<Flex vertical justify='flex-start' align='center' gap={4} style={{ flex: 1, }}>
									<Title level={1}>{thisOrganization.shortName}</Title>
									<Title level={5}>{thisOrganization.fullName}</Title>
								</Flex>
								<Flex justify='flex-end' align='center' gap={8} style={{ height: '100%' }}>
									<Button
										type='primary'
										icon={<EditOutlined />}
									>
										Edit
									</Button>
									<Button
										type='primary'
										danger
										icon={<LockOutlined />}
									>
										Restrict
									</Button>
								</Flex>
							</Flex>
						</Card>
					</Col>
				)}

				<Col span={mobile? 24 : 8}>
					<PanelCard
						title='Members'
						contentMaxHeight={remToPx(32)}
						footer={
							<Flex justify='flex-end' align='center' gap={8}>
								<Button
									type='default'
									size='small'
									icon={<BellOutlined />}
									onClick={() => { }}
								>
									Summon
								</Button>
								<Button
									type='primary'
									size='small'
									icon={<PlusOutlined />}
									onClick={() => { }}
								>
									Add
								</Button>
							</Flex>
						}
					>
						{thisOrganization.members.map((member, index) => (
							<Card key={index} size='small' style={{ width: '100%' }}>
								<Flex justify='flex-start' align='center' gap={16}>
									<Avatar
										src={member.profilePicture || '/Placeholder Image.svg'}
										size='large'
										style={{
											border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
										}}
									/>
									<Flex vertical justify='flex-start' align='flex-start'>
										<Title level={5}>{member.student.name.first} {member.student.name.middle} {member.student.name.last}</Title>
										<Text type='secondary'>{member.role}</Text>
									</Flex>
								</Flex>
							</Card>
						))}
					</PanelCard>
				</Col>
				<Col span={mobile? 24 : 8}>
					<PanelCard
						title='Repository'
						contentMaxHeight={remToPx(32)}
						footer={
							<Flex justify='flex-end' align='center' gap={8}>
								<Button
									type='default'
									size='small'
									icon={<FileAddOutlined />}
									onClick={() => { }}
								>
									Generate Form
								</Button>
								<Button
									type='primary'
									size='small'
									icon={<PlusOutlined />}
									onClick={() => { }}
								>
									Add
								</Button>
							</Flex>
						}
					>
						{repository.map((file, i) => (
							<Card
								key={file.id || i}
								size='small'
								style={{ width: '100%' }}
								onClick={() => { }}
							>
								<Flex align='center' gap={8}>
									<Avatar src={file.thumbnail} size='large' shape='square' />
									<Flex vertical>
										<Text>{file.name}</Text>
										<Text type='secondary'>{file.extension.toUpperCase()}</Text>
									</Flex>
								</Flex>
							</Card>
						))}
					</PanelCard>
				</Col>
				<Col span={mobile? 24 : 8}>
					<PanelCard title='Calendar'>
						<Calendar
							style={{ width: '100%' }}
							fullscreen={false}
						/>
					</PanelCard>
				</Col>
			</Row>
		</Flex>
	);
};

export default Organization;


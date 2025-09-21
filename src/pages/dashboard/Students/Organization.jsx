import React from 'react';
import { useNavigate, useParams } from 'react-router';

import {
	Card,
	Button,
	Flex,
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

import PanelCard from '../../../components/PanelCard';

import { OSASContext } from '../../../main';
import { useMobile } from '../../../contexts/MobileContext';

/**
 * @type {React.FC<{
 * 	setHeader: (header: any) => void,
 * 	setSelectedKeys: (keys: string[]) => void
 * }>}
 */
const Organization = ({ setHeader, setSelectedKeys }) => {
	const navigate = useNavigate();

	const isMobile = useMobile();
	const { osas } = React.useContext(OSASContext);

	const { id } = useParams();

	/** @type {[import('../../../classes/Organization').Organization, React.Dispatch<React.SetStateAction<import('../../../classes/Organization')>>]} */
	const [thisOrganization, setThisOrganization] = React.useState({
		placeholder: true,
		id: '',
		shortName: '',
		fullName: '',
		description: '',
		email: '',
		logo: '',
		cover: '',
		status: '',
		type: '',
		members: []
	});
	React.useEffect(() => {
		if (!id) return;
		const organization = osas.organizations.find(o => o.id === id);
		if (organization)
			setThisOrganization(organization);
	}, [id, osas.organizations]);

	React.useLayoutEffect(() => {
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
			return;
		};
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
	}, [thisOrganization]);

	const app = App.useApp();
	const Modal = app.modal;

	return (
		<Flex
			vertical
			gap={16}
		>
			<Flex gap={16} align='stretch' style={{ width: '100%' }}>
				<Flex vertical gap={16} style={{ width: '100%' }}>
					<Card
						cover={
							<Image
								src={thisOrganization.cover || '/Placeholder Image.svg'}
								alt={`${thisOrganization.shortName} Cover`}
								style={{ borderRadius: 'var(--ant-border-radius-outer)', aspectRatio: isMobile ? '2/1' : '6/1', objectFit: 'cover', overflow: 'hidden' }}
							/>
						}
					>
						{!isMobile ? (
							<Flex justify='flex-start' align='flex-end' gap={16} style={{ width: '100%' }}>
								<Flex
									style={{
										position: 'relative',
										width: 256, // 2^8
										height: '100%'
									}}
								>
									<Avatar
										src={thisOrganization.logo}
										size='large'
										shape='square'
										style={{
											position: 'absolute',
											width: 256, // 2^8
											height: 256, // 2^8
											bottom: 0,
											border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
										}}
									/>
								</Flex>
								<Flex vertical justify='center' align='flex-start' style={{ flex: 1, }}>
									<Title level={1}>{thisOrganization.shortName}</Title>
									<Title level={5}>{thisOrganization.fullName}</Title>
									<Text type='secondary'>{thisOrganization.description}</Text>
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
						) : (
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
											width: 128, // 2^7
											height: 128, // 2^7
											bottom: 0,
											border: 'var(--ant-line-width) var(--ant-line-type) var(--ant-color-border-secondary)'
										}}
									/>
								</Flex>
									<Flex vertical justify='flex-start' align='center' style={{ flex: 1, }}>
										<Title level={1}>{thisOrganization.shortName}</Title>
										<Title level={5}>{thisOrganization.fullName}</Title>
										<Text type='secondary'>{thisOrganization.description}</Text>
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
						)}
					</Card>
					<Flex vertical={isMobile} gap={16} style={{ width: '100%', height: '100%' }}>
						<div
							style={{ width: '100%', height: '100%', order: isMobile ? '2' : '' }}
						>
							<PanelCard
								title='Members'
								style={{ position: 'sticky', top: 0 }}
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
								{thisOrganization.members.length > 0 && thisOrganization.members.map((member, index) => (
									<Card
										key={index}
										size='small'
										hoverable
										style={{ width: '100%' }}
										onClick={() => {
											navigate(`/dashboard/students/profile/${member.student.id}`, {
												state: { id: member.student.id }
											});
										}}
									>
										<Flex justify='flex-start' align='center' gap={16}>
											<Avatar
												src={member.student.profilePicture || '/Placeholder Image.svg'}
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
						</div>
						<div
							style={{ width: '100%', height: '100%', order: isMobile ? '1' : '' }}
						>
							<PanelCard title='Calendar' style={{ position: 'sticky', top: 0 }}>
								<Calendar
									style={{ width: '100%' }}
									fullscreen={false}
								/>
							</PanelCard>
						</div>
					</Flex>
				</Flex>
			</Flex>
			<PanelCard
				title='Repository'
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
				{repository.length > 0 && repository.map((file, i) => (
					<Card
						key={file.id || i}
						size='small'
						hoverable
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
		</Flex>
	);
};

export default Organization;


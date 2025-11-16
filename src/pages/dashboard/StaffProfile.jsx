import React from 'react';
import { useNavigate } from 'react-router';

import {
	Card,
	Flex,
	Avatar,
	Typography,
	Skeleton,
	Row,
	Col,
	Space
} from 'antd';

import {
	UserOutlined,
	MailOutlined,
	IdcardOutlined,
	SafetyOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

import { useMobile } from '../../contexts/MobileContext';
import { usePageProps } from '../../contexts/PagePropsContext';

/**
 * @type {React.FC}
 */
const StaffProfile = () => {
	const isMobile = useMobile();
	const { setHeader, setSelectedKeys, staff } = usePageProps();
	const navigate = useNavigate();

	React.useEffect(() => {
		setHeader({
			title: 'My Profile',
			actions: []
		});
		setSelectedKeys(['profile']);
	}, []);

	const roleLabels = {
		'head': 'Head',
		'guidance': 'Guidance Officer',
		'prefect': 'Prefect of Discipline Officer',
		'student-affairs': 'Student Affairs Officer'
	};

	if (!staff) return <Skeleton active />;

	return (
		<Flex vertical gap={16}>
			<Card style={{ width: '100%' }}>
				<Flex vertical gap={16} align='center'>
					<Avatar
						size={isMobile ? 128 : 246}
						icon={<UserOutlined />}
						src={staff.profilePicture}
						shape='square'
					/>
					<Title level={isMobile ? 3 : 2}>{staff.name.first} {staff.name.last}</Title>
					<Row gutter={[16, 16]} justify='center'>
						<Col>
							<Space>
								<IdcardOutlined />
								<Text>{staff.id}</Text>
							</Space>
						</Col>
						<Col>
							<Space>
								<MailOutlined />
								<Text>{staff.email}</Text>
							</Space>
						</Col>
						<Col>
							<Space>
								<SafetyOutlined />
								<Text>{roleLabels[staff.role]}</Text>
							</Space>
						</Col>
					</Row>
				</Flex>
			</Card>
		</Flex>
	);
};

export default StaffProfile;

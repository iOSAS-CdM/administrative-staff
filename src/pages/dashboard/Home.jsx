import React from 'react';
import { useNavigate } from 'react-router';

import {
	Button,
	Typography,
	Card,
	Flex,
	Row,
	Col
} from 'antd';

const { Title, Text } = Typography;

import Menubar from '../../Components/Menubar';

const Home = ({ setHeader, staff }) => {
	React.useEffect(() => {
		if (setHeader)
			setHeader({
				title: 'Dashboard',
				actions: null
			});
	}, [setHeader]);

	return (
		<Flex
			vertical
			gap='small'
		>
			<Row gutter={[16, 16]}>
				<Col span={18}>
					<Card size='small'>
						<Text>Content for card 1</Text>
					</Card>
				</Col>
				<Col span={6}>
					<Card size='small'>
						<Text>Content for card 2</Text>
					</Card>
				</Col>
			</Row>
		</Flex>
	);
};

export default Home;
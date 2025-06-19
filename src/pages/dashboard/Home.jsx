import React from 'react';
import { useNavigate } from 'react-router';

import { Button, Typography } from 'antd';

const { Title, Text } = Typography;

import Menubar from '../../Components/Menubar';

const Home = () => {

	return (
		<Menubar
			Title={<Title level={2}>Dashboard</Title>}
		></Menubar>
	);
};

export default Home;
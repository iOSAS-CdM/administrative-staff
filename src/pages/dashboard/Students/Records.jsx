import React from 'react';
import { useLocation } from 'react-router';

import {
	App,
	Form,
	Input,
	Card,
	Button,
	Segmented,
	Dropdown,
	Flex,
	Empty,
	Row,
	Col,
	Avatar,
	Typography
} from 'antd';

import {
	LeftOutlined
} from '@ant-design/icons';

const StudentRecords = ({ setHeader, setSelectedKeys, mobile, navigate }) => {
	const location = useLocation();

	React.useEffect(() => {
		setHeader({
			title: `Student ${location.state?.student?.studentId || 'Records'}`,
			actions: (
				<Button
					type='primary'
					icon={<LeftOutlined />}
					onClick={() => navigate(-1)}
				>
					Back
				</Button>
			)
		});
	}, [setHeader]);

	React.useEffect(() => {
		setSelectedKeys(['records']);
	}, [setSelectedKeys]);

	const [thisStudent, setThisStudent] = React.useState(location.state?.student || {});

	return (
		<div>
			{/* Render student records here */}
			<h1>Student Records for {thisStudent.name?.first} {thisStudent.name?.last}</h1>
			{/* Additional content can be added here */}
		</div>
	);
};

export default StudentRecords;
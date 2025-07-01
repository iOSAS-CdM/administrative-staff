import React from 'react';
import { useNavigate, Routes, Route, useLocation, useRoutes } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import {
	Card,
	Flex,
	Avatar,
	Typography,
	Button,
	Menu,
	Divider
} from 'antd';

import {
	HomeOutlined,
	NotificationOutlined,
	LeftOutlined,
	RightOutlined,
	LogoutOutlined,
	SmileOutlined,
	ToolOutlined,
	RobotOutlined,
	UserOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const ItemCard = ({ mounted, ...props }) => {
	return (
		<Card
			{...props}
			size='small'
			hoverable
			className={`card ${mounted && 'mounted'}`}
			actions={null}
		>
			<Flex vertical gap={16}>
				{props.children}

				{props.actions && (
					<Flex vertical gap={8}>
						<Divider />

						<Flex justify='space-between' align='center'>
							{props.actions.map((action, index) => (
								<div key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', flexGrow: 1 }}>
									{
										action.onClick ? (
											<Button
												type='text'
												size='small'
												style={{ width: '100%' }}
												onClick={typeof action.onClick === 'function' ? action.onClick : undefined}
											>
												{action.content}
											</Button>
										) : (
											<div style={{
												display: 'flex',
												alignItems: 'center',
												width: '100%',
												justifyContent: 'center'
											}}>{action.content}</div>
										)
									}

									{index < props.actions.length - 1 && (
										<Divider type='vertical' />
									)}
								</div>
							))}
						</Flex>
					</Flex>
				)}
			</Flex>
		</Card>
	);
};

export default ItemCard;
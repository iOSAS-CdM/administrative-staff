import React from 'react';
import { useNavigate, Routes, Route, useLocation, useRoutes } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';

import {
	Card,
	Flex,
	Button,
	Divider
} from 'antd';

const ItemCard = ({ mounted, status, ...props }) => {
	return (
		<Card
			{...props}
			size='small'
			hoverable
			className={`card ${mounted && 'mounted'} ${(status && mounted) && status} ${props.className || ''}`}
			actions={null}
			style={{
				...props.style,
				height: '100%'
			}}
		>
			<Flex vertical gap={16}>
				{props.children}

				{props.actions && (
					<Flex vertical gap={8}>
						<Divider />

						<Flex justify='space-between' align='center'>
							{props.actions.map((action, index) => (
								<div key={Math.random().toString(36).substring(2, 15)} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', flexGrow: 1 }}>
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
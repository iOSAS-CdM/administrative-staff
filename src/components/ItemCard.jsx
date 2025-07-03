import React from 'react';

import {
	Card,
	Flex,
	Button,
	Divider
} from 'antd';

/**
 * @param {{
 * 	mounted: Boolean,
 *	loading: Boolean,
 * 	extra: React.ReactNode,
 * 	status: String,
 * 	actions: {
 * 		content: React.ReactNode,
 * 		onClick?: Function
 * 	}[],
 * 	children: React.ReactNode,
 * 	style?: React.CSSProperties,
 * 	className?: String,
 * 	...props: React.HTMLAttributes<HTMLDivElement>
 * }} param0
 * @returns {JSX.Element}
 */
const ItemCard = ({
	mounted,
	loading,
	extra,
	status,
	actions,
	children,
	...props
}) => {
	return (
		<Card
			{...props}
			loading={loading}
			size='small'
			hoverable
			className={`card ${mounted && 'mounted'} ${(status && mounted) && status} ${props.className || ''}`}
			actions={null}
			extra={extra}
			style={{
				...props.style,
				height: '100%'
			}}
		>
			<Flex vertical gap={16}>
				{children}

				{actions && (
					<Flex vertical gap={8}>
						<Divider />

						<Flex justify='space-between' align='center'>
							{actions.map((action, index) => (
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

									{index < actions.length - 1 && (
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
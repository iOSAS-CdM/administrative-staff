import React from 'react';

import {
	Card,
	Flex,
	Button,
	Divider
} from 'antd';

 /**
  * @typedef {{
  * 	content: React.ReactNode,
  * 	onClick?: Function
  * }} ItemCardActionButton
  */

/**
* @typedef {{
* 	content: React.ReactNode,
* 	align?: 'left' | 'center' | 'right'
* }} ItemCardAction
 */

/**
 * @typedef {{
 * 	mounted: Boolean,
 *	loading: Boolean,
 * 	extra: React.ReactNode,
 * 	status: String,
 * 	children: React.ReactNode,
 * 	style?: React.CSSProperties,
 * 	className?: String
 * } & import('antd/es/card').CardInterface} ItemCardBaseProps
 */

/**
 * @param {ItemCardBaseProps} param0
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
				height: '100%',
				overflow: 'hidden'
			}}
		>
			<Flex vertical gap={16}>
				{children}

				{actions && (
					<Flex vertical gap={8}>
						<Divider />

						<Flex justify='space-between' align='center'>
							{actions.map((action, index) => (
								<>
									{
										action.onClick ? (
											<Button
												key={`action-${index}`}
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
													justifyContent: action.align || 'center',
													textAlign: action.align || 'center'
											}}>{action.content}</div>
										)
									}
									{index < actions.length - 1 && (
										<Divider type='vertical' key={`divider-${index}`} />
									)}
								</>
							))}
						</Flex>
					</Flex>
				)}
			</Flex>
		</Card>
	);
};

export default ItemCard;
import React from 'react';

import {
	Card,
	Flex,
	Button,
	Divider
} from 'antd';

 /**
  * @typedef {{
  * 	content: React.ReactNode;
  * 	icon: React.ReactNode;
  * 	type: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  * 	danger?: boolean;
  * 	onClick?: Function;
  * }} ItemCardActionButton
  */

/**
* @typedef {{
* 	content: React.ReactNode;
* 	align?: 'left' | 'center' | 'right';
* }} ItemCardAction
 */

/**
 * @typedef {{
 *	loading: Boolean;
 * 	title: React.ReactNode;
 * 	extra: React.ReactNode;
 * 	status: String;
 * 	children: React.ReactNode;
 * 	style?: React.CSSProperties;
 * 	className?: String;
 * } & import('antd/es/card').CardInterface} ItemCardBaseProps
 */

/**
 * @param {ItemCardBaseProps} props
 */
const ItemCard = ({
	loading,
	title,
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
			className={`card ${status} ${props.className || ''}`}
			actions={null}
			title={title}
			extra={null}
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

						<Flex justify='space-between' align='center' gap={16}>
							{(() => {
								const toReturn = [];

								for (let i = 0; i < actions.length; i++) {
									const action = actions[i];

									if (action.onClick) {
										toReturn.push(
											<Button
												key={`action-${i}`}
												type={action.type || 'text'}
												size='small'
												danger={action.danger}
												style={{ width: '100%' }}
												icon={action.icon}
												onClick={typeof action.onClick === 'function' ? action.onClick : undefined}
											>
												{action.content}
											</Button>
										);
									} else {
										toReturn.push(
											<div
												key={`action-${i}`}
												style={{
													display: 'flex',
													alignItems: 'center',
													width: '100%',
													justifyContent: action.align || 'center',
													textAlign: action.align || 'center'
												}}
											>
												{action.content}
											</div>
										);
									};

									if (i < actions.length - 1)
										toReturn.push(<Divider type='vertical' key={`divider-${i}`} />);
								};
								return toReturn;
							})()}
						</Flex>
					</Flex>
				)}
			</Flex>
		</Card>
	);
};

export default ItemCard;
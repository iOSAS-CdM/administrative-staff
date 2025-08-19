import React from 'react';

import { Card, Flex, Empty, Button } from 'antd';

import { MinusOutlined, CaretDownOutlined } from '@ant-design/icons';

/**
 * @param {{
 * 	title: String,
 * 	footer?: React.ReactNode,
 * 	children?: React.ReactNode,
 * 	contentMaxHeight?: String | Number
 * } & import('antd/es/card').CardInterface} props
 * @returns {JSX.Element}
 */
const PanelCard = ({
	title,
	footer,
	children,
	contentMaxHeight,
	...props
}) => {
	const [collapsed, setColapsed] = React.useState(false);

	return (
		<Card
			title={title}
			size='small'
			className='panel-card'
			extra={
				<Button
					type='secondary'
					size='small'
					icon={collapsed ? <CaretDownOutlined /> : <MinusOutlined />}
					onClick={() => { setColapsed(!collapsed) }}
				/>
			}
			{...props}
			style={{
				flex: 1,
				display: 'flex',
				maxHeight: collapsed ? 32 : 1024,
				overflowY: 'hidden',
				...props.style
			}}
			onClick={(e) => {
				if (e.target.classList.contains('ant-card-head') || e.target.classList.contains('ant-card-head-title'))
					setColapsed(!collapsed);
			}}
		>
			<Flex vertical gap={8} style={{ position: 'relative' }}>
				<Flex vertical gap={8} style={{ flex: 1, minHeight: 128 }}>
					{children || (
						<Empty description='No content found' style={{ position: 'absolute', height: 128, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
					)}
				</Flex>

				{footer}
			</Flex>
		</Card>
	);
};

export default PanelCard;
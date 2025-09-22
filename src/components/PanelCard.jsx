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
	contentMaxHeight = 512,
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
				position: 'relative',
				flex: 1,
				display: 'flex',
				maxHeight: collapsed ? 32 : contentMaxHeight,
				overflowY: 'hidden',
				transition: 'max-height var(--transition)',
				...props.style
			}}
			styles={{
				body: {
					overflowY: 'auto'
				}
			}}
			onClick={(e) => {
				if (e.target.classList.contains('ant-card-head') || e.target.classList.contains('ant-card-head-title'))
					setColapsed(!collapsed);
			}}
			actions={[footer]}
		>
			<Flex vertical gap={8} style={{ position: 'relative' }}>
				<Flex vertical gap={8} style={{ flex: 1, minHeight: 128, overflowY: 'auto' }}>
					{children || (
						<Empty description='Empty' style={{ position: 'absolute', height: 128, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
					)}
				</Flex>
			</Flex>
		</Card>
	);
};

export default PanelCard;
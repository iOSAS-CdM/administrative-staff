import React from 'react';

import { Card, Flex, Empty } from 'antd';

/**
 * @param {{
 * 	title: string,
 * 	footer?: React.ReactNode,
 * 	children?: React.ReactNode,
 * 	contentMaxHeight?: string | number
 * } & import('antd/es/card').CardInterface} param0
 * @returns {JSX.Element}
 */
const PanelCard = ({
	title,
	footer,
	children,
	contentMaxHeight,
	...props
}) => {
	return (
		<Card title={title} size='small' style={{ flex: 1, display: 'flex', height: '100%' }} {...props}>
			<Flex vertical gap={8} style={{
				position: 'relative',
				height: '100%'
			}}>
				<Flex vertical gap={8} className='scrollable-content' style={{ flex: 1, minHeight: 128 }}>
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
import React from 'react';

import { Card, Flex, Empty } from 'antd';

const PanelCard = ({ title, footer, children, contentMaxHeight, ...props }) => {
	return (
		<Card title={title} size='small' style={{ height: '100%' }} {...props}>
			<Flex vertical gap={8} style={{
				position: 'relative',
				height: '100%'
			}}>
				<Flex vertical gap={8} className='scrollable-content' style={{ height: '100%', flexGrow: 1, maxHeight: contentMaxHeight }}>
					{children || (
						<Flex vertical justify='center' align='center' style={{ height: '100%' }}>
							<Empty description='No content available' />
						</Flex>
					)}
				</Flex>

				{footer}
			</Flex>
		</Card>
	);
};

export default PanelCard;
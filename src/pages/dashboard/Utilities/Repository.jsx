import React from 'react';

import { Button } from 'antd';

import { FileAddOutlined } from '@ant-design/icons';

const Repository = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useLayoutEffect(() => {
		setHeader({
			title: 'Public Form Repository',
			actions: [
				<Button
					type='primary'
					icon={<FileAddOutlined />}
				>
					Upload New Form
				</Button>
			]
		});
	}, [setHeader]);

	React.useEffect(() => {
		setSelectedKeys(['repository']);
	}, [setSelectedKeys]);

	

	return (
		<div>
			<h1>Repository</h1>
		</div>
	);
};

export default Repository;
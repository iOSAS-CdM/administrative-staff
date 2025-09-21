import React from 'react';
import { useNavigate } from 'react-router';

import { Button } from 'antd';

import { FileAddOutlined } from '@ant-design/icons';
import { usePageProps } from '../../../contexts/PagePropsContext';

/**
 * @type {React.FC}
 */
const Repository = () => {
	const { setHeader, setSelectedKeys } = usePageProps();
	const navigate = useNavigate();
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
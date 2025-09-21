import React from 'react';
import { useNavigate } from 'react-router';

import {
	Input,
	Flex,
	Spin,
	Dropdown,
	Avatar,
	Typography,
	Tag
} from 'antd';

import { API_Route, MobileContext } from '../../../main';
import { useCache } from '../../../contexts/CacheContext';

import authFetch from '../../../utils/authFetch';
import ContentPage from '../../../components/ContentPage';
import { StudentCard } from './Verified';

const { Text } = Typography;

/**
 * @type {React.FC<>}
 */
const Unverified = ({ setHeader, setSelectedKeys }) => {
	const navigate = useNavigate();
	React.useEffect(() => {
		setSelectedKeys(['unverified']);
	}, [setSelectedKeys]);

	const { mobile } = React.useContext(MobileContext);
	const { cache, pushToCache } = useCache();
	const [search, setSearch] = React.useState('');
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearching] = React.useState(false);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchSearchResults = async () => {
			if (search.length === 0) return setSearchResults([]);

			// Fetch students from the backend
			setSearching(true);
			const request = await authFetch(`${API_Route}/users/search/students/?q=${encodeURIComponent(search)}`, { signal: controller.signal });
			if (!request?.ok) return;

			/** @type {{students: import('../../../classes/Student').StudentProps[], length: Number}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) return;
			setSearchResults(data.students);
			setSearching(false);
			pushToCache('peers', data.students, false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search]);

	React.useLayoutEffect(() => {
		setHeader({
			title: 'Unverified Profiles',
			actions: [
				<Flex style={{ flexGrow: mobile ? 1 : '' }} key='search'>
					<Dropdown
						showArrow={false}
						open={search.length > 0}
						position='bottomRight'
						placement='bottomRight'
						menu={{
							items: searchResults.length > 0 ? searchResults.map((student) => ({
								key: student.id,
								label: (
									<div
										style={{ width: '100%' }}
									>
										<Flex align='center' gap={8}>
											<Avatar src={student.profilePicture} size='small' />
											<Text style={{ flex: 1 }}>{student.name.first} {student.name.last} ({student.id})</Text>
											<Tag color={student.institute === 'ics' ? 'orange' : student.institute === 'ite' ? 'blue' : student.institute === 'ibe' ? 'yellow' : 'gray'}><Text style={{ unicodeBidi: 'bidi-override', whiteSpace: 'nowrap' }}>{student.institute.toUpperCase()}</Text></Tag>
										</Flex>
									</div>
								)
							})) : [{
								key: 'no-results',
								label: <Text>No results found</Text>,
								disabled: true
							}],
							placement: 'bottomRight',
							style: { width: mobile ? '100%' : 256, maxHeight: 512, overflowY: 'auto' },
							onClick: (e) => {
								setSearch('');
								navigate(`/dashboard/students/profile/${e.key}`);
							}
						}}
					>
						<Input.Search
							placeholder='Search'
							allowClear
							suffix={searching ? <Spin size='small' /> : null}
							onChange={(e) => {
								const value = e.target.value;
								clearTimeout(window.profileDebounceTimer);
								const debounceTimer = setTimeout(() => {
									setSearch(value);
								}, 512);
								window.profileDebounceTimer = debounceTimer;
							}}
							style={{ width: '100%', minWidth: mobile ? '100%' : 256 }} // 2^8
						/>
					</Dropdown>
				</Flex>
			]
		});
	}, [setHeader, setSelectedKeys, mobile, search, searchResults, searching]);
	return (
		<ContentPage
			fetchUrl={`${API_Route}/users/unverified-students/`}
			emptyText='No profiles found'
			cacheKey='peers'
			transformData={(data) => data.students || []}
			totalItems={cache.peers?.filter(student => student.role === 'unverified-student').length + 1 || 0}
			renderItem={(student) => (
				<StudentCard
					student={student}
					loading={student.placeholder}
				/>
			)}
		/>
	);
};

export default Unverified;
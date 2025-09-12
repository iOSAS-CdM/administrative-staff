import React from 'react';

import {
	Input,
	Flex,
	Typography,
	Pagination
} from 'antd';

import { API_Route, MobileContext } from '../../../main';
import { useCache } from '../../../contexts/CacheContext';

import authFetch from '../../../utils/authFetch';

import { StudentPage } from './Verified';

/**
 * @param {import('../../../components/Menubar').PageProps} props
 * @returns {JSX.Element}
 */
const Unverified = ({ setHeader, setSelectedKeys, navigate }) => {
	React.useEffect(() => {
		setSelectedKeys(['unverified']);
	}, [setSelectedKeys]);

	const { mobile } = React.useContext(MobileContext);
	const { cache, pushToCache } = useCache();
	const [loading, setLoading] = React.useState(true);
	const [page, setPage] = React.useState(0);
	const [thisStudents, setThisStudents] = React.useState([]);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchStudents = async () => {
			// Fetch students from the backend
			const request = await authFetch(`${API_Route}/users/unverified-students/?limit=20&offset=${page * 20}`, { signal: controller.signal });
			setLoading(false);
			if (!request.ok) return;

			/** @type {{students: import('../../../classes/Student').StudentProps[], length: Number}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) return;
			pushToCache('peers', data.students, false);
			setThisStudents(data.students);
		};
		fetchStudents();

		return () => controller.abort();
	}, [page]);

	const [search, setSearch] = React.useState('');
	const [searchResults, setSearchResults] = React.useState([]);
	const [searching, setSearching] = React.useState(false);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchSearchResults = async () => {
			if (search.length === 0) {
				setSearchResults([]);
				return;
			};

			// Fetch students from the backend
			setSearching(true);
			const request = await authFetch(`${API_Route}/users/search/unverified-students/?q=${encodeURIComponent(search)}`, { signal: controller.signal });
			if (!request.ok) return;

			/** @type {{students: import('../../../classes/Student').StudentProps[], length: Number}} */
			const data = await request.json();
			if (!data || !Array.isArray(data.students)) return;
			setSearchResults(data.students);
			setSearching(false);
		};
		fetchSearchResults();

		return () => controller.abort();
	}, [search, thisStudents]);

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
										onClick={() => {
											setSearch('');
											navigate(`/dashboard/students/profile/${student.id}`);
										}}
									>
										<Flex align='center' gap={8}>
											<Avatar src={student.profilePicture} size='small' />
											<Text>{student.name.first} {student.name.last} ({student.id})</Text>
										</Flex>
									</div>
								)
							})) : [{
								key: 'no-results',
								label: <Text>No results found</Text>,
								disabled: true
							}],
							placement: 'bottomRight',
							style: { width: mobile ? '100%' : 300, maxHeight: 400, overflowY: 'auto' },
							emptyText: 'No results found',
							onClick: (e) => e.domEvent.stopPropagation()
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
		<Flex vertical gap={32} style={{ width: '100%' }}>
			<StudentPage students={thisStudents} loading={loading} />
			{!loading && thisStudents && thisStudents.length > 0 && (
				<Flex justify='center' style={{ width: '100%' }}>
					<Pagination
						current={page + 1}
						pageSize={20}
						onChange={(page) => {
							setPage(page - 1);
							const pageContent = document.getElementById('page-content');
							if (pageContent)
								pageContent.scrollTo({ top: 0, behavior: 'smooth' });
						}}
						showSizeChanger={false}
						total={cache.peers ? cache.peers.filter((s) => s.role === 'unverified-student').length + 1 : 0}
					/>
				</Flex>
			)}
		</Flex>
	);
};

export default Unverified;
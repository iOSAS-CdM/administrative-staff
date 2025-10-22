import React from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Row, Col, Empty, Spin, Flex, Pagination } from 'antd';
import { useCache } from '../contexts/CacheContext';
import authFetch from '../utils/authFetch';
import { useRefresh } from '../contexts/RefreshContext';

/**
 * A reusable component for displaying items in a grid layout with animations and pagination
 * @param {{
 *  fetchUrl: string;
 *  renderItem: (item: any, index: number) => JSX.Element;
 *  emptyText?: string;
 *  columnSpan?: number;
 *  pageSize?: number;
 *  cacheKey?: string;
 *  onDataFetched?: (data: any) => void;
 *  transformData?: (data: any) => any[];
 * }} props
 * @returns {JSX.Element}
 */
const ContentPage = ({
	fetchUrl,
	renderItem,
	emptyText = 'No items found',
	columnSpan = 8,
	pageSize = 20,
	cacheKey,
	onDataFetched,
	transformData = (data) => Array.isArray(data) ? data : []
}) => {
	const { updateCache, cache } = useCache();
	const { refresh } = useRefresh();
	const [loading, setLoading] = React.useState(true);
	const [page, setPage] = React.useState(0);
	const [totalItems, setTotalItems] = React.useState(0);
	// initialize items from cache if available so previous items are shown while fetching
	const [items, setItems] = React.useState(() => {
		if (cacheKey && cache && cache[cacheKey] && Array.isArray(cache[cacheKey]))
			return cache[cacheKey];
		return [];
	});

	// Keep items in sync with cache for the provided cacheKey. This ensures that if
	// another component pushes to cache, ContentPage will reflect it without needing
	// to re-fetch.
	const cachedCollection = cacheKey && cache && Array.isArray(cache[cacheKey])
		? cache[cacheKey]
		: null;

	// Track if we've completed an initial fetch to avoid cache overriding fetched data
	const [hasFetched, setHasFetched] = React.useState(false);

	React.useEffect(() => {
		if (!cacheKey || !hasFetched) return;
		if (cachedCollection) setItems(cachedCollection);
	}, [cacheKey, cachedCollection, hasFetched]);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchItems = async () => {
			// do not clear existing items immediately; keep previous items visible while loading
			setLoading(true);
			// Add pagination parameters to the URL
			const paginatedUrl = fetchUrl + (fetchUrl.includes('?') ? '&' : '?') +
				`limit=${pageSize}&offset=${page * pageSize}`;

			const request = await authFetch(paginatedUrl, { signal: controller.signal });
			if (!request?.ok) {
				setLoading(false);
				return;
			};

			const data = await request.json();
			if (!data) return setLoading(false);

			const transformedItems = transformData(data);
			// update items only after we have the new data so UI doesn't flash empty
			setItems(transformedItems);

			// Extract the total count from the response (overall filtered data length)
			if (data.length !== undefined)
				setTotalItems(data.length);

			// Cache the items if a cache key is provided (including empty arrays)
			if (cacheKey)
				// Use updateCache to replace the cache completely instead of pushToCache
				// This ensures empty arrays properly clear the cache instead of merging
				updateCache(cacheKey, transformedItems);

			// Mark that we've completed at least one fetch
			setHasFetched(true);

			// Callback for parent component
			if (onDataFetched) onDataFetched(data);

			setLoading(false);
		};

		fetchItems();
		return () => controller.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, fetchUrl, refresh]);

	return (
		<Flex vertical gap={32} style={{ width: '100%', minHeight: 256 }}>
			{loading && items.length === 0 ? (
				<div style={{
					position: 'absolute',
					width: '100%',
					height: 128,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'end',
					zIndex: 10,
					pointerEvents: 'none'
				}}>
					<Spin />
				</div>
			) : items.length > 0 ? (
				<>
						<Row gutter={[16, 16]} style={{ position: 'relative' }}>
							{loading && (
								<div style={{
									position: 'absolute',
									width: '100%',
									height: 128,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'end',
									zIndex: 10,
									pointerEvents: 'none'
								}}>
									<Spin />
								</div>
							)}
						<AnimatePresence mode='popLayout'>
							{items.map((item, index) => (
								<Col key={item.id || index} lg={columnSpan} md={12} sm={24} xs={24}>
									<motion.div
										key={index}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -20 }}
										transition={{ duration: 0.3, delay: index * 0.05 }}
									>
										{renderItem(item, index)}
									</motion.div>
								</Col>
							))}
						</AnimatePresence>
					</Row>

					{totalItems > pageSize && (
						<Flex justify='center' style={{ width: '100%' }}>
							<Pagination
								current={page + 1}
								pageSize={pageSize}
								onChange={(newPage) => {
									setPage(newPage - 1);
									const pageContent = document.getElementById('page-content');
									if (pageContent)
										pageContent.scrollTo({ top: 0, behavior: 'smooth' });
								}}
								showSizeChanger={false}
								total={totalItems}
							/>
						</Flex>
					)}
				</>
			) : (
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
					<Empty description={emptyText} />
				</div>
			)}
		</Flex>
	);
};

export default ContentPage;
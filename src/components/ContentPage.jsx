import React from 'react';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import { Row, Col, Empty, Spin, Flex } from 'antd';
import { useCache } from '../contexts/CacheContext';
import authFetch from '../utils/authFetch';
import { useRefresh } from '../contexts/RefreshContext';

/**
 * A reusable component for displaying items in a grid layout with animations and infinite scrolling
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
	const [loadingMore, setLoadingMore] = React.useState(false);
	const [page, setPage] = React.useState(0);
	const [hasMore, setHasMore] = React.useState(true);
	const observerRef = React.useRef(null);
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

	// Reset state when fetchUrl or refresh changes
	React.useEffect(() => {
		setPage(0);
		setItems([]);
		setHasMore(true);
		setHasFetched(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchUrl, refresh]);

	// Fetch items function
	const fetchItems = React.useCallback(async (currentPage, isInitialLoad = false) => {
		if (isInitialLoad) {
			setLoading(true);
		} else {
			setLoadingMore(true);
		}

		// Add pagination parameters to the URL
		const paginatedUrl = fetchUrl + (fetchUrl.includes('?') ? '&' : '?') +
			`limit=${pageSize}&offset=${currentPage * pageSize}`;

		try {
			const request = await authFetch(paginatedUrl);
			if (!request?.ok) {
				if (isInitialLoad) setLoading(false);
				else setLoadingMore(false);
				return;
			}

			const data = await request.json();
			if (!data) {
				if (isInitialLoad) setLoading(false);
				else setLoadingMore(false);
				return;
			}

			const transformedItems = transformData(data);

			// Check if we've reached the end
			if (transformedItems.length < pageSize) {
				setHasMore(false);
			}

			// Append new items to existing items for infinite scroll
			setItems(prevItems => {
				const newItems = currentPage === 0 ? transformedItems : [...prevItems, ...transformedItems];

				// Cache the items if a cache key is provided
				if (cacheKey) {
					updateCache(cacheKey, newItems);
				}

				return newItems;
			});

			// Mark that we've completed at least one fetch
			setHasFetched(true);

			// Callback for parent component
			if (onDataFetched) onDataFetched(data);

		} catch (error) {
			console.error('Error fetching items:', error);
		} finally {
			if (isInitialLoad) setLoading(false);
			else setLoadingMore(false);
		}
	}, [fetchUrl, pageSize, transformData, cacheKey, updateCache, onDataFetched]);

	// Initial fetch
	React.useEffect(() => {
		fetchItems(0, true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchUrl, refresh]);

	// Load more items when page changes
	React.useEffect(() => {
		if (page > 0) {
			fetchItems(page, false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	// Intersection Observer for infinite scrolling
	React.useEffect(() => {
		if (!observerRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && !loadingMore && hasMore && !loading) {
					setPage(prevPage => prevPage + 1);
				}
			},
			{ threshold: 0.1 }
		);

		observer.observe(observerRef.current);

		return () => {
			if (observerRef.current) {
				// eslint-disable-next-line react-hooks/exhaustive-deps
				observer.unobserve(observerRef.current);
			}
		};
	}, [loadingMore, hasMore, loading]);

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

						{/* Loading indicator for infinite scroll */}
						{loadingMore && (
							<Flex justify='center' style={{ width: '100%', padding: '20px 0' }}>
								<Spin />
							</Flex>
						)}

						{/* Intersection observer target */}
						{hasMore && !loadingMore && (
							<div
								ref={observerRef}
								style={{ height: '20px', width: '100%' }}
							/>
						)}

						{/* End of content message */}
						{!hasMore && items.length > 0 && (
							<Flex justify='center' style={{ width: '100%', padding: '20px 0', opacity: 0.5 }}>
								<span>No more items to load</span>
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
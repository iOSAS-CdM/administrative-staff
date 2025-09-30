import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Row, Col, Empty, Spin, Flex, Pagination } from 'antd';
import { useMobile } from '../contexts/MobileContext';
import authFetch from '../utils/authFetch';
import { useCache } from '../contexts/CacheContext';
import { useRefresh } from '../contexts/RefreshContext';

/**
 * A reusable component for displaying items in a grid layout with animations and pagination
 * @param {{
 *  fetchUrl: string;
 *  renderItem: (item: any, index: number) => JSX.Element;
 *  emptyText?: string;
 *  columnSpan?: number;
 *  pageSize?: number;
 * 	totalItems?: number;
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
	columnSpan = 12,
	pageSize = 20,
	totalItems = 0,
	cacheKey,
	onDataFetched,
	transformData = (data) => Array.isArray(data) ? data : []
}) => {
	const isMobile = useMobile();
	const { refresh } = useRefresh();
	const { pushToCache } = useCache();
	const [loading, setLoading] = React.useState(true);
	const [page, setPage] = React.useState(0);
	const [items, setItems] = React.useState([]);

	React.useEffect(() => {
		const controller = new AbortController();
		const fetchItems = async () => {
			setLoading(true);
			// Add pagination parameters to the URL
			const paginatedUrl = fetchUrl + (fetchUrl.includes('?') ? '&' : '?') +
				`limit=${pageSize}&offset=${page * pageSize}`;

			const request = await authFetch(paginatedUrl, { signal: controller.signal });
			if (!request?.ok) return setLoading(false);

			const data = await request.json();
			if (!data) return setLoading(false);

			const transformedItems = transformData(data);
			setItems(transformedItems);

			// Cache the items if a cache key is provided
			if (cacheKey) pushToCache(cacheKey, transformedItems, false);

			// Callback for parent component
			if (onDataFetched) onDataFetched(data);

			setLoading(false);
		};

		fetchItems();
		return () => controller.abort();
	}, [page, fetchUrl, refresh]);

	return (
		<Flex vertical gap={32} style={{ width: '100%' }}>
			{items.length > 0 ? (
				<>
					<Row gutter={[16, 16]}>
						<AnimatePresence mode='popLayout'>
							{items.map((item, index) => (
								<Col key={item.id || index} span={!isMobile ? columnSpan : 24}>
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
									if (pageContent) {
										pageContent.scrollTo({ top: 0, behavior: 'smooth' });
									}
								}}
								showSizeChanger={false}
								total={totalItems}
							/>
						</Flex>
					)}
				</>
			) : (
				<div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
					{loading ? (
						<Spin />
					) : (
						<Empty description={emptyText} />
					)}
				</div>
			)}
		</Flex>
	);
};

export default ContentPage;
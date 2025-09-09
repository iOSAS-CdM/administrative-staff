// src/contexts/CacheContext.js
import React from 'react';

// Create a new Context
const CacheContext = React.createContext();

/** @typedef {import('../classes/Student').StudentProps | import('../classes/Staff').StaffProps} UserProps */

/**
 * @typedef {{
 * 	staff: import('../classes/Staff').StaffProps | null;
 * 	records: import('../classes/Record').RecordProps[];
 * 	organizations: import('../classes/Organization').OrganizationProps[];
 * 	announcements: import('../classes/Announcement').AnnouncementProps[];
 * 	events: import('../classes/Event').EventProps[];
 * 	peers: UserProps[];
 * }} Cache
 */
/** @typedef {(key: keyof Cache, data: Any) => Void} UpdateCache */
/** @typedef {(key: keyof Cache, data: Any) => Void} PushToCache */

// This is the custom hook that components will use to access the cache
/**
 * @type {() => {
 * 	cache: Cache;
 * 	updateCache: UpdateCache;
 * 	pushToCache: PushToCache;
 * }}
 */
const useCache = () => {
	const context = React.useContext(CacheContext);
	if (!context)
		throw new Error('useCache must be used within a CacheProvider');
	return context;
};

export const CacheProvider = ({ children }) => {
	// Use a single state object to hold all your cached data
	const [cache, setCache] = React.useState({
		staff: {
			name: {
				first: null,
				middle: null,
				last: null
			},
			role: null,
			profilePicture: null
		},
		students: [],
		records: [],
		organizations: [],
		announcements: [],
		events: [],
		peers: []
	});

	// A function to update the cache with new data
	/** @type {UpdateCache} */
	const updateCache = (key, data) =>
		setCache(prevCache => ({
			...prevCache,
			[key]: data
		}));

	/** @type {PushToCache} */
	const pushToCache = (key, data) =>
		setCache(prevCache => ({
			...prevCache,
			[key]: [...prevCache[key], data]
		}));

	// Memoize the value to prevent unnecessary re-renders
	const value = React.useMemo(() => ({
		cache,
		updateCache,
		pushToCache
	}), [cache]);

	return (
		<CacheContext.Provider value={value}>
			{children}
		</CacheContext.Provider>
	);
};

export { useCache, CacheContext };
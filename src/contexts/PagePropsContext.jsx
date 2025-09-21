import React from 'react';

/**
 * @typedef {{
 * 	title: string,
 * 	actions: React.ReactNode[]
 * }} Header
 */

/**
 * @typedef {{
 * 	setHeader: React.Dispatch<React.SetStateAction<Header>>,
 * 	setSelectedKeys: React.Dispatch<React.SetStateAction<string[]>>,
 * 	staff: import('../classes/Staff').default | null,
 * 	displayTheme: 'light' | 'dark',
 * 	setDisplayTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>,
 * }} PageProps
 */

/**
 * @type {React.Context<PageProps | undefined>}
 */
const PagePropsContext = React.createContext();

/**
 * Hook to use PageProps context
 * @returns {PageProps}
 */
export const usePageProps = () => {
	const context = React.useContext(PagePropsContext);
	if (context === undefined) {
		throw new Error('usePageProps must be used within a PagePropsProvider');
	}
	return context;
};

/**
 * PageProps Provider component
 * @type {React.FC<{
 * 	children: React.ReactNode,
 * 	value: PageProps
 * }>}
 */
export const PagePropsProvider = ({ children, value }) => {
	return (
		<PagePropsContext.Provider value={value}>
			{children}
		</PagePropsContext.Provider>
	);
};

export { PagePropsContext };

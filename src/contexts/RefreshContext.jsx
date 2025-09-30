import React from 'react';

const RefreshContext = React.createContext({});

export const RefreshProvider = ({ children }) => {
	const [refresh, setRefresh] = React.useState({
		timestamp: Date.now()
	});

	React.useEffect(() => {
		window.refresh = () =>
			setRefresh({
				timestamp: Date.now()
			});

		return () =>
			delete window.refresh;
	}, []);

	return (
		<RefreshContext.Provider value={{ refresh, setRefresh }}>
			{children}
		</RefreshContext.Provider>
	);
};

/**
 * @typedef {{ timestamp: number }} RefreshContext
 */

/** @type {() => { refresh: RefreshContext; setRefresh: React.Dispatch<React.SetStateAction<RefreshContext>> }} */
// eslint-disable-next-line react-refresh/only-export-components
export const useRefresh = () => {
	return React.useContext(RefreshContext);
};
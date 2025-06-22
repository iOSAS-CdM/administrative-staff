import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';

import { ConfigProvider as DesignConfig, App, theme as DesignTheme } from 'antd';

import Authentication from './pages/Authentication';
import Menubar from './components/Menubar';

import remToPx from './utils/remToPx';
import rootToHex from './utils/rootToHex';

import 'antd/dist/reset.css';
import './styles/index.css';

const OSAS = () => {
	const [mobile, setMobile] = React.useState(false);

	React.useEffect(() => {
		const handleResize = () => {
			setMobile(window.innerWidth < remToPx(80));
			console.log(`Mobile mode: ${window.innerWidth < remToPx(80)}`);
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<React.StrictMode>
			<DesignConfig
				theme={{
					algorithm: [
						DesignTheme.defaultAlgorithm
					],
					cssVar: true,
					token: {
						colorPrimary: rootToHex('var(--primary)'),
						colorInfo: rootToHex('var(--primary)'),
						fontSize: remToPx(1.5),
						sizeUnit: remToPx(0.5),
						borderRadius: remToPx(0.75)
					},
					components: {
						Menu: {
							collapsedWidth: remToPx(6)
						}
					}
				}}
			>
				<App>
					<BrowserRouter>
						<Routes>
							<Route path='/' element={
								<Navigate to='/authentication' replace />
							} />

							<Route path='/authentication/*' element={
								<MobileContext.Provider value={{ mobile, setMobile }}>
									<Authentication />
								</MobileContext.Provider>
							} />

							<Route path='/dashboard/*' element={
								<MobileContext.Provider value={{ mobile, setMobile }}>
									<Menubar />
								</MobileContext.Provider>
							} />
						</Routes>
					</BrowserRouter>
				</App>
			</DesignConfig>
		</React.StrictMode>
	);
};

export const MobileContext = React.createContext({
	mobile: false,
	setMobile: () => { }
});

ReactDOM.createRoot(document.getElementById('root')).render(<OSAS />);

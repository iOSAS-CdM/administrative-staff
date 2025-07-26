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

export const MobileContext = React.createContext({
	mobile: false,
	setMobile: () => { }
});
export const DisplayThemeContext = React.createContext({
	displayTheme: 'light',
	setDisplayTheme: () => { }
});

const OSAS = () => {
	const [mobile, setMobile] = React.useState(false);
	React.useEffect(() => {
		const handleResize = () => {
			setMobile(window.innerWidth < remToPx(120));
			console.log(`Mobile mode: ${window.innerWidth < remToPx(120)}`);
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
	const [displayTheme, setDisplayTheme] = React.useState('light');
	React.useEffect(() => {
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
			setDisplayTheme('dark');
	}, [displayTheme]);

	return (
		<React.StrictMode>
			<DesignConfig
				theme={{
					algorithm: [
						DesignTheme.defaultAlgorithm,
						...[displayTheme === 'dark' ? DesignTheme.darkAlgorithm : DesignTheme.defaultAlgorithm]
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
						<MobileContext.Provider value={{ mobile, setMobile }}>
							<DisplayThemeContext.Provider value={{ displayTheme, setDisplayTheme }}>
								<Routes>
									<Route path='/' element={<Navigate to='/authentication' replace />} />

									<Route path='/authentication/*' element={<Authentication />} />

									<Route path='/dashboard/*' element={<Menubar />} />
								</Routes>
							</DisplayThemeContext.Provider>
						</MobileContext.Provider>
					</BrowserRouter>
				</App>
			</DesignConfig>
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root')).render(<OSAS />);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import supabase from './utils/supabase';

import { ConfigProvider as DesignConfig, App, theme as DesignTheme } from 'antd';

import Authentication from './pages/Authentication';
import Dashboard from './pages/Dashboard';
import Unauthorized from './pages/Unauthorized';
import AuthReturn from './pages/AuthReturn';

import rootToHex from './utils/rootToHex';

import 'antd/dist/reset.css';
import './styles/index.css';
import { initTelemetry } from './utils/telemetry';
import ErrorBoundary from './components/ErrorBoundary';

import { CacheProvider } from './contexts/CacheContext';
import { MobileProvider } from './contexts/MobileContext';
import { RefreshProvider } from './contexts/RefreshContext';
import UpdateNotification from './components/UpdateNotification';

export const DisplayThemeContext = React.createContext({
	displayTheme: 'light',
	setDisplayTheme: () => { }
});

const PRIMARY_COLOR = rootToHex('var(--primary)');

const OSAS = () => {
	const [displayTheme, setDisplayTheme] = React.useState(() => {
		if (typeof window !== 'undefined')
			return localStorage.getItem('displayTheme') ||
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		return 'light'; // Fallback for SSR
	});

	// Effect to keep theme in sync
	React.useLayoutEffect(() => {
		// Save to localStorage
		localStorage.setItem('displayTheme', displayTheme);

		// Update document attribute for CSS
		document.documentElement.setAttribute('data-theme', displayTheme);

		// Notify Tauri about theme change
		if (window.__TAURI_INTERNALS__)
			window.__TAURI_INTERNALS__.invoke('set_theme', { theme: displayTheme });
	}, [displayTheme]);

	const [session, setSession] = React.useState(null);
	const [sessionChecked, setSessionChecked] = React.useState(false);

	/** @type {import('antd').ConfigProviderProps['theme']} */
	const themeConfig = React.useMemo(() => ({
		algorithm: [
			DesignTheme.defaultAlgorithm,
			...(displayTheme === 'dark' ? [DesignTheme.darkAlgorithm] : [])
		],
		cssVar: true,
		token: {
			colorPrimary: PRIMARY_COLOR,
			colorInfo: PRIMARY_COLOR,
			fontSize: 12,
			sizeUnit: 2,
			borderRadius: 4
		},
		components: {
			Menu: {
				collapsedWidth: 64
			}
		}
	}), [displayTheme]);

	// Get initial session
	React.useLayoutEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setSessionChecked(true);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setSessionChecked(true);
		});
	}, []);

	if (!sessionChecked) return null;

	return (
		<DesignConfig theme={themeConfig} variant='outlined' virtual>
			<App>
				<BrowserRouter>
					<MobileProvider>
						<DisplayThemeContext.Provider value={{ displayTheme, setDisplayTheme }}>
							<UpdateNotification />
							<Routes>
								<Route path='/' element={<Navigate to='/authentication' replace />} />
								<Route path='/authentication/*' element={!session ? <Authentication /> : <Navigate to='/dashboard' replace />} />

								<Route
									path='/dashboard/*'
									element={session ? (
										<CacheProvider>
											<RefreshProvider>
												<Dashboard />
											</RefreshProvider>
										</CacheProvider>
									) : (
										<Navigate to='/authentication' replace />
									)}
								/>

								<Route path='/unauthorized' element={<Unauthorized />} />
								<Route path='/auth-return' element={<AuthReturn />} />
							</Routes>
						</DisplayThemeContext.Provider>
					</MobileProvider>
				</BrowserRouter>
			</App>
		</DesignConfig>
	);
};

export const API_Route = false ? 'http://localhost:3001' : 'https://api.iosas.online';

// Initialize telemetry (global handlers, batching, dedupe)
if (typeof window !== 'undefined')
	initTelemetry();

// Create root only once to avoid React DOM warnings
const container = document.getElementById('root');
if (!container._reactRoot)
	container._reactRoot = ReactDOM.createRoot(container);
container._reactRoot.render(
	<ErrorBoundary>
		<OSAS />
	</ErrorBoundary>
);

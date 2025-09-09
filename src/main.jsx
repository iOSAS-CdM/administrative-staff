import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router';
import supabase from './utils/supabase';
import authFetch from './utils/authFetch';

import { ConfigProvider as DesignConfig, App, theme as DesignTheme, notification } from 'antd';

import Authentication from './pages/Authentication';
import Menubar from './components/Menubar';
import Unauthorized from './pages/Unauthorized';
import AuthReturn from './pages/AuthReturn';

import rootToHex from './utils/rootToHex';

import 'antd/dist/reset.css';
import './styles/index.css';

import Staff from './classes/Staff';
import Student from './classes/Student';
import Record from './classes/Record';
import Organization from './classes/Organization';
import Announcement from './classes/Announcement';
import Event from './classes/Event';

export const MobileContext = React.createContext({
	mobile: false,
	setMobile: () => { }
});
export const DisplayThemeContext = React.createContext({
	displayTheme: 'light',
	setDisplayTheme: () => { }
});

export const SyncSeedContext = React.createContext({
	seed: 0,
	setSeed: () => { }
});
export const LoadingStatesContext = React.createContext({
	staff: false,
	students: false,
	records: false,
	organizations: false,
	events: false,
	setLoadingStates: () => { }
});
/**
 * @typedef {{
 * 	staff: Staff;
 * 	students: Student[];
 * 	records: Record[];
 * 	organizations: Organization[];
 * 	announcements: Announcement[];
 * 	events: {
 * 		date: Date,
 * 		events: Event[]
 * 	}[];
 * }} OSASData
 */
export const OSASContext = React.createContext({
	/** @type {OSASData} */
	osas: {
		staff: {
			name: {
				first: '',
				middle: '',
				last: ''
			},
			role: '',
			profilePicture: '',
			status: ''
		},
		students: [],
		records: [],
		organizations: [],
		announcements: [],
		events: []
	},
	setOsas: () => { }
});

const PRIMARY_COLOR = rootToHex('var(--primary)');

const OSAS = () => {
	const [mobile, setMobile] = React.useState(false);
	React.useLayoutEffect(() => {
		const handleResize = () => {
			setMobile(window.innerWidth < 1024); // 2^10
		};

		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);
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

	const [seed, setSeed] = React.useState(0);

	const [session, setSession] = React.useState(null);
	const [sessionChecked, setSessionChecked] = React.useState(false);

	const [loadingStates, setLoadingStates] = React.useState({
		staff: false,
		students: false,
		records: false,
		organizations: false,
		announcements: false,
		events: false
	});

	// Set singleton data for the app
	/** @type {[OSASData, React.Dispatch<React.SetStateAction<OSASData>>]} */
	const [osas, setOsas] = React.useState({
		staff: {
			name: {
				first: '',
				middle: '',
				last: ''
			},
			role: '',
			profilePicture: '',
			status: ''
		},
		students: [],
		records: [],
		organizations: [],
		announcements: [],
		events: []
	});
	React.useLayoutEffect(() => {
		if (!sessionChecked || !session) return;
		setLoadingStates({
			staff: false,
			students: false,
			records: false,
			organizations: false,
			events: false,
			announcements: false
		});
		setOsas({
			staff: {
				name: {
					first: '',
					middle: '',
					last: ''
				},
				role: '',
				profilePicture: ''
			},
			students: [],
			records: [],
			organizations: [],
			announcements: [],
			events: []
		});

		authFetch(`${API_Route}/auth/me`)
			.then(response => response.json())
			.then(data => {
				console.log(data);
				if (data) {
					setOsas(prev => ({
						...prev,
						staff: {
							...prev.staff,
							id: data.id,
							email: data.email,
							name: {
								first: data.name.first || '',
								middle: data.name.middle || '',
								last: data.name.last || ''
							},
							role: data.role,
							profilePicture: data.profilePicture || '',
						}
					}));
					setLoadingStates(prev => ({
						...prev,
						staff: true
					}));
				}
			})
			.catch((error) => {
				console.error('Error fetching staff data:', error);
				notification.error({
					message: 'Error',
					description: 'Failed to fetch staff data. Please try again later.'
				});
			});
	}, [seed, session, sessionChecked]);

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
		<React.StrictMode>
			<DesignConfig theme={themeConfig}>
				<SyncSeedContext.Provider value={{ seed, setSeed }}>
					<LoadingStatesContext.Provider value={{ loadingStates, setLoadingStates }}>
						<OSASContext.Provider value={{ osas, setOsas }}>
							<App>
								<BrowserRouter>
									<MobileContext.Provider value={{ mobile, setMobile }}>
										<DisplayThemeContext.Provider value={{ displayTheme, setDisplayTheme }}>
											<Routes>
												<Route path='/' element={<Navigate to='/authentication' replace />} />
												<Route path='/authentication/*' element={!session ? <Authentication /> : <Navigate to='/dashboard' replace />} />
												<Route path='/dashboard/*' element={session ? <Menubar /> : <Navigate to='/authentication' replace />} />

												<Route path="/unauthorized" element={<Unauthorized />} />
												<Route path="/auth-return" element={<AuthReturn />} />
											</Routes>
										</DisplayThemeContext.Provider>
									</MobileContext.Provider>
								</BrowserRouter>
							</App>
						</OSASContext.Provider>
					</LoadingStatesContext.Provider>
				</SyncSeedContext.Provider>
			</DesignConfig>
		</React.StrictMode>
	);
};

export const API_Route = import.meta.env.DEV ? 'http://localhost:3001' : 'http://47.130.158.40';

ReactDOM.createRoot(document.getElementById('root')).render(<OSAS />);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import supabase from './utils/supabaseClient';

import { ConfigProvider as DesignConfig, App, theme as DesignTheme, notification } from 'antd';

import Authentication from './pages/Authentication';
import Menubar from './components/Menubar';
import Unauthorized from './pages/Unauthorized';

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

	// Modify `fetch`
	React.useLayoutEffect(() => {
		const originalFetch = window.fetch;

		window.fetch = async (...args) => {
			// Only add headers if we have a session with access token
			if (session?.access_token) {
				// First arg is the resource/URL, second arg is options
				if (args[1] && typeof args[1] === 'object') {
					// If headers already exist, add to them
					args[1].headers = {
						...args[1].headers,
						'Authorization': `Bearer ${JSON.parse(localStorage.getItem('CustomApp')).access_token}`
					};
				} else {
					// Create headers object if options doesn't exist
					args[1] = {
						...(args[1] || {}),
						headers: {
							'Authorization': `Bearer ${JSON.parse(localStorage.getItem('CustomApp')).access_token}`
						}
					};
				};
			};

			const response = await originalFetch(...args);

			// If we have a session but get a 403 Forbidden response, sign out
			if (session && response.status === 403) {
				await supabase.auth.signOut();
				window.location.href = '/unauthorized';
			};

			return response;
		};

		return () => {
			window.fetch = originalFetch;
		};
	}, [session, sessionChecked]);

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

		fetch(`${API_Route}/staff/me`)
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

	const programs = {
		'ics': ['BSCpE', 'BSIT'],
		'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
		'ibe': ['BSBA-HRM', 'BSE']
	};
	React.useLayoutEffect(() => {
		if (!loadingStates.staff) return;

		fetch('https://randomuser.me/api/?results=200&inc=name,email,phone,login,picture')
			.then(response => response.json())
			.then(data => {
				/** @type {Student[]} */
				const fetchedStudents = [];

				for (let i = 0; i < data.results.length; i++) {
					const user = data.results[i];
					const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];

					const student = new Student({
						name: {
							first: user.name.first,
							middle: user.name.middle || '',
							last: user.name.last
						},
						email: user.email,
						phone: user.phone,
						studentId: (() => {
							let id;
							do {
								id = `25-${String(i).padStart(5, '0')}`;
							} while (fetchedStudents.some(student => student.studentId === id));
							return id;
						})(),
						institute: institute,
						program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
						year: Math.floor(Math.random() * 4) + 1,
						profilePicture: user.picture.large,
						status: ['active', 'restricted', 'archived'][Math.floor(Math.random() * 3)]
					});
					fetchedStudents.push(student);
				};
				setOsas(prev => ({
					...prev,
					students: fetchedStudents
				}));
				setLoadingStates(prev => ({
					...prev,
					students: true
				}));
			})
			.catch(error => {
				console.error('Error fetching student data:', error);
				/** @type {Student[]} */
				const placeholderStudents = [];

				for (let i = 0; i < 20; i++) {
					const user = {
						name: {
							first: 'First',
							middle: 'Middle',
							last: 'Last'
						},
						email: 'example@mail.com',
						phone: '+63 912 345 6789'
					};
					const institute = ['ics', 'ite', 'ibe'][Math.floor(Math.random() * 3)];

					const student = new Student({
						name: {
							first: user.name.first,
							middle: user.name.middle || '',
							last: user.name.last
						},
						email: user.email,
						phone: user.phone,
						studentId: (() => {
							let id;
							do {
								id = `25-${String(i).padStart(5, '0')}`;
							} while (placeholderStudents.some(student => student.studentId === id));
							return id;
						})(),
						institute: institute,
						program: programs[institute][Math.floor(Math.random() * programs[institute].length)],
						year: Math.floor(Math.random() * 4) + 1,
						profilePicture: '/Placeholder Image.svg',
						status: ['active', 'restricted', 'archived'][Math.floor(Math.random() * 3)]
					});
					placeholderStudents.push(student);
				};
				setOsas(prev => ({
					...prev,
					students: placeholderStudents
				}));
				notification.error({
					message: 'Error',
					description: 'Failed to fetch student data.'
				});
			});
	}, [loadingStates.staff]);
	React.useLayoutEffect(() => {
		if (!loadingStates.students) return;
		setTimeout(() => {
			/** @type {Record[]} */
			const fetchedRecords = [];

			for (let i = 0; i < 200; i++) {
				const id = `record-25-${String(i).padStart(5, '0')}-${i + 1}`;

				const complainants = [];
				for (let j = 0; j < 10; j++) {
					const student = osas.students[Math.floor(Math.random() * osas.students.length)];
					if (complainants.some(c => c.studentId === student.studentId)) continue; // Avoid duplicates
					complainants.push(student);
				};
				const complainees = [];
				for (let j = 0; j < 10; j++) {
					const student = osas.students[Math.floor(Math.random() * osas.students.length)];
					if (complainees.some(c => c.student.studentId === student.studentId) || complainants.some(c => c.studentId === student.studentId)) continue; // Avoid duplicates
					complainees.push({
						occurrence: j + 1,
						student: student
					});
				};
				const status = ['ongoing', 'resolved', 'archived'][Math.floor(Math.random() * 3)];
				const record = new Record({
					id: id,
					violation: `Record ${i + 1}`,
					description: `This is a record for testing purposes. Record number ${i + 1}.`,
					tags: {
						status: status,
						severity: ['Minor', 'Major', 'Severe'][Math.floor(Math.random() * 3)],
						progress: status === 'ongoing' ? Math.floor(Math.random() * 5) : 5
					},
					complainants: complainants,
					complainees: complainees,
					placeholder: false,
					date: new Date(new Date().getFullYear(), new Date().getMonth(), new
						Date().getDate() - Math.floor(Math.random() * 50))
				});

				fetchedRecords.push(record);
			};

			const sortedRecords = fetchedRecords.sort((a, b) => b.date - a.date);
			sortedRecords.forEach(record => {
				record.date = new Date(record.date);
			});
			setOsas(prev => ({
				...prev,
				records: sortedRecords
			}));
			setLoadingStates(prev => ({
				...prev,
				records: true
			}));
		}, 1024); // 2^10
	}, [loadingStates.students]);
	React.useLayoutEffect(() => {
		if (!loadingStates.students) return;
		setTimeout(() => {
			/** @type {Organization[]} */
			const fetchedOrganizations = [];

			for (let i = 0; i < 10; i++) {
				const id = `organization-25-${String(i).padStart(5, '0')}-${i + 1}`;

				/** @type {import('../../../classes/Organization').OrganizationMember[]} */
				const members = [];
				for (const role of ['President', 'Vice President', 'Secretary', 'Treasurer', 'Member']) {
					const student = osas.students[Math.floor(Math.random() * osas.students.length)];
					if (members.some(m => m.student.studentId === student.studentId)) continue; // Avoid duplicates
					members.push({
						role: role,
						student: student
					});
				};

				const organization = new Organization({
					id: id,
					shortName: `Organization ${i + 1}`,
					fullName: `Organization Full Name ${i + 1}`,
					description: `This is the description for organization ${i + 1}.`,
					email: `org${i + 1}@example.com`,
					phone: `+63 912 345 ${Math.floor(Math.random() * 1000)}`,
					logo: '/Placeholder Image.svg',
					cover: '/Placeholder Image.svg',
					status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'restricted' : 'archived',
					type: i % 2 === 0 ? 'college-wide' : 'institute-wide',
					members: members
				});
				fetchedOrganizations.push(organization);
			};

			setOsas(prev => ({
				...prev,
				organizations: fetchedOrganizations
			}));
			setLoadingStates(prev => ({
				...prev,
				organizations: true
			}));
		}, 1024); // 2^10
	}, [loadingStates.students]);
	React.useLayoutEffect(() => {
		if (!loadingStates.students || !loadingStates.staff) return;
		setTimeout(() => {
			/** @type {Announcement[]} */
			const fetchedAnnouncements = [];

			for (let i = 0; i < 10; i++) {
				const id = `announcement-25-${String(i).padStart(5, '0')}-${i + 1}`;
				const announcement = new Announcement({
					id: id,
					title: `Announcement ${i + 1}`,
					description: `This is the description for announcement ${i + 1}.`,
					date: new Date(new Date().getFullYear(), new Date().getMonth(), new
						Date().getDate() - Math.floor(Math.random() * 50)),
					authors: [
						{
							type: 'staff',
							user: osas.staff
						}
					]
				});

				fetchedAnnouncements.push(announcement);
			};

			setOsas(prev => ({
				...prev,
				announcements: fetchedAnnouncements
			}));
			setLoadingStates(prev => ({
				...prev,
				announcements: true
			}));
		}, 1024); // 2^10
	}, [osas.students, osas.staff]);
	React.useLayoutEffect(() => {
		if (!loadingStates.records || !loadingStates.organizations) return;
		const events = [];
		for (const record of osas.records) {
			const event = new Event({
				id: record.id,
				type: 'disciplinary',
				content: record
			});
			events.push(event);
		};

		const eventsMap = events.reduce((acc, event) => {
			const dateKey = event.content.date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push(event);
			return acc;
		}, {});

		const sortedEvents = Object.entries(eventsMap).map(([date, events]) => ({
			date: new Date(date),
			events: events.sort((a, b) => new Date(b.content.date) - new Date(a.content.date))
		})).sort((a, b) => b.date - a.date);

		setOsas(prev => ({
			...prev,
			events: sortedEvents
		}));
		setLoadingStates(prev => ({
			...prev,
			events: true
		}));
	}, [loadingStates.records, loadingStates.announcements, loadingStates.organizations]);

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

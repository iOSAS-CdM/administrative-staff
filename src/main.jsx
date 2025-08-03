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

import Student from './classes/Student';
import Record from './classes/Record';
import Organization from './classes/Organization';
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
/**
 * @typedef {{
 * 	staff: {
 * 		name: {
 * 			first: '',
 * 			middle: '',
 * 			last: ''
 * 		},
 * 		role: '',
 * 		profilePicture: ''
 * 	};
 * 	students: Student[];
 * 	records: Record[];
 * 	organizations: Organization[];
 * 	events: {
 * 		date: Date,
 * 		events: Event[]
 * 	}[];
 * }} OSASData
 */
export const OSASContext = React.createContext({
	/** @type {OSASData} */
	osas: {
		students: [],
		records: [],
		organizations: []
	},
	setOsas: () => { }
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

	const [seed, setSeed] = React.useState(0);

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
			profilePicture: ''
		},
		students: [],
		records: [],
		organizations: [],
		events: []
	});
	React.useEffect(() => {
		fetch('https://randomuser.me/api/?results=1&inc=name,%20picture')
			.then(response => response.json())
			.then(data => {
				const user = data.results[0];
				const staff = {
					name: {
						first: user.name.first,
						middle: user.name.middle || '',
						last: user.name.last
					},
					role: 'Administrative Staff',
					profilePicture: user.picture.large
				};
				setOsas(prev => ({
					...prev,
					staff: staff
				}));
				console.log('Staff data fetched:', staff);
			})
			.catch(error => {
				console.error('Error fetching staff data:', error);
			});
	}, [seed]);

	const programs = {
		'ics': ['BSCpE', 'BSIT'],
		'ite': ['BSEd-SCI', 'BEEd-GEN', 'BEEd-ECED', 'BTLEd-ICT', 'TCP'],
		'ibe': ['BSBA-HRM', 'BSE']
	};
	React.useEffect(() => {
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
								id = `25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}`;
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
								id = `25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}`;
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
			});
	}, [osas.staff]);
	React.useEffect(() => {
		if (osas.students.length === 0) return;
		setTimeout(() => {
			/** @type {Record[]} */
			const fetchedRecords = [];

			for (let i = 0; i < 200; i++) {
				const id = `record-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;

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
		}, remToPx(200));
	}, [osas.students]);
	React.useEffect(() => {
		if (osas.students.length === 0) return;
		setTimeout(() => {
			/** @type {Organization[]} */
			const fetchedOrganizations = [];

			for (let i = 0; i < 10; i++) {
				const id = `organization-25-${String(Math.floor(Math.random() * 1000)).padStart(5, '0')}-${i + 1}`;

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
		}, remToPx(200));
	}, [osas.students]);
	React.useEffect(() => {
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
	}, [osas.records]);

	React.useEffect(() => {
		console.log(osas);
	}, [osas]);

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
				<SyncSeedContext.Provider value={{ seed, setSeed }}>
					<OSASContext.Provider value={{ osas, setOsas }}>
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
					</OSASContext.Provider>
				</SyncSeedContext.Provider>
			</DesignConfig>
		</React.StrictMode>
	);
};

ReactDOM.createRoot(document.getElementById('root')).render(<OSAS />);

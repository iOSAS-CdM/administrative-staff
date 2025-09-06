/**
 * @typedef {'BSCpE' | 'BSIT'} ICSPrograms
 * @typedef {'BSEd-SCI' | 'BEEd-GEN' | 'BEEd-ECED' | 'BTLEd-ICT' | 'TCP'} ITEPrograms
 * @typedef {'BSBA-HRM' | 'BSE'} IBEPrograms
 */

/**
 * @typedef {{
 * 	name: {
 * 		first: String,
 * 		middle: String,
 * 		last: String
 * 	},
 * 	role: 'student',
 * 	email: String,
 * 	phone: String,
 * 	studentId: String,
 * 	profilePicture?: String,
 * 	status?: 'active' | 'restricted' | 'archived',
 * 	organizations?: import('./Organization').OrganizationProps[],
 * }} BaseStudentProps
 */

/** @typedef {BaseStudentProps & { institute: 'ics', program: ICSPrograms, year: Number }} ICSStudent */
/** @typedef {BaseStudentProps & { institute: 'ite', program: ITEPrograms, year: Number }} ITEStudent */
/** @typedef {BaseStudentProps & { institute: 'ibe', program: IBEPrograms, year: Number }} IBEStudent */

/** @typedef {ICSStudent | ITEStudent | IBEStudent} StudentProps */

class Student {
	/**
	 * @param {StudentProps} props
	 */
	constructor({
		name,
		role,
		email,
		phone,
		studentId,
		institute,
		program,
		year,
		profilePicture = '/Placeholder Image.svg',
		status = 'active',
		organizations = []
	}) {
		this.name = name;
		this.role = role;
		this.email = email;
		this.phone = phone;
		this.studentId = studentId;
		this.institute = institute;
		this.program = program;
		this.year = year;
		this.profilePicture = profilePicture;
		this.status = status;
		this.organizations = organizations;
	};
};

export default Student;

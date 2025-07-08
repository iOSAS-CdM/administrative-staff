/**
 * @typedef {'BSCpE' | 'BSIT'} ICSPrograms
 * @typedef {'BSEd-SCI' | 'BEEd-GEN' | 'BEEd-ECED' | 'BTLEd-ICT' | 'TCP'} ITEPrograms
 * @typedef {'BSBA-HRM' | 'BSE'} IBEPrograms
 */

/**
 * @typedef {{
 * 	id?: Number | String,
 * 	name: {
 * 		first: String,
 * 		middle: String,
 * 		last: String
 * 	},
 * 	email: String,
 * 	phone: String,
 * 	studentId: String,
 * 	profilePicture?: String,
 * 	status?: 'active' | 'restricted' | 'archived',
 * 	placeholder?: Boolean
 * }} BaseStudentProps
 */

/** @typedef {BaseStudentProps & { institute: 'ics', program: ICSPrograms, year: Number }} ICSStudent */
/** @typedef {BaseStudentProps & { institute: 'ite', program: ITEPrograms, year: Number }} ITEStudent */
/** @typedef {BaseStudentProps & { institute: 'ibe', program: IBEPrograms, year: Number }} IBEStudent */

/** @typedef {ICSStudent | ITEStudent | IBEStudent} StudentProps */

class Student {
	/**
	 * @param {StudentProps} param0
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		name,
		email,
		phone,
		studentId,
		institute,
		program,
		year,
		profilePicture = '/Placeholder Image.svg',
		placeholder = false,
		status = 'active'
	}) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.studentId = studentId;
		this.institute = institute;
		this.program = program;
		this.year = year;
		this.profilePicture = profilePicture;
		this.placeholder = placeholder;
		this.status = status;
	};
};

export default Student;
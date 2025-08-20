/**
 * @typedef {{
 * 	id: Number | String;
 * 	name: String;
 * 	email: String;
 * 	role: 'head' | 'guidance' | 'prefect' | 'student-affairs';
 * 	profilePicture: String;
 * }} StaffProps
 */

class Staff {
	/**
	 * @param {StaffProps} props
	 */
	constructor({
		id,
		name,
		email,
		role,
		profilePicture
	}) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.role = role;
		this.profilePicture = profilePicture;
	};
};

export default Staff;
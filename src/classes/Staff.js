/**
 * @typedef {{
 * 	id: Number | String;
 * 	name: String;
 * 	email: String;
 * 	role: 'head' | 'guidance' | 'prefect' | 'student-affairs';
 * 	profilePicture: String;
 * 	status: 'active' | 'restricted' | 'archived';
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
		profilePicture,
		status
	}) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.role = role;
		this.profilePicture = profilePicture;
		this.status = status;
	};
};

export default Staff;

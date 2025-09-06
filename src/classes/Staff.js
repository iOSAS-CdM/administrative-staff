/**
 * @typedef {{
 *  id: Number | String;
 *  name: {
 * 		first: String;
 * 		last: String;
 * 		middle?: String;
 * 	};
 *  email: String;
 *  role: 'head' | 'guidance' | 'prefect' | 'student-affairs';
 *  profilePicture: String;
 *  status: 'active' | 'restricted' | 'archived';
 *  reason?: String;
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
		status,
		reason
	}) {
		this.id = id;
		this.name = name;
		this.email = email;
		this.role = role;
		this.profilePicture = profilePicture;
		this.status = status;
		if (status === 'restricted') {
			this.reason = reason;
		}
	};
};

export default Staff;
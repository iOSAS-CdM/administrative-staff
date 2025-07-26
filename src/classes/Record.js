/** @typedef {'ongoing' | 'resolved' | 'archived'} RecordStatus */
/** @typedef {'minor' | 'major' | 'severe'} RecordSeverity */

/**
 * @typedef {{
 * 	occurrence: Number,
 * 	student: import('./Student').StudentProps
 * }} RecordComplainanee
 */

/**
 * @typedef {{
 * 	id?: Number | String,
 * 	violation: String,
 * 	description: String,
 * 	tags: {
 * 		status: RecordStatus,
 * 		severity: RecordSeverity
 * 	},
 * 	complainants: import('./Student').StudentProps[],
 * 	complainees: RecordComplainanee[],
 * 	date: Date,
 * 	placeholder?: Boolean
 * }} RecordProps
 */

class Record {
	/**
	 * @param {RecordProps} param0
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		violation,
		description,
		tags: {
			status,
			severity
		},
		complainants = [],
		complainees = [],
		date = new Date(new Date().getFullYear(), new Date().getMonth(), new
			Date().getDate() - (Math.floor(Math.random() * 10) + 1)),
		placeholder = false
	}) {
		// Initialize the record properties
		this.id = id;
		this.violation = violation;
		this.description = description;
		this.tags = {
			status,
			severity
		};
		this.complainants = complainants;
		this.complainees = complainees;
		this.date = date;
		this.placeholder = placeholder;
	};
};

export default Record;
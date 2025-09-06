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
 * 	id: Number | String,
 * 	violation: String,
 * 	description: String,
 * 	tags: {
 * 		status: RecordStatus,
 * 		severity: RecordSeverity,
 * 		progress: Number
 * 	},
 * 	complainants: import('./Student').StudentProps[],
 * 	complainees: RecordComplainanee[],
 * 	date: Date
 * }} RecordProps
 */

class Record {
	/**
	 * @param {RecordProps} props
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		violation,
		description,
		tags: {
			status,
			severity,
			progress = 0
		},
		complainants = [],
		complainees = [],
		date = new Date(new Date().getFullYear(), new Date().getMonth(), new
			Date().getDate() - (Math.floor(Math.random() * 10) + 1))
	}) {
		// Initialize the record properties
		this.id = id;
		this.violation = violation;
		this.description = description;
		this.tags = {
			status,
			severity,
			progress
		};
		this.complainants = complainants;
		this.complainees = complainees;
		this.date = date;
	};
};

export default Record;
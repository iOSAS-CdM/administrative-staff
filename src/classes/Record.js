/** @typedef {'ongoing' | 'resolved' | 'archived'} RecordStatus */
/** @typedef {'minor' | 'major' | 'severe'} RecordSeverity */

/**
 * @typedef {{
 * 	id?: Number | String,
 * 	recordId: String,
 * 	violation: String,
 * 	description: String,
 * 	tags: {
 * 		status: RecordStatus,
 * 		severity: RecordSeverity,
 * 		occurances: Number
 * 	},
 * 	complainants: import('./Student').StudentProps[],
 * 	complainees: import('./Student').StudentProps[],
 * 	date: Date
 * }} RecordProps
 */

class Record {
	/**
	 * @param {RecordProps} param0
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		recordId,
		violation,
		description,
		tags: {
			status,
			severity,
			occurances
		},
		complainants = [],
		complainees = [],
		date = new Date(new Date().getFullYear(), new Date().getMonth(), new
			Date().getDate() - (Math.floor(Math.random() * 10) + 1))
	}) {
		// Initialize the record properties
		this.id = id;
		this.recordId = recordId;
		this.violation = violation;
		this.description = description;
		this.tags = {
			status,
			severity,
			occurances
		};
		this.complainants = complainants;
		this.complainees = complainees;
		this.date = date;
	};
};

export default Record;
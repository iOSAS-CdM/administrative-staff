/**
 * @typedef {import('./Record').RecordProps} DisciplinaryEventProps
 */
/**
 * @typedef {{ id: Number | Student }} AnnouncementEventProps
 */

/**
 * @typedef {{
 * 	id: Number | String;
 * }} BaseEventProps
 */

/** @typedef {BaseEventProps & { type: 'disciplinary', content: DisciplinaryEventProps}} DisciplinaryEvent */
/** @typedef {BaseEventProps & { type: 'announcement', content: AnnouncementEventProps}} AnnouncementEvent */

/** @typedef {DisciplinaryEvent |  AnnouncementEvent} EventProps */

class Event {
	/**
	 * @param {EventProps} props
	 */
	constructor({
		id = Math.floor(Math.random() * 1000000),
		type,
		content
	}) {
		this.id = id;
		this.type = type;
		this.content = content;
	};
};

export default Event;
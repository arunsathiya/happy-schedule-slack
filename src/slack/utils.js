const getTheDateBlocks = date => {
    return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":calendar: Pick a date to find its schedule."
			},
			"accessory": {
				"type": "datepicker",
				"initial_date": `${date}`,
				"placeholder": {
					"type": "plain_text",
					"text": "Select a date",
					"emoji": true
				}
			}
		}
	]
}

const afkDayBlocks = (content, date) => {
    return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${content}`
			}
		},
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": ":calendar: Pick a date to find its schedule."
			},
			"accessory": {
				"type": "datepicker",
				"initial_date": `${date}`,
				"placeholder": {
					"type": "plain_text",
					"text": "Select a date",
					"emoji": true
				}
			}
		}
	]
}

const postToThreadBlocks = content => {
    return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": `${content}`
			}
		}
	]
}

const addEmojiToName = item => {
	const replaceMap = new Map([
		['Woo Tickets', ':woo: :zendesk2: Woo Tickets'],
		['Woo Chat Reserve', ':woo: :chat-blue: Woo Chat Reserve'],
		['Woo Chat', ':woo: :chat-green: Woo Chat'],
		['Woo Escalated Tickets', ':woo: :zendesk2: Woo Escalated Tickets'],
		['Woo Forums', ':woo: :chat: Woo Forums'],
		['WP Tickets', ':wordpress: :zendesk2: WPcom Tickets'],
		['WP Reserve', ':wordpress: :chat-blue: WPcom Chat Reserve'],
		['WP Chat', ':wordpress: :chat-green: WPcom Chat'],
		['WP Concierge', ':wordpress: :zoom: WPcom Concierge'],
		['WP Project', ':wordpress: WPcom Project'],
		['WP Tickets (Low)', ':wordpress: WPcom Tickets (Low)'],
		['JP Tickets', ':jetpack: :zendesk2: JP Tickets'],
		['JP Ticket Reserve', ':jetpack: :zendesk2: JP Ticket Reserve'],
		['JP Reserve', ':jetpack: :chat-blue: JP Reserve'],
		['JP Sat', ':jetpack: JP Sat'],
		['JP Project', ':jetpack: JP Project'],
	])

	return replaceMap.get(item)
}

const introMessageBlocks = (content) => {
	return [
		{
			"type": "section",
			"text": {
				"type": "plain_text",
				"text": `${content}`,
				"emoji": true
			}
		},
		{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"style": "primary",
					"text": {
						"type": "plain_text",
						"text": "Send now",
						"emoji": true,
					},
					"value": `send_now`
				},
				{
					"type": "button",
					"style": "danger",
					"text": {
						"type": "plain_text",
						"text": "Send later",
						"emoji": true,
					},
					"value": "send_later"
				}
			]
		}
	]
}

const convertToUtc = item => {
	let dateTimeString = item
	let utcHours, utcMinutes

	let date = dateTimeString.split('T')[0]
	let newDate = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6)
	let time = dateTimeString.split('T')[1].slice(0, -1)
	let newTime = time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4)
	
	let dateObject = new Date(Date.parse(newDate + 'T' + newTime + 'Z'))

	if (dateObject.getUTCHours() < 10) {
		utcHours = '0' + dateObject.getUTCHours()
	} else {
		utcHours = dateObject.getUTCHours()
	}

	if (dateObject.getUTCMinutes() < 10) {
		utcMinutes = '0' + dateObject.getUTCMinutes()
	} else {
		utcMinutes = dateObject.getUTCMinutes()
	}

	let utcResult = utcHours + '' + utcMinutes

	return utcResult
}

const convertToLocal = (item, timezone) => {
	let dateTimeString = item
	let hours, minutes

	let date = dateTimeString.split('T')[0]
	let newDate = date.slice(0, 4) + '-' + date.slice(4, 6) + '-' + date.slice(6)
	let time = dateTimeString.split('T')[1].slice(0, -1)
	let newTime = time.slice(0, 2) + ':' + time.slice(2, 4) + ':' + time.slice(4)
	
	let dateObject = new Date(Date.parse(newDate + 'T' + newTime + 'Z'))

	let localeString = dateObject.toLocaleString(`en-US`, { timeZone: timezone })
	let localeObject = new Date(localeString)

	if (localeObject.getHours() < 10) {
		hours = '0' + localeObject.getHours()
	} else {
		hours = localeObject.getHours()
	}

	if (localeObject.getMinutes() < 10) {
		minutes = '0' + localeObject.getMinutes()
	} else {
		minutes = localeObject.getMinutes()
	}

	let result = hours + '' + minutes

	return result
}

const convertToUtcFake = item => {
	let getTheTime = item.match(/\T(.*)\Z/).pop()
	let getHourMinute = getTheTime.slice(0, 4)

	return getHourMinute
}

const getAcronym = item => {
	let matches = item.match(/\b(\w)/g)
	let acronym = matches.join(``)
	
	return acronym
}

const buildTheScheduleBlocks = (result, selectedDate, utcOrLocal, timezone) => {
	let scheduleList = ''
	let convertTimezone

	result.sort((a, b) => {
		var keyA = convertToUtcFake(a.startDate)
		var keyB = convertToUtcFake(b.startDate)

		if (keyA < keyB) return -1;
		if (keyA > keyB) return 1;
		return 0;
	})

	if (utcOrLocal.includes(`utc`)) {
		result.forEach(item => {
			convertTimezone = `{
				"type": "actions",
				"elements": [
					{
						"type": "button",
						"text": {
							"type": "plain_text",
							"text": ":clock1: Convert to local timezone",
							"emoji": true
						},
						"value": "convert_to_local_timezone__${selectedDate}"
					}
				]
			}`

			scheduleList += `{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "${addEmojiToName(item.summary)}"
				}
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": "${convertToUtc(item.startDate)} UTC - ${convertToUtc(item.endDate)} UTC :earth_africa:"
					}
				]
			},`
		})
	} else {
		convertTimezone = `{
			"type": "actions",
			"elements": [
				{
					"type": "button",
					"text": {
						"type": "plain_text",
						"text": ":earth_africa: Convert to UTC timezone",
						"emoji": true
					},
					"value": "convert_to_utc_timezone__${selectedDate}"
				}
			]
		}`

		result.forEach(async item => {
			scheduleList += `{
				"type": "section",
				"text": {
					"type": "mrkdwn",
					"text": "${addEmojiToName(item.summary)}"
				}
			},
			{
				"type": "context",
				"elements": [
					{
						"type": "mrkdwn",
						"text": "${convertToLocal(item.startDate, timezone.user.tz)} ${getAcronym(timezone.user.tz_label)} - ${convertToLocal(item.endDate, timezone.user.tz)} ${getAcronym(timezone.user.tz_label)}"
					}
				]
			},`
		})
	}

	let scheduleDate = `{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": "Your schedule for ${selectedDate} is below :arrow_down:"
		}
	}`

	let chooseDate = `{
		"type": "section",
		"text": {
			"type": "mrkdwn",
			"text": ":calendar: Pick a date to find its schedule."
		},
		"accessory": {
			"type": "datepicker",
			"initial_date": "${selectedDate}",
			"placeholder": {
				"type": "plain_text",
				"text": "Select a date",
				"emoji": true
			}
		}
	}`

	let finalMessage = `[ ${scheduleDate}, ${scheduleList} ${convertTimezone}, ${chooseDate} ]`

	return finalMessage
}

export { getTheDateBlocks, postToThreadBlocks, buildTheScheduleBlocks, introMessageBlocks, afkDayBlocks }
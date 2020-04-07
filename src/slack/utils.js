const getTheDateBlocks = date => {
    return [
		{
			"type": "section",
			"text": {
				"type": "mrkdwn",
				"text": "Pick a date to find its schedule."
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
				"text": "Pick a date to find its schedule."
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
		['Woo Tickets', ':woologo: :zendesk2: Woo Tickets'],
		['Woo Chat Reserve', ':woologo: :chat-blue: Woo Chat Reserve'],
		['Woo Chat', ':woologo: :chat-green: Woo Chat'],
		['WP Tickets', ':wordpress: :zendesk2: WPcom Tickets'],
		['WP Reserve', ':wordpress: :chat-blue: WPcom Chat Reserve'],
		['WP Chat', ':wordpress: :chat-green: WPcom Chat'],
		['Jetpack Tickets', ':jetpack: :zendesk2: Jetpack Tickets'],
		['Jetpack Chat Reserve', ':jetpack: :chat-blue: Jetpack Chat Reserve'],
		['Jetpack Chat', ':jetpack: :chat-green: Jetpack Chat'],
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
	let getTheTime = item.match(/\T(.*)\Z/).pop()
	let getHourMinute = getTheTime.slice(0, 4)
	return getHourMinute
}

const buildTheScheduleBlocks = (items, selectedDate) => {
	let scheduleList = ''

	items.forEach(item => {
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
					"text": "${convertToUtc(item.startDate)} UTC - ${convertToUtc(item.endDate)} UTC"
				}
			]
		},`
	})

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
			"text": "Pick a date to find its schedule."
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

	let finalMessage = `[ ${scheduleDate}, ${scheduleList} ${chooseDate} ]`

	return finalMessage
}

export { getTheDateBlocks, postToThreadBlocks, buildTheScheduleBlocks, introMessageBlocks, afkDayBlocks }
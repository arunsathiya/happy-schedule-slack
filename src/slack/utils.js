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
	if (item.includes(`Woo`)) {
		return item.replace(`Woo`, `:woologo: Woo`)
	} else if (item.includes(`JP`)) {
		return item.replace(`JP`, `:jetpack: JP`)
	} else if (item.includes(`WP`)) {
		return item.replace(`WP`, `:wp: WP`)
	} else {
		return item
	}
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

const buildTheMessageBlocks = (items, selectedDate) => {
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

export { getTheDateBlocks, postToThreadBlocks, buildTheMessageBlocks, introMessageBlocks, afkDayBlocks }
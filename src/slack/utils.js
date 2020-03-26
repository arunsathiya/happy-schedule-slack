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

const getAnotherDateBlocks = (content, date) => {
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

const buildTheMessageBlocks = (items, selectedDate) => {
	let finalMessage = ''

	items.forEach(item => {
		finalMessage += `{ "type": "section", "text": { "type": "mrkdwn", "text": "${addEmojiToName(item.summary)}" } }, { "type": "context", "elements": [ { "type": "mrkdwn", "text": "${item.startDate} - ${item.endDate}" } ] },\n`
	})

	let textToStartWith = `{ "type": "section", "text": { "type": "mrkdwn", "text": "Your schedule for ${selectedDate} is below :arrow_down:" } }`

	finalMessage = `[ ${textToStartWith}, ${finalMessage} ]`

	return finalMessage
}

export { getTheDateBlocks, postToThreadBlocks, buildTheMessageBlocks, getAnotherDateBlocks }
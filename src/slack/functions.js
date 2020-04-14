import { getTheDateBlocks, postToThreadBlocks, buildTheScheduleBlocks, introMessageBlocks, afkDayBlocks } from "./utils"
import { slackBotToken } from "../../config";
import { convertToJson } from "../functions";

export let getTheDate = async (json) => {
    let dataForFetch, slackApiUrl

    var today = new Date();
    var date = today.getFullYear() + '-' + (("0" + (today.getMonth() + 1)).slice(-2)) + '-' + today.getDate();

    slackApiUrl = `https://slack.com/api/chat.postEphemeral`

    if (json.type === `message_action`) {
        // this check is to see if the message is from a channel or from a thread, and respond accordingly
        if (!json.message.thread_ts) {
            dataForFetch = {
                channel: json.channel.id, // this check is to handle data for shortcuts
                blocks: getTheDateBlocks(date),
                user: json.user.id,
            }
        } else {
            dataForFetch = {
                channel: json.channel.id, // this check is to handle data for shortcuts
                blocks: getTheDateBlocks(date),
                user: json.user.id,
                thread_ts: json.message.thread_ts,
            }
        }
    } else {
        dataForFetch = {
            channel: json.channel_id, // for requests from the slash command
            blocks: getTheDateBlocks(date),
            user: json.user_id
        }
    }

    let optionsForFetch = {
        'method': `POST`,
        'body': JSON.stringify(dataForFetch),
        'headers': {
            'Authorization': `Bearer ${slackBotToken}`,
            'Content-Type': 'application/json',
        }
    }

    let response = await fetch(slackApiUrl, optionsForFetch)
    return response
}

export let handleDateInput = async (json, selectedDate) => {
    const kvGet = await HAPPY_SCHEDULE.get(json.user.id, `json`)

    const calendarData = await convertToJson(`${kvGet.calendar_link}`)

    const result = calendarData.filter(item => {
        return item.startDate.includes(`${selectedDate}`)
    })

    if (Object.keys(result).length === 0) {
        return `No shifts found. Perhaps your AFK day?`
    } else {
        return result
    }
}

export let postShifts = async (json, result, selectedDate, utcOrLocal) => {
    let blocks, slackApiUrl, dataForFetch, optionsForFetch

    slackApiUrl = json.response_url

    if (result.includes(`AFK day`)) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (("0" + (today.getMonth() + 1)).slice(-2)) + '-' + today.getDate();
        blocks = afkDayBlocks(result, date)
    } else {
        if (utcOrLocal.includes(`utc`)) {
            blocks = buildTheScheduleBlocks(result, selectedDate, `utc`)
        } else {
            let timezone = await getTimezone(json.user.id)
            blocks = buildTheScheduleBlocks(result, selectedDate, `local`, timezone)
        }
    }

    dataForFetch = {
        blocks: blocks
    }

    optionsForFetch = {
        'method': `POST`,
        'body': JSON.stringify(dataForFetch),
        'headers': {
            'Authorization': `Bearer ${slackBotToken}`,
            'Content-Type': 'application/json',
        }
    }

    let response = await fetch(slackApiUrl, optionsForFetch)
    return response
}

export let postReply = async (json, content, inlineResponse, utcOrLocal) => {
    let blocks, slackApiUrl, dataForFetch, optionsForFetch

    if (content.includes(`don't have your calendar`)) {
        blocks = introMessageBlocks(content)
    } else if (content.includes(`received your calendar`)) {
        var today = new Date();
        var date = today.getFullYear() + '-' + (("0" + (today.getMonth() + 1)).slice(-2)) + '-' + today.getDate();
        blocks = getTheDateBlocks(date)
    } else {
        blocks = postToThreadBlocks(content)
    }

    if (inlineResponse) {
        slackApiUrl = json.response_url
        dataForFetch = {
            blocks: blocks
        }
    } else {
        if (json.container) {
            slackApiUrl = `https://slack.com/api/chat.postEphemeral`

            dataForFetch = {
                user: json.user.id,
                channel: json.container.channel_id,
                thread_ts: json.container.thread_ts,
                blocks: blocks
            }
        } else if (json.message) {
            slackApiUrl = `https://slack.com/api/chat.postEphemeral`

            if (!json.message.thread_ts) {
                dataForFetch = {
                    user: json.user.id,
                    channel: json.channel.id,
                    blocks: blocks
                }
            } else {
                dataForFetch = {
                    user: json.user.id,
                    channel: json.channel.id,
                    thread_ts: json.message.ts,
                    blocks: blocks
                }
            }
        } else {
            slackApiUrl = `https://slack.com/api/chat.postEphemeral`

            if (json.channel_id) {
                dataForFetch = {
                    user: json.user_id,
                    channel: json.channel_id,
                    blocks: blocks
                }
            } else {
                dataForFetch = {
                    user: json.user.id,
                    channel: json.channel,
                    thread_ts: json.ts,
                    blocks: blocks
                }
            }
        }
    }

    optionsForFetch = {
        'method': `POST`,
        'body': JSON.stringify(dataForFetch),
        'headers': {
            'Authorization': `Bearer ${slackBotToken}`,
            'Content-Type': 'application/json',
        }
    }

    let response = await fetch(slackApiUrl, optionsForFetch)
    return response
}

export let getTheCalendarLink = async (json) => {
    let slackApiUrl, dataForFetch

    slackApiUrl = `https://slack.com/api/views.open`

    dataForFetch = {
        trigger_id: json.trigger_id,
        view: JSON.stringify({
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Happy Schedule",
                "emoji": true
            },
            "submit": {
                "type": "plain_text",
                "text": "Submit",
                "emoji": true
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": true
            },
            "blocks": [
                {
                    "type": "input",
                    "element": {
                        "type": "plain_text_input",
                        "action_id": "calendar_url_input",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Enter your calendar URL"
                        }
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Calendar URL"
                    },
                    "hint": {
                        "type": "plain_text",
                        "text": "You can find it on your Happiness Scheduler's integrations page"
                    }
                }
            ],
            "notify_on_close": true
        })
    }

    let optionsForFetch = {
        'method': `POST`,
        'body': JSON.stringify(dataForFetch),
        'headers': {
            'Authorization': `Bearer ${slackBotToken}`,
            'Content-Type': 'application/json',
        }
    }

    let response = await fetch(slackApiUrl, optionsForFetch)
    return response
}

export let isMember = async (channelId) => {
    let optionsForFetch, slackApiUrl

    slackApiUrl = `https://slack.com/api/conversations.members?channel=${channelId}`

    optionsForFetch = {
        'method': `GET`,
        'headers': {
            'Authorization': `Bearer ${slackBotToken}`,
            'Content-Type': `application/x-www-form-urlencoded`
        }
    }

    let response = await fetch(slackApiUrl, optionsForFetch)
    return response
}

export let getTimezone = async (userId) => {
    let optionsForFetch, slackApiUrl

    slackApiUrl = `https://slack.com/api/users.info?user=${userId}`

    optionsForFetch = {
        'method': `GET`,
        'headers': {
            'Authorization': `Bearer ${slackBotToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    }

    let response = await fetch(slackApiUrl, optionsForFetch)
    response = await response.json()
    
    return response
} 
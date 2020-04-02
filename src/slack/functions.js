import { getTheDateBlocks, postToThreadBlocks, buildTheMessageBlocks, introMessageBlocks, afkDayBlocks } from "./utils"
import { slackBotToken } from "../../config";

export let getTheDate = async (json) => {
    let dataForFetch
    var today = new Date();
    var date = today.getFullYear()+'-'+(("0" + (today.getMonth() + 1)).slice(-2))+'-'+today.getDate();
    let slackApiUrl = `https://slack.com/api/chat.postMessage`
    if (json.event) {
        dataForFetch = {
            username: `Happy Schedule`,
            icon_emoji: `:happy-schedule:`,
            channel: json.event.channel,
            thread_ts: json.event.ts,
            blocks: getTheDateBlocks(date)
        }
    } else {
        dataForFetch = {
            username: `Happy Schedule`,
            icon_emoji: `:happy-schedule:`,
            channel: json.channel,
            thread_ts: json.ts,
            blocks: getTheDateBlocks(date)
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

export let postToThread = async (json, content, inlineResponse) => {
    let blocks, slackApiUrl, dataForFetch

    if (content[0].summary) {
        blocks = buildTheMessageBlocks(content, json.actions[0].selected_date)
    } else if (content.includes(`don't have your calendar`)) {
        blocks = introMessageBlocks(content)
    } else if (content.includes(`received your calendar`)) {
        var today = new Date();
        var date = today.getFullYear()+'-'+(("0" + (today.getMonth() + 1)).slice(-2))+'-'+today.getDate();
        blocks = getTheDateBlocks(date)   
    } else if (content.includes(`AFK day`)) {
        var today = new Date();
        var date = today.getFullYear()+'-'+(("0" + (today.getMonth() + 1)).slice(-2))+'-'+today.getDate();
        blocks = afkDayBlocks(content, date)
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
            slackApiUrl = `https://slack.com/api/chat.postMessage`
            dataForFetch = {
                username: `Happy Schedule`,
                icon_emoji: `:happy-schedule:`,
                channel: json.container.channel_id,
                thread_ts: json.container.thread_ts,
                blocks: blocks
            }
        } else {
            slackApiUrl = `https://slack.com/api/chat.postMessage`
            dataForFetch = {
                username: `Happy Schedule`,
                icon_emoji: `:happy-schedule:`,
                channel: json.channel,
                thread_ts: json.ts,
                blocks: blocks
            }
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
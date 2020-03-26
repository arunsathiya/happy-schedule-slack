import { getTheDateBlocks, postToThreadBlocks, getAnotherDateBlocks, buildTheMessageBlocks } from "./utils"
import { slackBotToken } from "../../config";

export let getTheDate = async (json) => {
    var today = new Date();
    var date = today.getFullYear()+'-'+(("0" + (today.getMonth() + 1)).slice(-2))+'-'+today.getDate();
    let slackApiUrl = `https://slack.com/api/chat.postMessage`
    let dataForFetch = {
        channel: json.channel,
        thread_ts: json.ts,
        blocks: getTheDateBlocks(date)
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

export let postToThread = async (json, content, inlineResponse, getAnotherDate) => {
    let blocks, slackApiUrl, dataForFetch

    if (content[0].summary) {
        blocks = buildTheMessageBlocks(content, json.actions[0].selected_date)
    } else {
        if (getAnotherDate) {
            var today = new Date();
            var date = today.getFullYear()+'-'+(("0" + (today.getMonth() + 1)).slice(-2))+'-'+today.getDate();
            blocks = getAnotherDateBlocks(content, date)
        } else {
            blocks = postToThreadBlocks(content)
        }
    }

    if (inlineResponse) {
        slackApiUrl = json.response_url
        dataForFetch = {
            blocks: blocks
        }
    } else {
        slackApiUrl = `https://slack.com/api/chat.postMessage`
        dataForFetch = {
            username: `Happy Schedule`,
            icon_emoji: `:happy-schedule:`,
            channel: json.container.channel_id,
            thread_ts: json.container.thread_ts,
            blocks: blocks
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
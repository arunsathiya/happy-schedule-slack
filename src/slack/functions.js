import { getTheDateBlocks, postToThreadBlocks, buildTheMessage } from "./utils"
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

export let postToThread = async (json, content) => {
    let blocks
    let slackApiUrl = json.response_url

    if (content[0].summary) {
        blocks = buildTheMessage(content)
    } else {
        blocks = postToThreadBlocks(content)
    }

    let dataForFetch = {
        blocks: blocks
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
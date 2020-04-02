import { postToThread, getTheDate } from "../../slack/functions"
import { queryStringToJson } from "../../functions"

export default async request => {
    try {
        const requestText = await request.text()
        let json = await queryStringToJson(requestText)

        if (json.user_id) {
            const kvGet = await HAPPY_SCHEDULE.get(json.user_id)
            const kvObject = JSON.parse(kvGet)
            
            if (kvGet === null) {
                await HAPPY_SCHEDULE.put(json.user_id, JSON.stringify( {
                    user: json.user_id,
                    first_time: `yes`,
                } ))
                
                await postToThread(json, `Hi! 👋\n\nI am a Slack bot to help you find your work shifts from Happiness Scheduler.\n\nI don't have your calendar URL. If you send it in your next response, I shall store it and reuse it in the future.`, true)
            } else if ( !kvObject.calendar_link ) {
                await postToThread(json, `I don't have your calendar URL. If you send it now, I shall store it and reuse it in the future.`, true)
            } else {
                await getTheDate(json)
            }
        }

        return new Response(``, { status: 200 }) 
    } catch (error) {
        return new Response(`Error: ${error}`, { status: 500 }) 
    }
}
import { getTheDate, postToThread } from "../slack/functions"

export default async request => {
    const body = await request.text()
    const { event } = JSON.parse(body)

    try {
        if (event.type === `app_mention`) {
            if (event.user) {
                const kvGet = await HAPPY_SCHEDULE.get(event.user)
                const kvObject = JSON.parse(kvGet)
                
                if (kvGet === null) {
                    await HAPPY_SCHEDULE.put(event.user, JSON.stringify( {
                        user: event.user,
                        first_time: `yes`,
                        have_calendar_link: `no` 
                    } ))
                    
                    await postToThread(event, `Hi! 👋\n\nI am a Slack bot to help you find your work shifts from Happiness Scheduler.\n\nI don't have your calendar URL. If you send it in your next response, I shall store it and reuse it in the future.`)
                } else if (kvObject.have_calendar_link === `no`) {
                    await postToThread(event, `I don't have your calendar URL. If you send it now, I shall store it and reuse it in the future.`)
                } else {
                    await getTheDate(event)
                }
            }
            return new Response(`Done.`, { status: 200 }) 
        } else if (event.type === `message`) {
            if (event.user) {
                await postToThread(event, `I cannot respond to private messags.`)
            }
            return new Response(`OK`, { status: 200 }) 
        } else {
            return new Response(`Not an event.`, { status: 200 }) 
        }
    } catch (error) {
        return new Response(`Error: ${error}`, { status: 500 })
    }
}
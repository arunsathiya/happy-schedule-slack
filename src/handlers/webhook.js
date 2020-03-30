import { getTheDate, postToThread } from "../slack/functions"

export default async request => {
    const body = await request.text()
    const { event } = JSON.parse(body)

    try {
        if (event.type === `app_mention`) {
            if (event.user) {
                await getTheDate(event)
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
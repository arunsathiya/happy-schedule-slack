import { getTheDate } from "../slack/functions"

export default async request => {
    const body = await request.text()
    const { event } = JSON.parse(body)

    try {
        if (event.type && event.type === `app_mention`) {
            await getTheDate(event)
            return new Response(`Done.`, { status: 200 }) 
        } else {
            return new Response(`Not an event.`, { status: 200 }) 
        }
    } catch (error) {
        return new Response(`Error: ${error}`, { status: 500 })
    }
}
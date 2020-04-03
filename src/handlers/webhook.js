import { getTheDate, postToThread } from "../slack/functions"

export default async request => {
    const body = await request.text()
    const { event } = JSON.parse(body)

    try {
        if (event.type === `message`) {
            if (event.user) {
                await postToThread(event, `I cannot respond to private messages. But you can use the slash command on this message channel (not on threads though)!`)
            }
            return new Response(`OK`, { status: 200 }) 
        } else {
            return new Response(`Not an event.`, { status: 200 }) 
        }
    } catch (error) {
        return new Response(`Error: ${error}`, { status: 500 })
    }
}
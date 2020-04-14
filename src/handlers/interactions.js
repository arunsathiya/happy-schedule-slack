import { convertToJson } from "../functions"
import { postReply, getTheCalendarLink, getTheDate, handleDateInput, postShifts, getUserInfo } from "../slack/functions"

export default async request => {
    var formDataBody = await request.formData()
    var jsonOld = Object.fromEntries(formDataBody)
    var json = JSON.parse(jsonOld.payload)

    try {
        if (json.type === `block_actions`) {
            if (json.actions[0].type === `datepicker`) {
                let selectedDate = json.actions[0].selected_date
                let convertedDate = selectedDate.replace(/-/g, ``)
                const result = await handleDateInput(json, convertedDate)
                await postShifts(json, result, selectedDate, `utc`)
                return new Response(``, { status: 200 }) 
            } else if (json.actions[0].value.includes(`send_now`)) {
                await HAPPY_SCHEDULE.put(json.user.id, JSON.stringify( {
                    user: json.user.id,
                    first_time: `no`,
                    response_url: json.response_url,
                } ))
                
                await postReply(json, `Thanks!`, true);
                await getTheCalendarLink(json)

                return new Response(``, { status: 200 }) 
            } else if (json.actions[0].value.includes(`send_later`)) {
                await HAPPY_SCHEDULE.put(json.user.id, JSON.stringify( {
                    user: json.user.id,
                    first_time: `no`,
                    response_url: json.response_url
                } ))

                await postReply(json, `Sure!`, true)

                return new Response(``, { status: 200 }) // note the empty body here. Slack needs a 200 OK with empty body
            } else if (json.actions[0].value.includes(`convert_to_local_timezone`)) {
                let selectedDate = json.actions[0].value.split(`__`)[1]
                let convertedDate = selectedDate.replace(/-/g, ``)
                const result = await handleDateInput(json, convertedDate) 
                await postShifts(json, result, selectedDate, `local`)
                return new Response(``, { status: 200 })
            } else if (json.actions[0].value.includes(`convert_to_utc_timezone`)) {
                let selectedDate = json.actions[0].value.split(`__`)[1]
                let convertedDate = selectedDate.replace(/-/g, ``)
                const result = await handleDateInput(json, convertedDate) 
                await postShifts(json, result, selectedDate, `utc`)
                return new Response(``, { status: 200 })
            }
        } else if (json.type === `view_submission`) {
            const kvGet = await HAPPY_SCHEDULE.get(json.user.id)
            const kvObject = JSON.parse(kvGet)

            var calendarUrl;

            for (var key in json.view.state.values) {
                calendarUrl = json.view.state.values[key].calendar_url_input.value.toString().trim()

                await HAPPY_SCHEDULE.put(json.user.id, JSON.stringify({
                    user: json.user.id,
                    first_time: `no`,
                    calendar_link: `${calendarUrl}`
                }))
            }

            await postReply(kvObject, `Done! I have received your calendar link.`, true)

            return new Response(``, { status: 200 }) // note the empty body here. Slack needs a 200 OK with empty body
        } else if (json.type === `view_closed`) {
            const kvGet = await HAPPY_SCHEDULE.get(json.user.id)
            const kvObject = JSON.parse(kvGet)

            await postReply(kvObject, `I don't have your calendar URL so far. I need it to process any shift lookups.`, true)

            return new Response(``, { status: 200 }) // note the empty body here. Slack needs a 200 OK with empty body
        } else if (json.type === `message_action` && json.callback_id === `happy_schedule_shortcut`) {
            if (json.user) {
                // this check is to handle shortcut interaction on a channel message (not a thread message)
                if (!json.message.thread_ts) {
                    const kvGet = await HAPPY_SCHEDULE.get(json.user.id)
                    const kvObject = JSON.parse(kvGet)
                    
                    if (kvGet === null) {
                        await HAPPY_SCHEDULE.put(json.user.id, JSON.stringify( {
                            user: json.user.id,
                            first_time: `yes`,
                        } ))
                        
                        await postReply(json, `Hi! 👋\n\nI am a Slack bot to help you find your work shifts from Happiness Scheduler.\n\nI don't have your calendar URL. If you send it in your next response, I shall store it and reuse it in the future.`)
                    } else if ( !kvObject.calendar_link ) {
                        await postReply(json, `I don't have your calendar URL. If you send it now, I shall store it and reuse it in the future.`)
                    } else {
                        await getTheDate(json)
                    }
                } else {
                    const kvGet = await HAPPY_SCHEDULE.get(json.user.id)
                    const kvObject = JSON.parse(kvGet)
                    
                    if (kvGet === null) {
                        await HAPPY_SCHEDULE.put(json.user.id, JSON.stringify( {
                            user: json.user.id,
                            first_time: `yes`,
                        } ))
                        
                        await postReply(json, `Hi! 👋\n\nI am a Slack bot to help you find your work shifts from Happiness Scheduler.\n\nI don't have your calendar URL. If you send it in your next response, I shall store it and reuse it in the future.`)
                    } else if ( !kvObject.calendar_link ) {
                        await postReply(json, `I don't have your calendar URL. If you send it now, I shall store it and reuse it in the future.`)
                    } else {
                        await getTheDate(json)
                    }
                }
            }

            return new Response(``, { status: 200 }) // note the empty body here. Slack needs a 200 OK with empty body
        }
    } catch(error) {
        return new Response(`Error: ${error}`, { status: 500 }) 
    }
}
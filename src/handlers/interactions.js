import { convertToJson } from "../functions"
import { postToThread, getTheCalendarLink, getTheDate } from "../slack/functions"

export default async request => {
    var formDataBody = await request.formData()
    var jsonOld = Object.fromEntries(formDataBody)
    var json = JSON.parse(jsonOld.payload)

    try {
        if (json && json.type === `block_actions`) {
            if (json.actions[0].type === `datepicker`) {
                let selectedDate = json.actions[0].selected_date
                let convertedDate = selectedDate.replace(/-/g, ``)

                const kvGet = await HAPPY_SCHEDULE.get(json.user.id)
                const kvObject = JSON.parse(kvGet)
                
                let calendarData = await convertToJson(`${kvObject.calendar_link}`)

                const result = calendarData.filter(item => {
                    return item.startDate.includes(`${convertedDate}`)
                })
                
                if (Object.keys(result).length === 0) {
                    await postToThread(json, `No shifts found. Perhaps your AFK day?`, true)
                } else {
                    await postToThread(json, result, true)
                }

                return new Response(``, { status: 200 }) 
            } else if (json.actions[0].value.includes(`send_now`)) {
                await HAPPY_SCHEDULE.put(json.user.id, JSON.stringify( {
                    user: json.user.id,
                    first_time: `no`,
                    calendar_link: ``,
                    response_url: json.response_url,
                } ))
                
                await postToThread(json, `Thanks!`, true);
                await getTheCalendarLink(json)

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

            await postToThread(kvObject, `Done! I have receive your calendar link.`, true)
            await getTheDate(json)

            return new Response(``, { status: 200 }) // note the empty body here. Slack needs a 200 OK with empty body
        }
    } catch(error) {
        return new Response(`Error: ${error}`, { status: 500 }) 
    }
}
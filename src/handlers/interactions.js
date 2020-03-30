import { convertToJson, ifObjectIsEmpty } from "../functions"
import { postToThread, deleteMessage, getTheCalendarLink, hardOutput } from "../slack/functions"

export default async request => {
    var formDataBody = await request.formData()
    var jsonOld = Object.fromEntries(formDataBody)
    var json = JSON.parse(jsonOld.payload)

    try {
        if (json && json.type === `block_actions`) {
            if (json.actions[0].type === `datepicker`) {
                let selectedDate = json.actions[0].selected_date
                let convertedDate = selectedDate.replace(/-/g, ``)
                
                let calendarData = await convertToJson(`https://public-api.wordpress.com/wpcom/v2/happytools/internal/v1/schedule/calendar/STZZbEtkZ0hJX2c4ZC1jNFN6VXpyY1RRblh1dXJtc0dSY1V3aFM2a29jQ1E4bXlxQU44MGRlSVd1TzVKZnc9PQ==`)

                const result = calendarData.filter(item => {
                    return item.startDate.includes(`${convertedDate}`)
                })
                
                if (Object.keys(result).length === 0) {
                    await postToThread(json, `No shifts found. Perhaps your AFK day?`, true)
                } else {
                    await postToThread(json, result, true)
                }
            } else if (json.actions[0].value.includes(`send_now`)) {
                await postToThread(json, `You chose to send the calendar URL now.`, true);
                await getTheCalendarLink(json)
            }
        } else if (json.type === `view_submission`) {
            var calendarUrl;

            for (var key in json.view.state.values) {
                calendarUrl = json.view.state.values[key].calendar_url_input.value.toString().trim()

                await HAPPY_SCHEDULE.put(json.user.id, JSON.stringify({
                    user: json.user.id,
                    first_time: `no`,
                    have_calendar_link: `yes`,
                    calendar_link: `${calendarUrl}`
                }))
            }

            return new Response(``, { status: 200 }) // note the empty body here. Slack needs a 200 OK with empty body
        }
    } catch(error) {
        return new Response(`Error: ${error}`, { status: 500 }) 
    }
}
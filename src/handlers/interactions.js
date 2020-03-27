import { convertToJson } from "../functions"
import { postToThread, deleteMessage } from "../slack/functions"

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
                
                await postToThread(json, result, true)
            }
        } 
    } catch(error) {
        return new Response(`Error: ${error}`, { status: 500 }) 
    }
}
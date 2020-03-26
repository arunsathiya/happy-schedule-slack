import { convertToJson } from "../functions"
import { postToThread } from "../slack/functions"

export default async request => {
    var formDataBody = await request.formData()
    var jsonOld = Object.fromEntries(formDataBody)
    var json = JSON.parse(jsonOld.payload)

    try {
        if (json && json.type === `block_actions`) {
            if (json.actions[0].type === `datepicker`) {
                let finalResults = ''
                let selectedDate = json.actions[0].selected_date
                let convertedDate = selectedDate.replace(`-`, ``)
                
                let calendarData = await convertToJson(`https://public-api.wordpress.com/wpcom/v2/happytools/internal/v1/schedule/calendar/STZZbEtkZ0hJX2c4ZC1jNFN6VXpyY1RRblh1dXJtc0dSY1V3aFM2a29jQ1E4bXlxQU44MGRlSVd1TzVKZnc9PQ==`)

                const resultHere = calendarData.filter(itemHere => {
                    return itemHere.startDate.includes(`20200324`)
                })

                // finalResults = `\• Start: ${resultHere[0].startDate}\n\• End: ${resultHere[0].endDate}\n\• Type of shift: ${resultHere[0].summary}\n---\n`
                
                resultHere.forEach(item => {
                    finalResults += `\• Start: ${item.startDate}\n\• End: ${item.endDate}\n\• Type of shift: ${item.summary}\n---\n`
                })
                
                await postToThread(json, finalResults)
            }
        } 
    } catch(error) {
        return new Response(`Error: ${error}`, { status: 500 }) 
    }
}
import { postToThread } from "../slack/functions"

export default async request => {
    var formDataBody = await request.formData()
    var jsonOld = Object.fromEntries(formDataBody)
    var json = JSON.parse(jsonOld.payload)

    try {
        var myHeaders = new Headers();
        myHeaders.append("Accept", "*/*");
        myHeaders.append("Cache-Control", "no-cache");
        myHeaders.append("Host", "ical-to-json.herokuapp.com");
        myHeaders.append("Accept-Encoding", "gzip, deflate, br");
        myHeaders.append("Connection", "keep-alive");

        var requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'follow'
        };

        if (json && json.type === `block_actions`) {
            if (json.actions[0].type === `datepicker`) {
                let jsonData = await fetch("https://ical-to-json.herokuapp.com/convert.json?url=https%3A%2F%2Fpublic-api.wordpress.com%2Fwpcom%2Fv2%2Fhappytools%2Finternal%2Fv1%2Fschedule%2Fcalendar%2FaEdmOHVjb2F6TWZNeGNnYnhRcHM2RmlwZjdZajFEZ1JYLTZKTDBuNmc2WDJtZVM0cnQ3R0p0dzJuN2xDMHc9PQ%3D%3D", requestOptions)
                let selectedDate = jsonData.vcalendar[0].vevent[0].dtstart
                await postToThread(json, selectedDate)
            }
            return new Response(`OK`, { status: 200 }) 
        }
    } catch(error) {
        return new Response(`Error: ${error}`, { status: 500 }) 
    }
}
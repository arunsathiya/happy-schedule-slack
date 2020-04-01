import icsToJson from 'ics-to-json'

const convertToJson = async (fileLocation) => {
    const icsRes = await fetch(fileLocation)
    const icsData = await icsRes.text()

    const data = icsToJson(icsData)
    return data
}

export { convertToJson }
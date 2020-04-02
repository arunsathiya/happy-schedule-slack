import icsToJson from 'ics-to-json'

const convertToJson = async (fileLocation) => {
    const icsRes = await fetch(fileLocation)
    const icsData = await icsRes.text()

    const data = icsToJson(icsData)
    return data
}

const queryStringToJson = async (item) => {
    var pairs = item.split('&');

    var result = {};
    pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
    });

    return JSON.parse(JSON.stringify(result))
}

export { convertToJson, queryStringToJson }
import icsToJson from 'ics-to-json'
import { slackSigningSecretValue } from '../config'
import tsscmp from 'tsscmp'

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

// source: https://fireship.io/snippets/verify-slack-api-signing-signature-node/
const legitSlackRequest = async (request) => {
  // Your signing secret
  const slackSigningSecret = `${slackSigningSecretValue}`

  // Grab the signature and timestamp from the headers
  const requestSignature = request.headers.get(`x-slack-signature`);
  const requestTimestamp = request.headers.get('x-slack-request-timestamp');

  // Create the HMAC
  const hmac = crypto.createHmac('sha256', slackSigningSecret);

  // Update it with the Slack Request
  const [version, hash] = requestSignature.split('=');
  const requestBody = await request.text();
  const base = `${version}:${requestTimestamp}:${JSON.stringify(`${requestBody}`)}`;
  hmac.update(base);

  // Returns true if it matches
  return tsscmp(hash, hmac.digest('hex'));
}


export { convertToJson, queryStringToJson, legitSlackRequest }
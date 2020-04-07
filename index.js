import webhook from './src/handlers/webhook'
import interactions from './src/handlers/interactions'
import happySchedule from './src/handlers/slash/happy-schedule'
import { legitSlackRequest } from './src/functions'

const Router = require('./router')

addEventListener('fetch', event => {
    const legit = legitSlackRequest(event.request)
    if (!legit) {
        return new Response(`Bad actor`, { status: 403 }) 
    } else {
        event.respondWith(handleRequest(event.request))
    }
})

async function handleRequest(request) {
    const app = new Router()
    // Replace with the approriate paths and handlers
    app.post('/webhook', webhook)
    app.post('/interactions', interactions)
    app.post('/slash/happy-schedule', happySchedule)

    const response = await app.route(request)
    return response
}


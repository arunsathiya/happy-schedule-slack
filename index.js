import webhook from './src/handlers/webhook'
import interactions from './src/handlers/interactions'

const Router = require('./router')

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const app = new Router()
    // Replace with the approriate paths and handlers
    app.post('/webhook', webhook)
    app.post('/interactions', interactions)

    const response = await app.route(request)
    return response
}


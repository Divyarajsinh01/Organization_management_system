require('newrelic')
const http =  require('http')
const app = require('./app/app')
const newrelic = require('newrelic')

const port = process.env.PORT || 3000
const server = http.createServer(app)

newrelic.getLinkingMetadata()

server.listen(port, (err) => {
    if (err) {
        newrelic.noticeError(err)
        console.log(`server starting error: ${err.message}`)
    }
    console.log(`server running on port: ${port}`)
})


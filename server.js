const http =  require('http')
const app = require('./app/app')

const port = process.env.PORT || 3000
const server = http.createServer(app)


server.listen(port, (err) => {
    if (err) {
        console.log(`server starting error: ${err.message}`)
    }
    console.log(`server running on port: ${port}`)
})


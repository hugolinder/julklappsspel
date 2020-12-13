const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server started. Listening at http://localhost:${port}`)
}) // you have to use backtick quotes '`' when using strings with expressions
// Host static files
app.use(express.static('public')) // files available to client
app.use(express.json({ limit: '1mb' })) // understand incoming data as JSON
// routes
app.post('/test', function (request, response) {
  console.log('I got a test post')
  console.log(request.body)
  console.log('Responding')
  response.json({
    comment: 'Thank you for your post.',
    receivedBody: request.body
  })
})

// count a number, incremented by all clients
let count = 0
app.get('/count', function (request, response) {
  count = count + 1
  const message = `The server is counting, the button  has been clicked ${count} times across all clients.`
  console.log('Responding')
  console.log(message)
  response.json(message)
})

// save to database

// authentication

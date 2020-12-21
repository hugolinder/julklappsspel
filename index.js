const express = require('express')
const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server started. Listening at http://localhost:${port}`)
}) // you have to use backtick quotes '`' when using strings with expressions
// Host static files
app.use(express.static('public')) // files available to client
app.use(express.json({ limit: '1mb' })) // understand incoming data (with 'appliaction/json' header) as JSON
// in memory is probably sufficient for dev
// Using Model-View-Controller
// The view is client-side, and requires access to the model
var model = {
  receivedCommands: [],
  diceValues: [],
  tokens: []
}
app.get('/model', (req, res) => {
  console.log('serving the model to the client')
  res.json(model)
})
// controller
app.post('/controller', (req, res) => {
  console.log('received controller command')
  var command = req.body
  // update model following command
  console.log('updating model')
  if (command.rollDice) {
    var diceValue = Math.ceil(Math.random() * 6)
    model.diceValues.push(diceValue)
  }
  command.tokens.forEach(token => {
    console.log('adding new token')
    token.id = `token${model.tokens.length}`
    model.tokens.push(token)
  })
  model.receivedCommands.push(command)
  // give feedback
  res.json({ model: model })
})

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
  diceValues: [],
  tokens: [],
  time: new Date().getTime()
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
    console.log('rolling dice')
    var diceValue = Math.ceil(Math.random() * 6)
    model.diceValues.push(diceValue)
  }
  if (command.time) {
    console.log('restarting time')
    model.time = new Date().getTime()
  }
  command.tokens.forEach(token => {
    if (!token.id) { // create a new token
      token.id = `token${model.tokens.length}`
      console.log('adding new ' + token.id)
      // randomize starting position,  % of window dimensions
      token.x = Math.random() * 100
      token.y = Math.random() * 100
      var border = 25
      // move away from edges
      token.x = Math.min(Math.max(token.x, border), 100 - border)
      token.y = Math.min(Math.max(token.y, border), 100 - border)
      // set units, percent of width/height
      token.x = token.x + 'px'
      token.y = token.y + 'px'
      console.log(`randomized position (x,y)=(${token.x}, ${token.y})`)
      model.tokens.push(token)
    } else { // changes to existing token
      console.log(`updating position of ${token.id} to (x,y)=(${token.x}, ${token.y})`)
      var tokenIndex = model.tokens.findIndex(element => element.id === token.id)
      // check that the new position is in range 0-100 %
      model.tokens[tokenIndex].x = token.x
      model.tokens[tokenIndex].y = token.y
    }
  })
  // model.receivedCommands.push(command
  // give feedback
  res.json({ model: model })
})

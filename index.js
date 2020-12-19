const express = require('express')
const Datastore = require('nedb')
const app = express()
const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server started. Listening at http://localhost:${port}`)
}) // you have to use backtick quotes '`' when using strings with expressions
// Host static files
app.use(express.static('public')) // files available to client
app.use(express.json({ limit: '1mb' })) // understand incoming data (with 'appliaction/json' header) as JSON
// in memory is probably sufficient for dev
const db = {}
db.players = new Datastore()
db.gifts = new Datastore()
// serve player key
var playerCount = 0
app.get('/player', function (request, response) {
  console.log('serving player key')
  var doc = {
    _id: playerCount,
    isConnected: true,
    timeSinceLastCall: 0,
    name: 'noName',
    game: 0
  }
  db.players.insert(doc)
  var giftDoc = {
    _id: playerCount,
    sender: playerCount,
    holder: 'table',
    position: [0, 0],
    description: `gift from player ${playerCount}`,
    game: 0
  }
  db.gifts.insert(giftDoc)
  response.json({ player: playerCount })
  playerCount = playerCount + 1
})

app.post('/call', (request, response) => {
  var player = request.body.player
  console.log(`Call from player ${player}`)
  db.players.update({ _id: player }, { $set: {timeSinceLastCall: 0 } })
  response.send('hi')
})

// counter force to detect inactive players
var timeStep = 3000
var activeThreshold = 3 * timeStep
setInterval(function () {
  console.log('Filtering players who do not call.')
  var options = {multi: true}
  db.players.update({}, { $inc: { timeSinceLastCall: timeStep } }, options)
  db.players.update({ timeSinceLastCall: { $gt: activeThreshold } }, { $set: { isConnected: false } }, options)
  db.players.find({ isConnected: false }, (err, docs) => {
    if (err) {
      console.error(err)
    }
    console.log('inactive players')
    console.log(docs.map(x => x._id))
  })
}, timeStep)

// roll the dice if it is the players turn
var round = 0
var turn = 0
function nextPlayer (turn) {
  console.log(`finding the next player at turn ${turn}`)
  db.players.find({ isConnected: true, _id: { $gt: turn } }, function (err, docs) {
    if (err) {
      console.error(err)
    }
    console.log('active players:')
    console.log(docs)
    if (docs.length === 0) {
      return 0
    } else {
      var possibleTurns = docs.map(x => x._id)
      console.log('possible turns')
      console.log(possibleTurns)
      var closestTurn = Math.min(possibleTurns)
      console.log(`the closest turn is ${closestTurn}`)
      return closestTurn
    }
  })
}
function currentPlayer (turn) {
  console.log(`finding current player at turn ${turn}`)
  // check that the player is still active
  db.players.find({ isConnected: true, _id: turn }, function (err, docs) {
    if (err) {
      console.error(err)
    }
    if (docs.length === 0) {
      return nextPlayer(turn)
    }
  })
  return turn
}
setInterval(() => console.log(`at turn ${turn} the current player is ${currentPlayer(turn)}`), 3000)

var diceRoll
app.post('/roll', function (request, response) {
  // check permission
  var player = request.body.player
  console.log(`dice request from player ${player}`)
  var current = currentPlayer(turn)
  console.log(`current player is ${current}`)
  var message = {}
  if (player === current) {
    var maxRoll = 6
    diceRoll = Math.ceil(Math.random() * maxRoll)
    message.roll = diceRoll
    message.success = diceRoll === maxRoll
  } else {
    message.succes = false
    message.note = `It is not your turn to roll. The turn is with player ${current}.`
  }
  response.json(message)
})
// If the player rolls the die successfully, then they get to pick a present. The package grabbing input is posted for sharing here.
app.post('/moveGift', function (request, response) {
})
// once a player has gotten the present, that is assed to the database and it is the next players turn.
app.post('/takeGift', function (request, response) {
  var options = {}
  db.gifts.update({ _id: request.body.gift }, { $set: { holder: request.body.gift } }, options)
  turn = nextPlayer(turn)
  response.send('The gift is yours')
})
// count a number, incremented by all clients
var count = 0
app.get('/count', function (request, response) {
  count = count + 1
  const message = `The server is counting, the button  has been clicked ${count} times across all clients.`
  console.log('Responding')
  console.log(message)
  response.json(message)
})

/*
setInterval(function () {
  db.players.find({}, (err, docs) => {
    if (err) {
      console.error(err)
    } else {
      console.log(docs)
    }
  })
}, 4000)
*/

// save to database

// authentication

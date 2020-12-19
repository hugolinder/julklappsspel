var button = document.getElementById('rollDice')
async function rollDice (player) {
  console.log(`Rolling dice as player ${player}`)
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ player: player })
  }
  const response = await fetch('/roll', options)
  const data = await response.json()
  console.log(data)
}

async function callServer (player) {
  console.log(`Calling server as player ${player}`)
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ player: player })
  }
  fetch('/call', options)
    .then(response => response.text())
    .then(data => console.log(data))
}

// get a player ID for server communication
fetch('/player')
  .then(response => response.json())
  .then(data => {
    var player = data.player
    button.addEventListener('click', event => rollDice(player))
    // Tell the server that this client/player ID is active at time intervals
    // The response could also inform if it is this client's turn
    setInterval(() => callServer(player), 3000)
    var notice = `I am player ${player}`
    console.log(notice)
  })

// get the game state from the server at time intervals
// The game state includes the location of each present, the round and turn in the round, etc.
// suggestion:
// round k turn j
// diceValue n
// table
// player presents
// ID presentID1, presentID2, presentID3
// ...
// end table

// Large resources such as images should probaböy be kept separate from the game state
// I do not want to send several images every second

// draw the game state, possibly using additional resources

// add ability to attempts to make a move (ask the server if it is your turn)

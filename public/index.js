// controls
var command = {}
function sendCommand () {
  console.log('sending command')
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  }
  fetch('/controller', options)
    .then(response => response.text())
    .then(text => console.log(text))
    .catch(err => console.error(err))
  command = {} // reset
}
var diceBtn = document.getElementById('diceBtn')
diceBtn.addEventListener('click', () => {
  command.rollDice = true
  diceBtn.textContent = 'Rolling...'
})
var playerBtn = document.getElementById('playerBtn')
playerBtn.addEventListener('click', () => {
  command.playerName = document.getElementById('name').value
  playerBtn.textContent = `${command.playerName}...`
})
var giftBtn = document.getElementById('giftBtn')
giftBtn.addEventListener('click', () => {
  command.giftLabel = document.getElementById('gift').value
  giftBtn.textContent = 'Packaging...'
})
// view
function updateView () {
  console.log('updating view')
  // get model from server
  window.fetch('/model')
    .then(response => response.json())
    .then(model => {
      // document.getElementById('modelText').textContent = JSON.stringify(model)
      document.getElementById('diceLabel').textContent = model.diceValues.pop()
      diceBtn.textContent = 'Roll the Dice'
      playerBtn.textContent = 'Create player'
      giftBtn.textContent = 'Add gift'
    })
  document.getElementById('commandText').textContent = JSON.stringify(command)
}
// game loop
var timerId
document.getElementById('submitInterval').addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId)
  }
  timerId = setInterval(function () {
    sendCommand()
    updateView()
  }, document.getElementById('interval').value)
})

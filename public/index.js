// controls
var command = {
  tokens: []
}
function commandServer () {
  console.log('sending command to server')
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(command)
  }
  fetch('/controller', options)
    .then(response => response.json())
    .then(json => {
      // update representation of model
      json.model.tokens.forEach(token => {
        if (!document.getElementById(token.id)) {
          createToken(token)
        }
      })
      document.getElementById('diceLabel').textContent = json.model.diceValues.pop()
    })
    .catch(err => console.error(err))
  command = {} // reset
  command.tokens = []
}

var diceBtn = document.getElementById('diceBtn')
diceBtn.addEventListener('click', () => {
  command.rollDice = true
  diceBtn.textContent = 'Rolling...'
})

// copy from w3schools
function dragElement (elmnt) {
  var preX, preY, dX, dY
  if (document.getElementById(elmnt.id + 'header')) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + 'header').onmousedown = dragMouseDown
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown
  }

  function dragMouseDown (e) {
    e = e || window.event
    e.preventDefault()
    // get the mouse cursor position at startup:
    preX = e.clientX
    preY = e.clientY
    document.onmouseup = closeDragElement
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag
  }

  function elementDrag (e) {
    e = e || window.event
    e.preventDefault()
    // calculate the new cursor position:
    dX = preX - e.clientX
    dY = preY - e.clientY
    preX = e.clientX
    preY = e.clientY
    // set the element's new position:
    elmnt.style.left = (elmnt.offsetLeft - dX) + 'px'
    elmnt.style.top = (elmnt.offsetTop - dY) + 'px'
  }

  function closeDragElement () {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
    command.drag = { id: elmnt.id, left: elmnt.style.left, top: elmnt.style.top }
  }
}

function createToken (template) {
  console.log('creating token')
  const token = document.createElement('div')

  /// copy from template, id
  token.id = template.id
  token.textContent = template.textContent
  token.classList.add('token')
  template.classList.forEach(x => {
    token.classList.add(x)
  })
  const origin = document.getElementById('tokenOrigin')

  document.body.insertBefore(token, origin)
  // make it draggable
  token.style.position = 'absolute'
  token.style.cursor = 'move'
  dragElement(token)
}

var playerBtn = document.getElementById('playerBtn')
playerBtn.addEventListener('click', (event) => {
  console.log('adding player')
  // in order to have consistent ID, the creation occurs in view
  var name = document.getElementById('name').value
  playerBtn.textContent = `${name}...`
  command.tokens.push({
    textContent: name,
    classList: ['player']
  })
})

var giftBtn = document.getElementById('giftBtn')
giftBtn.addEventListener('click', () => {
  command.giftLabel = document.getElementById('gift').value
  giftBtn.textContent = 'Packaging...'
})

// view
function updateView () {
  console.log('updating view')
  // reset buttons
  diceBtn.textContent = 'Roll the Dice'
  playerBtn.textContent = 'Create player'
  giftBtn.textContent = 'Add gift'
}
// game loop
var timerId
document.getElementById('submitInterval').addEventListener('click', () => {
  if (timerId) {
    clearInterval(timerId)
  }
  timerId = setInterval(function () {
    commandServer()
    updateView()
  }, document.getElementById('interval').value)
})

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
      json.model.tokens.forEach(template => {
        var token = document.getElementById(template.id)
        if (!token) {
          token = createToken(template)
        }
        // update position
        if (!token.isMoving) {
          console.log(`updating position of ${template.id} to (x,y)=(${template.x}, ${template.y})`)
          token.style.left = template.x
          token.style.top = template.y
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
  elmnt.isMoving = false
  if (document.getElementById(elmnt.id + 'header')) {
    // if present, the header is where you move the DIV from:
    document.getElementById(elmnt.id + 'header').onmousedown = pickup
  } else {
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.ontouchstart = pickup
    elmnt.onmousedown = pickup
  }

  function pickup (e) {
    e = e || window.event
    e.preventDefault()
    elmnt.isMoving = true
    // get the mouse cursor/ touch position at startup:
    if (e.clientX) {
      // mouse
      preX = e.clientX
      preY = e.clientY
    } else {
      // touches
      console.log('------------------------touch')
      preX = e.touches[0].clientX
      preY = e.touches[0].clientY
    }
    document.ontouchend = drop
    document.onmouseup = drop
    // call a function whenever the cursor moves:
    document.ontouchmove = move
    document.onmousemove = move
  }

  function move (e) {
    e = e || window.event
    e.preventDefault()
    var newX, newY
    if (elmnt.isMoving) {
      if (e.clientX) {
        // mouse event
        newX = e.clientX
        newY = e.clientY
      } else {
        // touch move - assuming a single touch point
        console.log('------------------------touch')
        newX = e.changedTouches[0].clientX
        newY = e.changedTouches[0].clientY
      }
    }
    // calculate the new cursor position:
    dX = preX - newX
    dY = preY - newY
    preX = newX
    preY = newY
    console.log('preX=' + preX + ', newX=' + newX + ', dX= ' + dX)
    console.log('preY= ' + preY + ', newY=' + newY + ', dY=' + dY)
    // set the element's new position:
    // changed from pixels to percent of window dimensions
    elmnt.style.left = (elmnt.offsetLeft - dX) * 100 / window.innerWidth + 'vw'
    elmnt.style.top = (elmnt.offsetTop - dY) * 100 / window.innerHeight + 'vh'
  }

  function drop () {
    // stop moving when mouse button is released:
    document.onmouseup = null
    document.onmousemove = null
    document.ontouchmove = null
    document.ontouchend = null
    elmnt.isMoving = false
    // record the updated position as a command
    command.tokens.push({
      id: elmnt.id,
      x: elmnt.style.left,
      y: elmnt.style.top
    })
  }
}

function createToken (template) {
  console.log('creating token')
  const token = document.createElement('div')
  document.body.appendChild(token)
  // make it draggable
  token.style.position = 'absolute'
  token.style.cursor = 'move'
  /// copy from template, id
  token.id = template.id
  token.textContent = template.textContent
  var x = template.x
  var y = template.y
  console.log(`token start position = (x,y) = (${x},${y}) `)
  token.style.left = x
  token.style.top = y
  token.classList.add('token')
  template.classList.forEach(x => {
    token.classList.add(x)
  })
  // const origin = document.getElementById('tokenOrigin')
  // document.body.insertBefore(token, origin)

  dragElement(token)
  return token
}

var playerBtn = document.getElementById('playerBtn')
playerBtn.addEventListener('click', (event) => {
  // in order to have consistent ID, the creation occurs in view
  var name = document.getElementById('name').value
  console.log('adding player ' + name)
  playerBtn.textContent = name + '...'
  command.tokens.push({
    textContent: name,
    classList: ['player']
  })
})

var giftBtn = document.getElementById('giftBtn')
giftBtn.addEventListener('click', () => {
  console.log('adding gift')
  var label = document.getElementById('gift').value
  command.tokens.push({
    textContent: label,
    classList: ['gift']
  })
  giftBtn.textContent = label + '...'
})

// view
function updateView () {
  console.log('updating view')
  // reset buttons
  diceBtn.textContent = 'Roll the Dice'
  playerBtn.textContent = 'Create player'
  giftBtn.textContent = 'Add gift'
  /*
  var gifts = document.getElementsByClassName('gift')
  for (var i = 0; i < gifts.length; i++) {
    // generate a random color
    const hue = Math.random() * 2
    const channels = [0, 1, 2]
    var distances = channels.map(x => Math.abs(x - hue) / 2)
    // distances = distances.map(dist => Math.min(dist, (2 + 1) / 2 - dist)) // cyclic to not favor the green middle channel
    // distances[1] = distances[1] * 2 // middle channel green has max distance 0.5, whilst others have max distance 1 // this creates a lot of purple
    console.log('color distances:')
    console.log(distances)
    const light = 3 * 255
    const weights = [1, 1, 1]
    const maxWeight = weights.reduce((a, b) => Math.max(a, b), 0)
    const values = channels.map(x => Math.min(255, Math.floor((1 - distances[x]) * light * weights[x] / maxWeight)))
    const randomColorNumber = values[0] * 255 * 255 + values[1] * 255 + values[2]
    const randomColor = randomColorNumber.toString(16)
    console.log('random color ' + randomColor + ' for gift ' + gifts[i].id)
    gifts[i].style.backgroundColor = '#' + randomColor
    // const complement = 255 * 255 * 255 - 1
    // gifts[i].style.color = '#' + complement.toString(16)
  }
  */
}
// game loop
var timerId = setInterval(function () {
  commandServer()
  updateView()
}, document.getElementById('interval').value)

// adjust speed
document.getElementById('submitInterval').addEventListener('click', () => {
  clearInterval(timerId)
  timerId = setInterval(function () {
    commandServer()
    updateView()
  }, document.getElementById('interval').value)
})

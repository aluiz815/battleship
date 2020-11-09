document.addEventListener("DOMContentLoaded",()=>{
  const userGrid = document.querySelector('.grid-user')
  const computerGrid = document.querySelector('.grid-computer')
  const displayGrid = document.querySelector('.grid-display')
  const ships = document.querySelectorAll('.ship')
  const destroyer = document.querySelector('.destroyer-container')
  const submarine = document.querySelector('.submarine-container')
  const cruiser = document.querySelector('.cruiser-container')
  const battleship = document.querySelector('.battle-container')
  const carrier = document.querySelector('.carrier-container')
  const startButton = document.querySelector("#start")
  const connectButton = document.querySelector("#connect")
  const rotateButton = document.querySelector("#rotate")
  const turnDisplay = document.querySelector('#whose-go')
  const infoDisplay = document.querySelector('#info')
  const userSquares = []
  const computerSquares = []
  let isHorizontal = true
  let isGameOver = false
  let currentPlayer = 'user'
  const width = 10
  let playerNumber = 0
  let ready = false
  let enemyReady = false
  let allShipsPlaced= false
  let shotFired = -1


  //Criar campo

  function criarCampo(grid,squares) {
    for (let i = 0; i < width * width; i++) {
      const quadrado = document.createElement('div')
      quadrado.dataset.id = i
      grid.appendChild(quadrado)
      squares.push(quadrado)
    }
  }


  criarCampo(userGrid,userSquares)
  criarCampo(computerGrid,computerSquares)


  const arrayNavios = [
    {
      name:"destroyer",
      directions: [
        [0,1],
        [0,width]
      ]
    },
    {
      name:"submarine",
      directions: [
        [0,1,2],
        [0,width,width*2]
      ]
    },
    {
      name:"cruiser",
      directions: [
        [0,1,2],
        [0,width,width*2]
      ]
    },
    {
      name:"battle",
      directions: [
        [0,1,2,3],
        [0,width,width*2,width*3]
      ]
    },
    {
      name:"carrier",
      directions: [
        [0,1,2,3,4],
        [0,width,width*2,width*3,width*4]
      ]
    }
  ]


//Rotacionar os Navios

function rotate() {
  if (isHorizontal) {
    destroyer.classList.toggle('destroyer-container-vertical')
    submarine.classList.toggle('submarine-container-vertical')
    cruiser.classList.toggle('cruiser-container-vertical')
    battleship.classList.toggle('battleship-container-vertical')
    carrier.classList.toggle('carrier-container-vertical')
    isHorizontal = false
    return
  }
  if (!isHorizontal) {
    destroyer.classList.toggle('destroyer-container-vertical')
    submarine.classList.toggle('submarine-container-vertical')
    cruiser.classList.toggle('cruiser-container-vertical')
    battleship.classList.toggle('battleship-container-vertical')
    carrier.classList.toggle('carrier-container-vertical')
    isHorizontal = true
    return
  }
}
rotateButton.addEventListener('click', rotate)

//Mover os navios do usuario
ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
userSquares.forEach(square => square.addEventListener('dragover', dragOver))
userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
userSquares.forEach(square => square.addEventListener('drop', dragDrop))
userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

let selectedShipNameWithIndex
let draggedShip
let draggedShipLength


ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
  selectedShipNameWithIndex = e.target.id
}))

function dragStart() {
  draggedShip = this
  draggedShipLength = this.childNodes.length
}

function dragOver(e) {
  e.preventDefault()
}

function dragEnter(e) {
  e.preventDefault()
}

function dragLeave() {
}

function dragDrop() {
  let shipNameWithLastId = draggedShip.lastChild.id
  let shipClass = shipNameWithLastId.slice(0, -2)

  let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
  let shipLastId = lastShipIndex + parseInt(this.dataset.id)


  selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

  shipLastId = shipLastId - selectedShipIndex


  const notAllowedHorizontal = [0,10,20,30,40,50,60,70,80,90,1,11,21,31,41,51,61,71,81,91,2,22,32,42,52,62,72,82,92,3,13,23,33,43,53,63,73,83,93]
  const notAllowedVertical = [99,98,97,96,95,94,93,92,91,90,89,88,87,86,85,84,83,82,81,80,79,78,77,76,75,74,73,72,71,70,69,68,67,66,65,64,63,62,61,60]
  
  let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
  let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)



  if (isHorizontal  && !newNotAllowedHorizontal.includes(shipLastId)) {
    for (let i=0; i < draggedShipLength; i++) {
      let directionClass
      if (i === 0) directionClass = 'start'
      if (i === draggedShipLength - 1) directionClass = 'end'
      userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', 'horizontal', directionClass, shipClass)
    }
  } else if (!isHorizontal&& !newNotAllowedVertical.includes(shipLastId)) {
    for (let i=0; i < draggedShipLength; i++) {
      let directionClass
        if (i === 0) directionClass = 'start'
        if (i === draggedShipLength - 1) directionClass = 'end'
        userSquares[parseInt(this.dataset.id) - selectedShipIndex + width*i].classList.add('taken', 'vertical', directionClass, shipClass)
    }
  } else return

  displayGrid.removeChild(draggedShip)
  if(!displayGrid.querySelector('.ship')) allShipsPlaced = true
}

function dragEnd() {
}


function startMultiplayer() {
    //Conexao com socket.io
    const socket = io()
    //escutando o jogador do backend e verificando se ta lotado ou se é o inimigo
    socket.on("jogador-numero", num => {
      if (num === -1) {
        infoDisplay.innerHTML = "Servidor Lotado"
      }else {
        playerNumber = parseInt(num)
        if(playerNumber === 1) currentPlayer = "enemy"
        socket.emit('check-players')
      }
    })
  
    //Vendo se outro player se conectou ou desconectou

    socket.on('conexao-jogador', num => {
      playerConectadoOuDesconectado(num)
    })


    //Inimigo pronto

    socket.on('enemy-ready', num => {
      enemyReady = true
      playerReady(num)
      if(ready) playGameMulti(socket)
    })

    //Verificar status dos players

    socket.on('check-players',players => {
      players.forEach((p,i)=> {
        if(p.connected) playerConectadoOuDesconectado(i)
        if(p.ready) {
          playerReady(i)
          if(i !== playerNumber) enemyReady = true
        }
      })
    })

    //Timeout

    socket.on('timeout',()=>{
      infoDisplay.innerHTML= 'Você chegou no limite de 10 minutos'
    })
    
    startButton.addEventListener('click',()=> {
      if(allShipsPlaced) playGameMulti(socket)
      else infoDisplay.innerHTML = "Por Favor Coloque todos os navios"
    })

    computerSquares.forEach(square => {
      square.addEventListener('click',()=>{
        if(currentPlayer === 'user' && ready && enemyReady) {
          shotFired = square.dataset.id
          socket.emit('fire',shotFired)
        }
      })
    })

    socket.on('fire', id => {
      enemyGo(id)
      const square = userSquares[id]
      socket.emit('fire-reply', square.classList)
      playGameMulti(socket)
    })

    socket.on('fire-reply', classList => {
      revealSquare(classList)
      playGameMulti(socket)
    })


    function playerConectadoOuDesconectado(num) {
      let player = `.p${parseInt(num) + 1}`
      document.querySelector(`${player} .connected span`).classList.toggle('green')
      if(parseInt(num) === playerNumber) document.querySelector(player).style.fontWeight = 'bold'
    }
    
}
function playGameMulti(socket) {
  if (isGameOver) return
  if(!ready) {
    socket.emit('player-ready')
    ready = true
    playerReady(playerNumber)
  }
  if(enemyReady) {
    if(currentPlayer === 'user') {
      turnDisplay.innerHTML= 'Sua vez'
    }
    if(currentPlayer === 'enemy'){
      turnDisplay.innerHTML = 'Vez do adversario'
    }
  }
}

function playerReady(num) {
  let player = `.p${parseInt(num)+1}`
  document.querySelector(`${player} .ready span`).classList.toggle('green')
}

connectButton.addEventListener('click',startMultiplayer)

let destroyerCount = 0
let submarineCount = 0
let cruiserCount = 0
let battleshipCount = 0
let carrierCount = 0

function revealSquare(classList) {
  const enemySquare = computerGrid.querySelector(`div[data-id='${shotFired}']`)
    const obj = Object.values(classList)
    if (!enemySquare.classList.contains('boom') && currentPlayer === 'user' && !isGameOver) {
      if (obj.includes('destroyer')) destroyerCount++
      if (obj.includes('submarine')) submarineCount++
      if (obj.includes('cruiser')) cruiserCount++
      if (obj.includes('battle')) battleshipCount++
      if (obj.includes('carrier')) carrierCount++
    }
    if (obj.includes('taken')) {
      enemySquare.classList.add('boom')
    } else {
      enemySquare.classList.add('miss')
    }
    checkForWins()
    currentPlayer = 'enemy'
}

let cpuDestroyerCount = 0
let cpuSubmarineCount = 0
let cpuCruiserCount = 0
let cpuBattleshipCount = 0
let cpuCarrierCount = 0

function enemyGo(square) {
  if (!userSquares[square].classList.contains('boom')) {
    userSquares[square].classList.add('boom')
    if (userSquares[square].classList.contains('destroyer')) cpuDestroyerCount++
    if (userSquares[square].classList.contains('submarine')) cpuSubmarineCount++
    if (userSquares[square].classList.contains('cruiser')) cpuCruiserCount++
    if (userSquares[square].classList.contains('battle')) cpuBattleshipCount++
    if (userSquares[square].classList.contains('carrier')) cpuCarrierCount++
    checkForWins()
  } else enemyGo()
  currentPlayer = 'user'
  turnDisplay.innerHTML = 'Sua Vez'
}

function checkForWins() {
  let enemy = 'inimigo'
  if (destroyerCount === 2) {
    infoDisplay.innerHTML = `Você afundou o destroyer do ${enemy}`
    destroyerCount = 10
  }
  if (submarineCount === 3) {
    infoDisplay.innerHTML = `Você afundou o submarino do ${enemy} `
    submarineCount = 10
  }
  if (cruiserCount === 3) {
    infoDisplay.innerHTML = `Você afundou o cruiser do ${enemy}`
    cruiserCount = 10
  }
  if (battleshipCount === 4) {
    infoDisplay.innerHTML = `Você afundou o battleship do ${enemy} `
    battleshipCount = 10
  }
  if (carrierCount === 5) {
    infoDisplay.innerHTML = `Você afundou o carrier do ${enemy} `
    carrierCount = 10
  }
  if (cpuDestroyerCount === 2) {
    infoDisplay.innerHTML = `O ${enemy} afundou o seu destroyer`
    cpuDestroyerCount = 10
  }
  if (cpuSubmarineCount === 3) {
    infoDisplay.innerHTML = `O ${enemy} afundou o seu submarine`
    cpuSubmarineCount = 10
  }
  if (cpuCruiserCount === 3) {
    infoDisplay.innerHTML = `O ${enemy} afundou o seu cruiser`
    cpuCruiserCount = 10
  }
  if (cpuBattleshipCount === 4) {
    infoDisplay.innerHTML = `O ${enemy} afundou o seu battleship`
    cpuBattleshipCount = 10
  }
  if (cpuCarrierCount === 5) {
    infoDisplay.innerHTML = `O ${enemy} afundou o seu carrier`
    cpuCarrierCount = 10
  }

  if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
    infoDisplay.innerHTML = "Você Ganhou"
    gameOver()
  }
  if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) === 50) {
    infoDisplay.innerHTML = `${enemy.toUpperCase()} Ganhou`
    gameOver()
  }
}

function gameOver() {
  isGameOver = true
}
})



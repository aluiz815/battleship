const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketio(server)


// pasta estatica do game

app.use(express.static(path.join(__dirname,"..","public")))

// Iniciando o servidor

server.listen(PORT,()=> console.log(`Servidor rodando na porta ${PORT}`))

// Estabelencendo conexao entre socket.io e o game

const conexoes = [null,null]

io.on('connection',socket => {
  let players = -1
  for(const i in conexoes) {
    if(conexoes[i]===null) {
      players = i
      break
    }
  }

  socket.emit("jogador-numero",players)

  if(players === -1) return

  conexoes[players] = false

  socket.broadcast.emit('conexao-jogador',players)

  // desconectar

  socket.on('disconnect', () => {
    conexoes[players] = null
    socket.broadcast.emit('conexao-jogador',players)
  })

  //escutando se player ja ta pronto

  socket.on('player-ready',()=> {
    socket.broadcast.emit('enemy-ready',players)
    conexoes[players] = true
  })

  //Verificar conexao dos players

  socket.on('check-players', () => {
    const players = []
    for (const i in conexoes) {
      conexoes[i] === null ? players.push({connected: false, ready: false}) : players.push({connected: true, ready: conexoes[i]})
    }
    socket.emit('check-players', players)
  })

  socket.on('fire', id => {
    socket.broadcast.emit('fire', id)
  })

  socket.on('fire-reply', square => {
    socket.broadcast.emit('fire-reply', square)
  })

  //Timeout de conexao maxima 
  setTimeout(()=> {
    conexoes[players] = null
    socket.emit('timeout')
    socket.disconnect()
  },600000)

})
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

io.on('connection',socket => {
  console.log('Nova Conexao')
} )
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

const app = express()
const port = 3001

const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => {
  if (!req.hasOwnProperty('helpers')) req.helpers = {}
  req.helpers.io = io

  const token = req.headers['Authorization'] || ''.replace('Bearer ', '')

  req.auth = {
    token,
    isAuthenticated: token !== ''
  }

  next()
})

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use('/auth', require('./routes/auth'))
app.use('/game', require('./routes/game'))
app.use('/challenges', require('./routes/challenges'))

server.listen(port)
module.exports = app

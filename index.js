const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = 3001

const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use((req, res, next) => {
  if (!req.hasOwnProperty('helpers')) req.helpers = {}
  req.helpers.io = io
  next()
})
app.use((err, req, res, next) => {
  console.log(err)
})
app.get('/', (req, res) => res.send('Hello World!'))
app.use('/auth', require('./routes/auth'))



server.listen(port)
module.exports = app

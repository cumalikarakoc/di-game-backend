const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')

const authenticatedPlayers = []

router.post('/login', (req, res) => {
  const playerId = req.body.playerId

  if (authenticatedPlayers.find(player => player.id === playerId) !== undefined) {
    return res.send({
      success: false,
      validation: {
        message: '',
        errors: ['User already authenticated!']
      }
    })
  }

  const localUserPath = `avatars/${playerId}.jpeg`

  if (!fs.existsSync(path.join(__dirname, '../public/' + localUserPath))) {
    return res.send({
      success: false,
      validation: {
        message: '',
        errors: ['Unknown user!']
      }
    })
  }

  const user = {
    id: playerId,
    avatarUrl: 'http://localhost:3001/' + localUserPath,
    level: 0
  }

  req.helpers.io.emit('player joined', user)
  authenticatedPlayers.push(user)

  return res.send({
    success: true,
    players: authenticatedPlayers,
    validation: {
      message: 'Welcome!',
      errors: []
    }
  })
})

module.exports = router

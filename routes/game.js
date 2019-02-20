const express = require('express')
const router = express.Router()

router.get('/start', (req, res) => {
  req.helpers.io.emit('game started')

  res.send({success: true})
})

module.exports = router

const express = require('express')
const router = express.Router()

router.post('/login', (req, res) => {
  req.helpers.io.emit('player joined', {
    avatarUrl: 'https://source.unsplash.com/random/400x400',
    userId: req.body.user_id,
    level: 0
  })

  res.send({hello: req.body.user_id});
});

module.exports = router

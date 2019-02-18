const express = require('express')
const router = express.Router()

router.post('/login', (req, res) => {
  req.helpers.io.emit('player joined', {
    user_id: req.body.user_id
  })

  res.send({hello: req.body.user_id});
});

module.exports = router

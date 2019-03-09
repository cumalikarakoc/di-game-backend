const express = require('express')
const connection = require('./../database/connection')
const router = express.Router()


router.get('/next', (req, res) => {
  if(!req.auth.isAuthenticated){
    return res.json({success: false, error: 'Unauthorized'})
  }


  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }

    connection.query(``)
  });

  connection.close();



  res.send({
    description: 'Select all users from database',
    tables: [
      {
        name: 'Users',
        columns: ['id', 'name', 'course','age'],
        rows: [
          {id: 1, name: 'Example', course: 'DMDddD',age: 18},
          {id: 2, name: 'Maarten', course: 'OOAD',age: 19}
        ]
      },
      {
        name: 'cars',
        columns: ['user_id', 'brand'],
        rows: [
          {user_id: 1, brand: 'BMW!23'},
          {user_id: 2, brand: 'Seat'}
        ]
      }
    ]
  })
})

router.get('/verify', (req, res) => {
  const {challengeId}  = req.body


})

module.exports = router

const express = require('express')
const router = express.Router()

router.get('/next', (req, res) => {
  res.send({
    description: 'Select all users from database',
    tables: [
      {
        name: 'Users',
        columns: ['id', 'name', 'course','age'],
        rows: [
          {id: 1, name: 'Example', course: 'DMDD',age: 18},
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

module.exports = router

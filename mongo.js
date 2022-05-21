const mongoose = require('mongoose')

const connectionString = process.env.MONGO_DB_URI

// connection to the database
mongoose.connect(connectionString)
  .then(() => {
    console.log('Mongo database connected successfully')
  })
  .catch(error => {
    console.log(error)
  })

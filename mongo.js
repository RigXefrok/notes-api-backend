const mongoose = require('mongoose')

const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env

const connectionString = NODE_ENV === 'test' ? MONGO_DB_URI_TEST : MONGO_DB_URI

// connection to the database
mongoose.connect(connectionString)
  .then(() => {
    console.log('Mongo database connected successfully')
  })
  .catch(error => {
    console.log(error)
  })

process.on('uncaughtException', () => mongoose.connection.close())

require('dotenv').config()
require('./mongo')

const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const cors = require('cors')
const notFound = require('./middleWare/notFound')
const handleError = require('./middleWare/handleError')

const usersRouter = require('./controllers/users')
const notesRouter = require('./controllers/notes')
const loginRouter = require('./controllers/login')
const app = express()

Sentry.init({
  dsn: 'https://fc8cc92c994f4b9ab2b737589d7f20ad@o1258183.ingest.sentry.io/6432022',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Tracing.Integrations.Express({ app })
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
})

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler())
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler())

app.use(cors())
app.use(express.json())

// para mostrar los archivos estatidos dentro de la ruta dada
app.use(express.static('images'))

app.get('/', (request, response) => {
  response.send('<h1>Una vieja pisa paja cuando pasa paja pisa</h1>')
})

// controllers
app.use('/api/login', loginRouter)
app.use('/api/notes', notesRouter)

app.use('/api/users', usersRouter)

// middleware
app.use(notFound)

app.use(Sentry.Handlers.errorHandler())
app.use(handleError)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }

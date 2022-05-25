require('dotenv').config()
require('./mongo')

const express = require('express')
const Sentry = require('@sentry/node')
const Tracing = require('@sentry/tracing')
const cors = require('cors')
const Note = require('./models/Note')
const notFound = require('./middleWare/notFound')
const handleError = require('./middleWare/handleError')

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

app.get('/api/notes', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

app.get('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id)
    .then(note => response.json(note))
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  const { content, important } = request.body

  const newNoteInfo = { content, important }

  Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    .then(result => response.status(200).json(result))
    .catch(error => next(error))
})

app.delete('/api/notes/:id', async (request, response, next) => {
  const { id } = request.params

  await Note.findByIdAndDelete(id)
  response.status(204).end()
})

app.post('/api/notes', async (request, response, next) => {
  const { content, important } = request.body

  if (!content) return response.status(400).json({ error: 'note.content is missing' })

  const newNote = new Note({
    content,
    date: new Date(),
    important: important || false
  })
  try {
    const savedNote = await newNote.save()
    response.status(201).json(savedNote)
  } catch (error) {
    next(error)
  }
})

// middleware
app.use(notFound)

app.use(Sentry.Handlers.errorHandler())
app.use(handleError)

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }

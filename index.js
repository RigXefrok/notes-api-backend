require('dotenv').config()
require('./mongo')

const express = require('express')
const cors = require('cors')
const Note = require('./models/Note')
const notFound = require('./middleWare/notFound')
const handleError = require('./middleWare/handleError')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', (request, response) => {
  response.send('<h1>Una vieja pisa paja cuando pasa paja pisa</h1>')
})

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => response.json(notes))
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

app.delete('/api/notes/:id', (request, response, next) => {
  const { id } = request.params
  Note.findByIdAndDelete(id)
    .then(() => response.status(204).end())
    .catch(error => next(error))
})

app.post('/api/notes', (request, response) => {
  const { content, important } = request.body

  if (!content) response.status(400).json({ error: 'note.content is missing' })

  const newNote = new Note({
    content,
    date: new Date(),
    important: important || false
  })

  newNote.save()
    .then(() => response.status(201).json(newNote))
    .catch(error => console.log(error))
})

// middleware
app.use(notFound)
app.use(handleError)

const PORT = process.env.PORT

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

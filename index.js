const express = require('express')
const cors = require('cors')
const app = express()
const logger = require('./loggerMiddleware')

app.use(cors())
app.use(express.json())

app.use(logger)

let notes = [
  {
    id: 1,
    content: 'Me tengo que suscribiraenidudev en YouTube y Twitch',
    date: '2019-05-30T17:30:31.0982',
    important: true
  },
  {
    id: 2,
    content: 'Tengo que estudiar las clases del FullStack Bootcamp',
    date: '2019-05-30T18:39:34.0912',
    important: false
  },
  {
    id: 3,
    content: 'Repasar los retos de JS de midudev',
    date: '2019-05-30T19:20:14.298z',
    important: true
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Una vieja pisa paja cuando pasa paja pisa</h1>')
})

app.get('/api/notes', (request, response) => {
  response.json(notes)
})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)

  if (!note) response.status(400).json({ error: 'I couldn`t find this note' })

  response.json(note)
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

app.post('/api/notes', (request, response) => {
  const { content, important } = request.body

  if (!content) response.status(400).json({ error: 'note.content is missing' })

  const ids = notes.map(note => note.id)
  const maxId = Math.max(...ids)

  const newNote = {
    id: maxId + 1,
    content,
    date: new Date().toISOString(),
    important: typeof important !== 'undefined' ? important : false
  }
  notes = [...notes, newNote]
  response.status(201).json(newNote)
})

app.use((request, response, next) => {
  response.status(400).json({ error: 'Not found' })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const { app } = require('../index')
const supertest = require('supertest')

const api = supertest(app)

const initalNotes = [
  {
    content: 'Hola',
    important: true,
    date: new Date()
  },
  {
    content: 'Chau',
    important: true,
    date: new Date()
  }
]

const getAllFromNotes = async () => {
  const response = await api.get('/api/notes')
  return {
    ids: response.body.map(note => note.id),
    contents: response.body.map(note => note.content),
    notes: response.body,
    response
  }
}
module.exports = {
  api,
  initalNotes,
  getAllFromNotes
}

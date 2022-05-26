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

const initalUsers = [
  {
    username: 'xefrok',
    name: 'seba',
    password: '123456'
  },
  {
    username: 'xXpepeXx',
    name: 'juan jose carlos',
    password: '1234'
  }
]

const getAllFromUsers = async () => {
  const response = await api.get('/api/users')
  return {
    ids: response.body.map(user => user.id),
    names: response.body.map(user => user.name),
    usernames: response.body.map(user => user.username),
    notes: response.body.map(user => user.notes),
    users: response.body,
    response
  }
}
const getFirstUser = async () => {
  const { body } = await api.get('/api/users')
  const firstUser = body[0]
  return {
    id: firstUser.id,
    username: firstUser.username,
    name: firstUser.name,
    notes: firstUser.notes
  }
}
module.exports = {
  api,
  initalNotes,
  getAllFromNotes,
  initalUsers,
  getFirstUser,
  getAllFromUsers
}

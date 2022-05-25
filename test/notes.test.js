const mongoose = require('mongoose')
const { server } = require('../index')
const Note = require('../models/Note')
const { api, initalNotes, getAllFromNotes } = require('./helpers')

beforeEach(async () => {
  await Note.deleteMany({})
  // paralelo
  // const notesObjects = initalNotes.map(note => new Note(note))
  // const promises = notesObjects.map(note => note.save())
  // await Promise.all(promises)

  for (const note of initalNotes) {
    const noteObject = new Note(note)
    await noteObject.save()
  }
})

describe('Get a Note', () => {
  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are only the inital notes', async () => {
    const response = await api.get('/api/notes')
    expect(response.body).toHaveLength(initalNotes.length)
  })

  test('there first note says \'Hola\'', async () => {
    const { contents } = await getAllFromNotes()
    expect(contents).toContain('Hola')
  })

  test('a note can be find by id', async () => {
    const { ids } = await getAllFromNotes()
    await api
      .get(`/api/notes/${ids[0]}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('only can find notes that exist', async () => {
    await api
      .get('/api/notes/5')
      .expect(400)
  })
})

describe('Create a Note', () => {
  test('is possible with a valid note', async () => {
    const newNote = {
      content: 'Nota nueva',
      important: true
    }
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const { contents, response } = await getAllFromNotes()
    expect(response.body).toHaveLength(initalNotes.length + 1)
    expect(contents).toContain(newNote.content)
  })
  test('is not possible with an invalid note', async () => {
    const newNote = {
      important: true
    }
    await api
      .post('/api/notes')
      .send(newNote)
      .expect(400)

    const { response } = await getAllFromNotes()
    expect(response.body).toHaveLength(initalNotes.length)
  })
})

describe('Delete a Note', () => {
  test('is possible with a valid id', async () => {
    const { notes } = await getAllFromNotes()
    const noteToDelte = notes[0]
    await api
      .delete(`/api/notes/${noteToDelte.id}`)
      .expect(204)

    const { response, contents } = await getAllFromNotes()

    expect(response.body).toHaveLength(initalNotes.length - 1)

    expect(contents).not.toContain(noteToDelte.content)
  })

  test('only can deleted notes that exist', async () => {
    await api
      .delete('/api/notes/5')
      .expect(400)

    const { response } = await getAllFromNotes()
    expect(response.body).toHaveLength(initalNotes.length)
  })
})

describe('Update a Note', () => {
  test('change the information of a note', async () => {
    const { ids } = await getAllFromNotes()
    const indiceNota = 0
    const newNote = {
      content: 'Nota modificada',
      important: true
    }

    await api
      .put(`/api/notes/${ids[indiceNota]}`)
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { contents } = await getAllFromNotes()

    expect(contents[indiceNota]).toBe(newNote.content)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})

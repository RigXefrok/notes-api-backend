const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/User')
const userExtractor = require('../middleWare/userExtractor')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  })
  response.json(notes)
})

notesRouter.get('/:id', (request, response, next) => {
  const { id } = request.params
  Note.findById(id)
    .then(note => response.status(200).json(note))
    .catch(error => next(error))
})

notesRouter.put('/:id', userExtractor, async (request, response, next) => {
  const { id } = request.params
  const { ...noteInfo } = request.body

  const newNoteInfo = { ...noteInfo }

  try {
    const foundNote = Note.findByIdAndUpdate(id, newNoteInfo, { new: true })
    response.status(200).json(foundNote)
  } catch (error) {
    next(error)
  }
})

notesRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const { id: noteId } = request.params

  try {
    const deletedNote = await Note.findByIdAndDelete(noteId)
    if (!deletedNote) next({ name: 'NonexistentNote', message: 'the note you tried to delete do not exist' })
  } catch (error) {
    next(error)
  }

  const { userId } = request
  try {
    const user = await User.findById(userId)
    user.notes.remove({ _id: noteId })
    await user.save()
  } catch (error) {
    next(error)
  }

  response.status(204).end()
})

notesRouter.post('/', userExtractor, async (request, response, next) => {
  const { content, important = false } = request.body

  if (!content) next({ name: 'NoteContentMissing', message: 'note content is missing' })

  const { userId } = request
  const user = await User.findById(userId)

  const newNote = new Note({
    content,
    date: new Date(),
    important,
    user: user._id
  })

  try {
    const savedNote = await newNote.save()

    user.notes = user.notes.concat(savedNote._id)
    await user.save()

    response.status(201).json(savedNote)
  } catch (error) {
    next(error)
  }
})

module.exports = notesRouter

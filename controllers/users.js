const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('notes', {
    content: 1,
    date: 1,
    important: 1
  })
  response.json(users)
})

usersRouter.post('/', async (request, response, next) => {
  const { body } = request
  const { username, name, password } = body

  const newUser = new User({
    username,
    name,
    passwordHash: password
  })

  const error = newUser.validateSync()
  if (error) next({ name: 'UserRequiredFailed', error })

  newUser.passwordHash = await bcrypt.hash(password, 10)
  try {
    const savedUser = await newUser.save()
    response.status(201).json(savedUser)
  } catch (error) {
    next({ name: 'UserValidationFailed', error })
  }
})

usersRouter.get('/:id', async (request, response, next) => {
  const { id } = request.params
  const user = await User.findById(id)
  if (!user) next()
  response.status(200).json(user)
})

usersRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  await User.findByIdAndDelete(id)
  response.status(204).end()
})

usersRouter.put('/:id', async (request, response, next) => {
  const { id } = request.params
  const { password, ...userInfo } = request.body
  let passwordHash
  if (password) passwordHash = await bcrypt.hash(password, 10)

  const newUserInfo = password ? { ...userInfo } : { passwordHash, ...userInfo }
  try {
    const newUser = await User.findByIdAndUpdate(id, newUserInfo, { new: true })
    response.status(200).json(newUser)
  } catch (error) {
    next(error)
  }
})
module.exports = usersRouter

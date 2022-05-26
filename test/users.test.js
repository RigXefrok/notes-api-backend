const mongoose = require('mongoose')
const { server } = require('../index')
const User = require('../models/User')
const { api, initalUsers, getFirstUser, getAllFromUsers } = require('./helpers')
const bcrypt = require('bcrypt')

beforeEach(async () => {
  await User.deleteMany({})
  // paralelo
  // const usersObjects = initalusers.map(note => new Note(note))
  // const promises = usersObjects.map(note => note.save())
  // await Promise.all(promises)

  for (const user of initalUsers) {
    const { password, ...userInfo } = user
    const passwordHash = await bcrypt.hash(password, 10)
    const userObject = new User({ ...userInfo, passwordHash })
    await userObject.save()
  }
})

describe('Get a User', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users/')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('there are only the inital users', async () => {
    const { response } = await getAllFromUsers()
    expect(response.body).toHaveLength(initalUsers.length)
  })

  test('a user can be find by id', async () => {
    const { ids } = await getAllFromUsers()
    await api
      .get(`/api/users/${ids[0]}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('only can find valid users', async () => {
    await api
      .get('/api/users/5')
      .expect(400)
  })
})

describe('Create a User', () => {
  test('is possible with a valid user', async () => {
    const newUser = {
      username: 'Nuevo usuario',
      name: 'nombre del usuario',
      password: '1234'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const { names, response } = await getAllFromUsers()
    expect(response.body).toHaveLength(initalUsers.length + 1)
    expect(names).toContain(newUser.name)
  })

  test('is not possible with an invalid user', async () => {
    const newUser = { }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    expect(result.body).toBe('User validation failed: username: Path `username` is required., name: Path `name` is required., passwordHash: Path `passwordHash` is required.')

    const { users } = await getAllFromUsers()
    expect(users).toHaveLength(initalUsers.length)
  })

  test('creations fails with porper statuscode and message if username is alredy token', async () => {
    const user = await getFirstUser()

    const newUser = {
      name: user.name,
      username: user.username,
      password: '1234'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain(`the username ${newUser.username} is already in use`)

    const { users } = await getAllFromUsers()
    expect(users).toHaveLength(initalUsers.length)
  })
})

describe('Delete a User', () => {
  test('is possible with a valid id', async () => {
    const { users } = await getAllFromUsers()
    const userToDelete = users[0]
    await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(204)

    const { response, names } = await getAllFromUsers()

    expect(response.body).toHaveLength(initalUsers.length - 1)

    expect(names).not.toContain(userToDelete.name)
  })

  test('only can deleted users that exist', async () => {
    await api
      .delete('/api/users/5')
      .expect(400)

    const { response } = await getAllFromUsers()
    expect(response.body).toHaveLength(initalUsers.length)
  })
})

describe('Update a Note', () => {
  test('change the all information of an user', async () => {
    const user = await getFirstUser()

    const newUser = {
      username: 'Nuevo nombre de usuario',
      name: 'nuevo nombre',
      password: '1111'
    }

    await api
      .put(`/api/users/${user.id}`)
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { usernames, names } = await getAllFromUsers()

    expect(usernames[0]).toBe(newUser.username)
    expect(names[0]).toBe(newUser.name)
  })

  test('change only the username of an user', async () => {
    const user = await getFirstUser()

    const newUser = {
      username: 'Nuevo nombre de usuario'
    }

    await api
      .put(`/api/users/${user.id}`)
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { usernames, names } = await getAllFromUsers()

    expect(usernames[0]).toBe(newUser.username)
    expect(names[0]).toBe(user.name)
  })

  test('change only the name of an user', async () => {
    const user = await getFirstUser()

    const newUser = {
      name: 'Nuevo nombre'
    }

    await api
      .put(`/api/users/${user.id}`)
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const { usernames, names } = await getAllFromUsers()

    expect(names[0]).toBe(newUser.name)
    expect(usernames[0]).toBe(user.username)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})

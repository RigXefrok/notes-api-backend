const jwt = require('jsonwebtoken')

module.exports = (request, response, next) => {
  const authorization = request.get('authorization')
  let token = null
  if (authorization && authorization.toLowerCase().startsWith('bearer')) token = authorization.split(' ')[1] ? authorization.split(' ')[1] : null

  const { id: userId } = token ? jwt.verify(token, process.env.SECRET_WORD) : { id: null }

  if (!token || !userId) next({ name: 'JsonWebTokenError', message: 'token missing or invalid' })

  request.userId = userId

  next()
}

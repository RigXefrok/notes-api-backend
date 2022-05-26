const ERROR_HANDLERS = {
  CastError: response => response.status(400).json({ error: 'Id provided is not allowed' }),

  JsonWebTokenError: (response, error) => response.status(401).json(error.message),
  TokenExpireError: (response, error) => response.status(401).json(error.message),

  NoteContentMissing: (response, error) => response.status(400).json(error.message),
  NonexistentNote: (response, error) => response.status(400).json(error.message),

  UserValidationFailed: (response, { error }) => response.status(400).json({ error: `the ${error.errors.username.path} ${error.errors.username.value} is already in use` }),
  UserRequiredFailed: (response, { error }) => response.status(400).json(error.message),

  DefaultError: response => response.status(500).end()
}

module.exports = (error, request, response, next) => {
  console.log(error)
  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.DefaultError
  handler(response, error)
}

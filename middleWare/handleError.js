module.exports = (error, request, response, next) => {
  console.log(error)
  if (error.name === 'CastError') response.status(400).json({ error: 'Id provided is not allowed' })
  response.status(500).end()
}

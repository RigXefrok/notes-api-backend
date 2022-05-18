const logger = (request, response, next) => {
  console.log(`-Method ${request.method} to ${request.path}`)
  console.log(request.body)
  console.log('----------')
  next()
}

module.exports = logger

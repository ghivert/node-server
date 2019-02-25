const http = require('http')
const url = require('url')
const chalk = require('chalk')

const utils = require('./response')
const errorPage = require('./error-page')

const setURL = request => request.url = url.parse(request.url, true)

const isDev = process.env.NODE_ENV !== 'production'

const extractBody = request => new Promise(resolve => {
  let body = ''
  request.on('data', chunk => body += chunk.toString())
  request.on('end', () => {
    request.body = body
    resolve(request)
  })
})

const normalizeResponse = content => {
  if (typeof content === 'object') {
    const isError = content instanceof Error
    return {
      statusCode: content.statusCode || 500,
      headers: content.headers || {},
      body: content.body || (content.statusCode ? undefined : errorPage({
        message: isError ? content.message : JSON.stringify(content),
        stackTrace: isError ? content.stack : undefined
      }))
    }
  } else {
    if (isDev) {
      return utils.internalError(errorPage({ message: JSON.stringify(content) }))
    } else {
      return utils.internalError(JSON.stringify(content))
    }
  }
}

const setHeaders = (response, headers) => {
  const setHeader = key => response.setHeader(key, headers[key])
  Object.keys(headers).forEach(setHeader)
}

const sendResponse = response => content => {
  const { statusCode, headers, body } = content
  response.statusCode = statusCode
  setHeaders(response, headers)
  response.write(body)
  response.end()
}

const normalizeError = error => {
  if (error instanceof Error) {
    if (isDev) {
      console.error(chalk.bold.red(error.stack))
    }
    return {
      statusCode: 500,
      headers: {},
      body: errorPage({
        message: error.message,
        stackTrace: error.stack,
      }),
    }
  } else {
    return normalizeResponse(error)
  }
}

const handleResponse = (handler, request, response) => {
  Promise.resolve(handler(request))
    .then(normalizeResponse)
    .catch(normalizeError)
    .then(sendResponse(response))
}

const handleRequests = handler => (request, response) => {
  setURL(request)
  if (request.method === 'POST') {
    extractBody(request)
      .then(() => handleResponse(handler, request, response))
  } else {
    handleResponse(handler, request, response)
  }
}

const selectPort = ({ port }) => port || process.env.PORT || 8080

const create = (handler, options = {}) => {
  const server = http.createServer(handleRequests(handler))
  server.listen(selectPort(options))
  return server
}

const stop = server => server.close()

module.exports = {
  create,
  stop
}

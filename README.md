# MilleFeuille

MilleFeuille is a webserver, entirely built with JavaScript and Node.js, without any dependency. MilleFeuille is built to give you a taste of functional programming, without any hassle.  
Inspired by ring and compojure in clojure, MilleFeuille focuses on lightness and productivity.

It is named accordingly to the french pastry mille-feuille, also known as Napoleon in English, because the server is built exactly like that: a succession of layers from top to bottom. Each layer is a middleware, and the bottom is a function returning a Response hashmap containing a status code, headers and a body. So, to get the answer, you have to go through all those middlewares to get those tasty responses!

# Getting Started

Getting started with MilleFeuille is simple and easy.

```bash
# For Yarn users
yarn add @frenchpastries/millefeuille
# For NPM users
npm install --save @frenchpastries/millefeuille
```

Once you got the package locally, fire your text editor, open an `src/index.js` file, and start the server.

```javascript
const MilleFeuille = require('@frenchpastries/millefeuille')

const helloWorldHandler = request => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json'
  },
  body: 'Hello World from MilleFeuille!'
})

MilleFeuille.create(helloWorldHandler)
```

Run `node src/index.js`, and try to reach `localhost:8080`. You should see 'Hello World from MilleFeuille!'. So yes! You've made your first MilleFeuille server!

# How does it works?

MilleFeuille is built around an easy principle: it exposes only one `create` function, which takes a handler as argument (and possibly options), and which creates a webserver, listening to all incoming requests.

The handler is a function, taking a request as parameter, and returning a JavaScript object, containing `statusCode`, the code of the response; `headers`, an object containing headers names as keys, and headers values as values; and `body`, whatever content, which will be passed as in the response.

In our previous example, we tell Node to respond to all requests a correct page, which contains a JSON, which is 'Hello World from MilleFeuille!'. Of course, we could switch accordingly to `request.method` and `request.url` to serve different responses for different requests. Happily, we got [`@frenchpastries/assemble`](https://github.com/FrenchPastries/assemble), to route and assemble all our parts into a beautiful pastry! 😉

# Adding a middleware

Where MilleFeuille is really good, it's for its middleware managing. A middleware is simply a function taking a handler, and returning a handler. It's a real functional programming concept. It makes it possible to process request before it is processed in your main handler. It's really powerful because it allows to reuse one middleware for all your important routes. Let's imagine you want to identify an user and redirect him if he's not allowed to access the route. With a middleware, it's really easy to do it on all the routes you want to protect. And with ES6, it's really easy to define one with arrow functions notation.

```javascript
const redirectIfNotLogged = handler => request => {
  const authentication = fetchAuthentication(request)
  const isAllowed = checkAuthorization(request.url, authentication)
  if (isAllowed) {
    return handler(request)
  } else {
    return {
      statusCode: 403
    }
  }
}
```

In this example, we're fetching the authentication from the request, checking if the user has the authorization to visit the page. If it's good, then you're returning the correct response with the handler, else we're returning a 403 status code, meaning it's a forbidden response.

That's a pretty naive middleware, but it's a simple example, to illustrate what you can do. And because everything is focusing around handlers, you can easily reuse your middlewares, even in your routes in [`@frenchpastries/assemble`](https://github.com/FrenchPastries/assemble). To use it, you simply have to apply the function to your handler.

# Let's recap!

So, let's recap what our file could look like with a simpler middleware, turning all our response into JSON response!

```javascript
const MilleFeuille = require('@frenchpastries/millefeuille')

const helloWorldHandler = request => ({
  statusCode: 200,
  headers: {},
  body: {
    content: 'Hello World from MilleFeuille!'
  }
})

const toJSONBody = handler => request => {
  const response = handler(request)
  const jsonResponse = {
    headers: {
      ...response.headers,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(response.body)
  }
  return { ...response, ...jsonResponse }
}

MilleFeuille.create(
  toJSONBody(helloWorldHandler)
)
```

If you never saw `...`, it's the spread operator, used to smartly merge two objects together.

# Last details

You know practically everything you need to use MilleFeuille! One last thing though. The response provided by handlers is an object with `statusCode`, `headers` and `body` keys. But you can omit `headers` and `body` safely, MilleFeuille is able to handle it without errors: if they're present, they will be used. If they're not present, then MilleFeuille will just respond to requests without headers or body.

# Contributing

You love MilleFeuille? Feel free to contribute: open issues or propose pull requests! At French Pastries, we love hearing from you!
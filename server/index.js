'use strict'
const Hapi = require('@hapi/hapi')
const pjson = require('../package')
const config = require('./lib/config')
const runner = require('./lib/runner')
const sockets = require('./lib/sockets')
const state = require('./lib/app.state')
const logsToJSON = require('./lib/logs.to.json')

logsToJSON((logs)=>{
  // only last 14 days
  state.logs = logs.slice(logs.length - 20160)
})

// kick off the data collector
runner.run()
setInterval(runner.run, Number(process.env.RATE||60000))

const server = Hapi.server({
  port: process.env.PORT || 1337
})

require('./lib/process')(server)
const io = sockets.init(server.listener)
sockets.io = io
io.on('connection', require('./lib/io.on.connect'))

server.start().then(()=>{
  server.register(
    [
      require('inert'),
      require('scooter'),
      {
        plugin: require('blankie'),
        options: config.csp
      },
      {
        plugin: require("hapi-and-healthy"),
        options: {
          env: process.env.APP_ENV||'PROD',
          name: pjson.name,
          version: pjson.version
        }
      },
    ]
  )
}).then(()=>{
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: __dirname + '/../public'
      }
    }
  })
}).then(()=>{
  console.log('Server running on %s', server.info.uri)
})

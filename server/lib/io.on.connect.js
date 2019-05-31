const state = require('./app.state')

module.exports = function (socketUser) {
  socketUser.emit('hello', {
    message: 'welcome'
  })
  socketUser.emit('logs', state.logs)
}

const state = require('./app.state')
const logsToJSON = require('./logs.to.json')


module.exports = function (socketUser) {
  socketUser.emit('hello', {
    message: 'welcome'
  })
  socketUser.emit('logs', state.logs)

  socketUser.on('reload', ()=>{
    logsToJSON((logs)=>{
      state.logs = logs
      socketUser.emit('logs', state.logs)
    })
  })
}

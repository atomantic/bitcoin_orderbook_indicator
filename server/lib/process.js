// generic Node.js process exception handler

process.on('uncaughtException', function(err) {
  console.log('uncaughtException', err, err.stack)
  process.exit(1)
})
process.on('unhandledRejection', function(reason, p) {
  console.log("Unhandled Rejection at: Promise ", p, " reason: ", reason)
})

const signals = {
  'SIGINT': 2,
  'SIGTERM': 15
}
function shutdown(server, signal, value) {
  console.log(signal+'['+value+'] recieved, shutting down...')
  server.stop((err) => console.log('server stopped', err || ''))
  console.log('exiting process')
  // gracefully shut down anything pending
  process.exit(128 + value)
}

module.exports = function(server){
  Object.keys(signals).forEach(function (signal) {
    process.on(signal, function () {
      shutdown(server, signal, signals[signal])
    })
  })
}

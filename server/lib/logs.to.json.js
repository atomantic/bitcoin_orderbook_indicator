/**
 * reads the log file data, converts it into JSON
 */
const fs = require('fs')
const log = require('./log')
const logParse = require('./log.parse')
const parallel = require('async.parallel')
const filepath = __dirname+'/../../data/'
module.exports = (cb)=>{
  fs.readdir(filepath, function(err, filenames) {
    if (err) {
      return log.err(err)
    }
    parallel(filenames.map(file=>{
      return cb => fs.readFile(filepath+file, 'utf-8', cb)
    }), (err, contents)=>{
      if (err) {
        return log.err(err)
      }
      contents.sort() // make sure they come out chronological
      const json = contents.join('\n')
        .split('\n')
        .map(logParse)
      cb(json)
    })
  })
}

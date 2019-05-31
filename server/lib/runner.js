const CoinbasePro = require('coinbase-pro')
const getThresholdPrices = require('./get.threshold.prices')
const logParse = require('./log.parse')
const parallel = require('async.parallel')
const publicClient = new CoinbasePro.PublicClient()
const rollingFile = require('rolling-file')
const sockets = require('./sockets')
const state = require('./app.state')

const f = rollingFile(__dirname+'/../../data', {
    fileName: 'book', byteLimit: '10 MB'
})

const runner = {
  run: ()=>{
    parallel([
        cb => publicClient.getProductTicker('BTC-USD', (error, response, data)=>{cb(error, data)}),
        cb => publicClient.getProductOrderBook('BTC-USD', {level:3}, (error, response, data)=>{cb(error, data)}),
    ], (err, data)=>{
        if(err) throw err
        const ticker = data[0]
        const bids = data[1].bids
        const asks = data[1].asks

        let logLine = `${ticker.time}\t${ticker.price}\t${ticker.size}\t${ticker.bid}\t${ticker.ask}\t${ticker.volume}`

        // add the bid targets to the logger
        logLine = getThresholdPrices(bids, logLine)
        // add the ask targets to the logger
        logLine = getThresholdPrices(asks, logLine)

        f.write(logLine)
        console.log(logLine)
        const parsed = logParse(logLine)
        state.logs.push(parsed)
        sockets.all('log', parsed)
    })
  }
}

module.exports = runner

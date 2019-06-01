const _ = require('lodash')
const CoinbasePro = require('coinbase-pro')
// const fs = require('fs')
const getThresholdPrices = require('./get.threshold.prices')
const logParse = require('./log.parse')
const math = require('mathjs')
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
        cb => publicClient.getProductTicker(
          'BTC-USD',
          (error, response, data)=>{cb(error, data)}
        ),
        cb => publicClient.getProductOrderBook(
          'BTC-USD',
          {level:3},
          (error, response, data)=>{cb(error, data)}
        ),
    ], (err, data)=>{
        if(err) throw err
        const ticker = data[0]
        const bids = data[1].bids
        const asks = data[1].asks

        // fs.writeFile(__dirname+'/../../data/book.json', JSON.stringify(data, null, 2), ()=>{})

        // order book contains [$, vol, id]
        // [ '8439.34', '0.27524952', '8d51f26c-fe03-4f22-ad58-220483cfe094' ]

        let logLine = `${ticker.time}\t${ticker.price}\t${ticker.size}\t${ticker.bid}\t${ticker.ask}\t${ticker.volume}`

        // add the total $ on the table for the buy side
        // we can use this to ask, what would happen if all buy orders were canceled
        // and the whole market suddenly market purchased with those funds
        const totalBuy = bids.reduce((acc, bid)=>acc+math.multiply(bid[0], bid[1]), 0) // the dollars on the table
        logLine += '\t'+totalBuy
        // add the total BTC on the table for the sell side
        // we can use this to ask, what would happen if all sell orders were canceled
        // and the whole market suddenly market dumped all units
        const totalSell = bids.reduce((acc, bid)=>acc+Number(bid[1]), 0) // on the BTC available
        logLine += '\t'+totalSell

        // what would happen if the market canceled all limit buy orders and pumped?
        let total = 0
        const maxUpSlippage = _.takeWhile(asks, (order)=>{
          total += math.multiply(order[0], order[1]) // collect the USD volume resistance
          return total < totalBuy
        })
        // console.log(maxUpSlippage.length)
        logLine += '\t'+maxUpSlippage[maxUpSlippage.length-1][0]

        // what would happen if the market canceled all limit sell orders and dumped?
        total = 0
        const maxDownSlippage = _.takeWhile(bids, (order)=>{
          total += Number(order[1]) // collect the BTC volume slippage
          return total < totalSell
        })
        // console.log(maxDownSlippage.length)
        logLine += '\t'+maxDownSlippage[maxDownSlippage.length-1][0]

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

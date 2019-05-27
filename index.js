const CoinbasePro = require('coinbase-pro')
const publicClient = new CoinbasePro.PublicClient()
const math = require('mathjs')
const rollingFile = require('rolling-file')
const parallel = require('async.parallel')
const _ = require('lodash')

// movement thresholds
const buckets = {
    m1: 1000000,
    m5: 5000000,
    m10: 10000000,
    m20: 20000000,
    m50: 50000000,
}

const f = rollingFile('./data', { 
    fileName: 'book', byteLimit: '10 MB' 
})

process.on('exit', (code) => {
    console.log(`writing last data with exit code ${code}`)
    f.end()
})

const getThresholdPrices = (book, logLine)=>{
    let carry = 0 // carryover to put the 1M+ in the 5M count, etc
    _.each(buckets, (targetValue, key)=>{
        let total = carry
        // chop the order book at the point at which the total volume accumulates key (e.g. $1M) in price drop
        let orders = _.takeWhile(book, (order)=>{
            total += math.multiply(order[0], order[1])
            return total < targetValue
        })
        carry = total // new carryover value for the next bucket
        let sliceIndex = orders.length-1
        logLine += `\t${orders[sliceIndex][0]}` // add the price to the logger
        book = book.slice(sliceIndex)
    })
    return logLine
}

const getData = ()=>{
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
    })
}
getData()
setInterval(getData, 10000)
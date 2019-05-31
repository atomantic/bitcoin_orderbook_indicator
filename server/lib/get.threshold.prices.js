/**
 * goes through the orderbook and finds the price at which the book
 * would slip to in each of the bucket cases
 * @param {array} book - the order book
 * @param {string} logLine - a log line to append the result onto
 * @return {string} appended logline
 */
const _ = require('lodash')
const config = require('./config')
const math = require('mathjs')
module.exports = (book, logLine)=>{
  let carry = 0 // carryover to put the 1M+ in the 5M count, and so on...
  _.each(config.buckets, (targetValue)=>{
      let total = carry
      // chop the order book at the point at which the total volume accumulates the desired limit
      // (e.g. $1M) in price change
      let orders = _.takeWhile(book, (order)=>{
          total += math.multiply(order[0], order[1])
          return total < targetValue
      })
      carry = total // new carryover value for the next bucket
      let sliceIndex = orders.length-1
      logLine += `\t${orders[sliceIndex][0]}` // add the price to the logger
      // update the book for the next target
      // we don't need to look through the first $1 million when we look for the $5M target
      book = book.slice(sliceIndex)
  })
  return logLine
}

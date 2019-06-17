/**
 * reads the log data files and normalizes them to 1 minute buckets, collapsing duplicates into the mean of their values
 */
const _ = require('lodash')
const config = require('./config')
const logsToJSON = require('./logs.to.json')
const fs = require('fs')

logsToJSON((json)=>{

  // clean up the date in the log to the nearest minute:
  // 2019-06-15T17:34:24.430Z
  const perMinute = json.map((log)=>{
    log.date = log.date.replace(/\d{2}.\d{3}Z$/, '00.000Z')
    return log
  })

  // collapse duplicates
  const collapsed = _(perMinute).groupBy('date')
    .map((records)=>{
      // console.log(records.length)
      const meanObj = {
        date: records[0].date
      }
      config.columns.forEach(c=>{
        if(c==='date') return
        const values = records.map(r=>r[c])
        // console.log(c, values)
        meanObj[c] = Number(_.mean(values).toFixed(0))
      })
      return meanObj
    }).value()

  console.log(collapsed[0])

  // convert json back to tsv
  const lines = collapsed.map((log)=>{
    let line = ''
    config.columns.forEach(c => line+=(line!==''?'\t':'')+log[c])
    return line+'\n'
  })

  // save it
  fs.writeFileSync(__dirname+'/../../data/book.per.minute.log', lines.join(''))
})


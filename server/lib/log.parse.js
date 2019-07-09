/**
 * parse a single log line into json
 */
const config = require('./config')
// const log = require('./log')
module.exports = line=>{
  const cells = line.split('\t')
  // if(cells.length!==24){
  //   log.err(line)
  // }
  return cells.reduce(function(result, cell, i) {
    const col = config.columns[i]
    result[col] = config.columnStrings.includes(col) ? cell : Number(cell);
    return result;
  }, {})
}

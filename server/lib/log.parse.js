/**
 * parse a single log line into json
 */
const config = require('./config')
module.exports = line=>{
  const cells = line.split('\t')
  return cells.reduce(function(result, cell, i) {
    const col = config.columns[i]
    result[col] = config.columnStrings.includes(col) ? cell : Number(cell);
    return result;
  }, {})
}

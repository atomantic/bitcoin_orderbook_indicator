/**
 * takes a log object and caculates indicator values
 * @param {object} log - a log object to process
 * @return {object} the updated log with calculated entries
 */
const config = require('./config');
module.exports = function(log){
  // split date for groupings: 2019-05-30T15:03:37.884Z
  log.day = log.date.split('T')[0] + 'T00:00:00.000Z'; // 2019-05-30
  const colonSplit = log.date.split(':'); // 2019-05-30T15
  log.hour = colonSplit[0] + ':00:00.000Z';
  log.minute = colonSplit[0] + colonSplit[1] +  + ':00.000Z'; // 2019-05-30T15:03
  log.date = new Date(log.date);
  config.limits.forEach(limit=>{
    log[limit+'_buy_diff'] = log.price - log[limit+'_buy']
    log[limit+'_sell_diff'] = log[limit+'_sell'] - log.price
    log[limit+'_range'] = log[limit+'_sell'] - log[limit+'_buy']
    log[limit+'_percentage'] = log[limit+'_buy_diff'] / log[limit+'_range']
    log[limit+'_support'] = log.price * (1-log[limit+'_percentage'])
    log[limit+'_mid'] = (log[limit+'_buy'] + log[limit+'_sell']) / 2
    log[limit+'_target'] = log.price + log[limit+'_sell_diff'] - log[limit+'_buy_diff']
  });
  return log;
};

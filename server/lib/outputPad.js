module.exports = function outputPad(text, amount){
  return text.length > amount ? text : text+Array(amount - text.length).join(' ')
}

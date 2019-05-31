const waitIcons = ['🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥']
const waitLength = waitIcons.length
let waitCounter = waitLength
module.exports = {
  action: function(){
    console.log.apply(this, ['⚡'].concat([].slice.call(arguments)))
  },
  copy: function(){
    console.log.apply(this, ['📋 '].concat([].slice.call(arguments)))
  },
  down: function() {
    console.log.apply(this, ['⬇️ '].concat([].slice.call(arguments)))
  },
  err: function() {
    console.error.apply(this, ['🚨 '].concat([].slice.call(arguments)))
  },
  good: function(){
    console.error.apply(this, ['👍'].concat([].slice.call(arguments)))
  },
  info: function() {
    console.error.apply(this, ['🔍'].concat([].slice.call(arguments)))
  },
  ok: function() {
    console.log.apply(this, ['✅ '].concat([].slice.call(arguments)))
  },
  out: function() {
    console.log.apply(this, ['🚨 '].concat([].slice.call(arguments)))
  },
  saved: function(){
    console.log.apply(this, ['💾'].concat([].slice.call(arguments)))
  },
  up: function() {
    console.log.apply(this, ['⬆️ '].concat([].slice.call(arguments)))
  },
  wait: function() {
    waitCounter = waitCounter===waitLength ? 0 : waitCounter+1
    console.error.apply(this, [waitIcons[waitCounter]].concat([].slice.call(arguments)))
  },
  warn: function() {
    console.warn.apply(this, ['⚠️ '].concat([].slice.call(arguments)))
  }
}

module.exports = {
  buckets: {
      m1: 1000000,
      m5: 5000000,
      m10: 10000000,
      m20: 20000000,
      m50: 50000000,
  },
  columns: [
    'date', 'price', 'size', 'bid', 'ask', 'volume',
    'm1_buy','m5_buy','m10_buy','m20_buy','m50_buy','m1_sell','m5_sell','m10_sell','m20_sell','m50_sell'
  ],
  columnStrings: ['date'],
  csp: {
    connectSrc: "'self' ws://localhost:1337",
    generateNonces: false,
    fontSrc: "'self'",
    imgSrc: "'self'",
    scriptSrc: "'self' d3js.org 'unsafe-inline' 'unsafe-eval'",
    styleSrc: "'self' 'unsafe-inline'"
  }
}

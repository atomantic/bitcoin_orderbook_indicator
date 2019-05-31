module.exports = {
  limits: ['m1','m5','m10','m20','m50'],
  lines: [
    {
      label: 'Price',
      field: 'price',
      color: '#000',
      width: 2
    },
    {
      label: '$1M Buy',
      field: 'm1_buy',
      color: '#0f0',
      width: 1
    },
    {
      label: '$1M Sell',
      field: 'm1_sell',
      color: '#f00',
      width: 1
    },
    {
      label: '$1M Target',
      field: 'm1_target',
      color: '#00f',
      width: 1
    }
  ]
}

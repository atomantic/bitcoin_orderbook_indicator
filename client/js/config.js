module.exports = {
  limits: ['m1','m5','m10','m20','m50'],
  fields: ['buy','sell','mid','pressure'],
  lines: [
    {
      label: 'Price',
      field: 'price',
      width: 2
    },
    {
      label: '$1M Pressure',
      field: 'm1_pressure',
      width: 3
    },
    {
      label: '$5M Pressure',
      field: 'm5_pressure',
      width: 3
    },
    {
      label: '$10M Pressure',
      field: 'm10_pressure',
      width: 3
    },
    {
      label: '$20M Buy',
      field: 'm20_buy',
      name: 'buy',
      width: 2
    },
    {
      label: '$20M Pressure',
      field: 'm20_pressure',
      width: 3
    },
    {
      label: '$20M Sell',
      field: 'm20_sell',
      name: 'sell',
      width: 2
    }
  ]
}

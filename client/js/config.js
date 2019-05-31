module.exports = {
  limits: ['m1','m5','m10','m20','m50'],
  lines: [
    {
      label: 'Price',
      field: 'price',
      width: 2
    },
    // {
    //   label: '$1M Buy',
    //   field: 'm1_buy',
    //   width: 1
    // },
    // {
    //   label: '$1M Sell',
    //   field: 'm1_sell',
    //   width: 1
    // },
    {
      label: '$1M Target',
      field: 'm1_target',
      width: 1
    },
    {
      label: '$5M Target',
      field: 'm5_target',
      width: 2
    },
    {
      label: '$10M Target',
      field: 'm10_target',
      width: 3
    },
    {
      label: '$20M Target',
      field: 'm20_target',
      width: 4
    }
  ]
}

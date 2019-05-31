module.exports = {
  limits: ['m1','m5','m10','m20','m50'],
  lines: [
    {
      label: 'Price',
      field: 'price',
      color: '#000',
      width: 2
    },
    // {
    //   label: '$1M Buy',
    //   field: 'm1_buy',
    //   color: '#0f0',
    //   width: 1
    // },
    // {
    //   label: '$1M Sell',
    //   field: 'm1_sell',
    //   color: '#f00',
    //   width: 1
    // },
    {
      label: '$1M Target',
      field: 'm1_target',
      color: '#3cc580',
      width: 1
    },
    {
      label: '$5M Target',
      field: 'm5_target',
      color: '#5eb589',
      width: 2
    },
    {
      label: '$10M Target',
      field: 'm10_target',
      color: '#38805c',
      width: 3
    },
    {
      label: '$20M Target',
      field: 'm20_target',
      color: '#266546',
      width: 4
    }
  ]
}

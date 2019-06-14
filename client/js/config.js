module.exports = {
  limits: ['m1','m5','m10','m20','m50'],
  fields: ['buy','sell','mid','pull'],
  lines: [
    {
      label: 'Price',
      field: 'price',
      resistance: true,
      width: 2
    },
    {
      label: '$1M Pull',
      field: 'm1_pull',
      width: 3
    },
    {
      label: '$5M Pull',
      field: 'm5_pull',
      width: 3
    },
    {
      label: '$10M Pull',
      field: 'm10_pull',
      width: 3
    },
    {
      label: '$20M Pull',
      field: 'm20_pull',
      width: 3
    },
    {
      label: '$50M Pull',
      field: 'm50_pull',
      support: true,
      width: 3
    }
  ]
}

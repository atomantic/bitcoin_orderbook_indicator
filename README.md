# BTC Order Book Indicator

Watches the Coinbase Pro order book for BTC and logs
- the current price
- the price point at which the order book could fall by $1M
- the price point at which the order book could rise by $1M
- same for $5M, $10M, $10M, $50M

This data set can then be used to construct a trading indicator, showing how the order book price volumes relate to the changing prices.

## What?
Here you can see when Bitcoin was in the `$6500` zone that the order books were thin on the sell side. $7M in market selling action would reduce the price to `~$6020`, but $7M in market purchases would raise the price to `~$11,500`:
![](img/buy.png)
![](img/sell.png)
Over the next week, Bitcoin shot up to nearly `$9K`.

## How?
The logger runs every 10 seconds and logs to a rolling log file in the `data` directory.
It logs the following columns, tab delimited
```
datetime price size big ask volume m1_buy m5_buy m10_buy m20_buy m50_buy m1_sell m5_sell m10_sell m20_sell m50_sell
```

## Getting Started

```
npm i
npm start
```

or run as a never stopping service with PM2
```
npm i -g pm2
pm2 start npm --name "btc_orders" -- start; pm2 logs
```
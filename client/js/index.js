// var _ = require('lodash');
const config = require('./config');
const Vue = require('vue/dist/vue.js');
const processLog = require('./process.log');
const socket = io();
const dateFields = ['date', 'hour', 'minute', 'day', 'h6'];

const vueData = {
  connected: false,
  logs: [],
  grouping: 'hour',
  target: 'm50',
  time: 86400000,
  width: window.innerWidth-50,
  height_main: 400,
  height_sub: 200
};
window.vueData = vueData; // debug inspection and fiddling

new Vue({
  el: '#app',
  data: vueData,
  ready: function() {
    // e.g. register components
  },
  methods: {
    setGroup(grouping){
      console.log('changing grouping', grouping)
      vueData.grouping = grouping;
      this.renderChart();
    },
    setTarget(target){
      console.log('changing target', target)
      vueData.target = target;
      this.renderChart();
    },
    setTime(time){
      console.log('changing time', time)
      vueData.time = time;
      this.renderChart();
    },
    renderChart() {
      if (document.getElementsByTagName('svg')){
          d3.selectAll('svg').remove();
      }

      let logs;
      // if cutting logs to a date restriction, filter them
      if(this.time!=='all'){
        const cutoff = new Date() - this.time;
        logs = this.logs.filter(l=>new Date(l.minute).getTime() > cutoff);
      }else{
        logs = this.logs;
      }

      const recordKeys = Object.keys(this.logs[0]);
      // prep the data, merging records via mean() of each numeric value
      // console.log(logs);
      const grouping = d3.nest()
        .key(d=>d[this.grouping])
        .rollup(function(v) {
          const record = {};
          recordKeys.forEach(k=>{
            if(!dateFields.includes(k)){
              return record[k] = d3.mean(v, d=>d[k]);
            }
          })
          return record;
        })
        .entries(logs);
      // console.log({grouping});

      // prep the data, extract each line we want to draw into a new series
      const series = [];
      const keys = [];
      let priceData, supportData, resistanceData;

      const lines = this.target==='default' ? config.lines : [{
        label: 'Price',
        field: 'price',
        name: 'price',
        width: 2
      }].concat(config.fields.map(f=>{
        return {
          label: '$'+this.target.replace('m','')+'M '+f,
          field: `${this.target}_${f}`,
          name: f,
          resistance: f==='sell',
          support: f==='buy',
          width: f==='pull' ? 2 : 1
        }
      }))

      lines.forEach(conf=>{
        keys.push(conf.label);
        const data = {
          p: grouping.map(group=>{
            if(new Date(group.key)==='Invalid Date') {
              console.log('invalid', group)
            }
            return {
              x: new Date(group.key),
              y: group.value[conf.field]
            }
          }),
          c: conf.color,
          l: conf.label,
          w: conf.width
        };
        series.push(data);
        // console.log(conf)
        if(conf.field==='price'){
          priceData = data.p;
        }
        if(conf.support){
          supportData = data.p;
        }
        if(conf.resistance){
          resistanceData = data.p;
        }
      });
      if(!resistanceData) resistanceData = priceData;
      if(!supportData) supportData = priceData;

      // console.log('bottom res', resistanceData[0])
      // console.log('top support',supportData[0])
      window.series = series;

      const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet2);

      const margin = { top: 20, right: 50, bottom: 30, left: 50 };
      const width = this.width - margin.left - margin.right;
      const height = this.height_main - margin.top - margin.bottom;

      // set the ranges
      const x = d3.scaleTime().range([0, width]);
      const y = d3.scaleLinear().range([height, 0]);

      const svg = d3.select("#all-data").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");


      // scale the range of the data
      x.domain(d3.extent(priceData, d=>d.x));
      y.domain([
        d3.min(supportData, d => d.y-.01*d.y),
        d3.max(resistanceData, d => d.y+.03*d.y)
      ]);

      // add the area
      svg.append("path")
        .data([priceData])
        .attr("class", "area")
        .style('fill', 'lightsteelblue')
        .attr("d", d3.area()
          .x(d=> x(d.x))
          .y0(height)
          .y1(d=>y(d.y))
        );

      const line = d3.line()
        .x(d=>x(d.x))
        .y(d=>y(d.y));

      series.forEach(path=>{
        svg.append("path")
          .data([path])
          .attr("class", "line")
          .style('stroke-width', d=>d.w)
          .style('stroke', d=>color(d.l))
          .style('fill', 'none')
          .attr("d", d=>line(d.p));
      })

      // add the X Axis
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      // add the Y Axis
      svg.append("g")
        .call(d3.axisLeft(y));
      svg.append("g")
        .attr("transform", "translate(" + width + " ,0)")
        .call(d3.axisRight(y));

      // LEGEND
      // Add one dot in the legend for each name.
      svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
          .attr("cx", 40)
          .attr("cy", (d,i) => 10 + i*20)
          .attr("r", 7)
          .style("fill", d=>color(d))

      // Add one dot in the legend for each name.
      svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
          .attr("x", 50)
          .attr("y", (d,i) => 11 + i*20)
          .style("fill", d=>color(d))
          .text(d=>d)
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")


      const height_sub = this.height_sub - margin.top - margin.bottom;
      const chart_cash = d3.select("#cash").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height_sub + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");


      const cash_data = grouping.map(group=>{
        return {
          x: new Date(group.key),
          cash: group.value.total_buy / 1000000,
          btc: group.value.total_sell
        }
      });
      const x_cash = d3.scaleTime().range([0, width]);
      const y_cash = d3.scaleLinear().range([height_sub, 0]);
      const y_btc = d3.scaleLinear().range([height_sub, 0]);
      // scale the range of the data
      x_cash.domain(d3.extent(cash_data, d=>d.x));
      y_cash.domain([
        d3.min(cash_data, d => d.cash-.01*d.cash),
        d3.max(cash_data, d => d.cash+.01*d.cash)
      ]);
      y_btc.domain([
        d3.min(cash_data, d => d.btc-.01*d.btc),
        d3.max(cash_data, d => d.btc+.01*d.btc)
      ]);
      const cash_line = d3.line()
        .x(d=>x_cash(d.x))
        .y(d=>y_cash(d.cash));
      const btc_line = d3.line()
        .x(d=>x_cash(d.x))
        .y(d=>y_btc(d.btc));


      // const yAxisLeft = d3.svg.axis().scale(y_cash)
      //   .orient("left").ticks(5);

      // const yAxisRight = d3.svg.axis().scale(y_btc)
      //   .orient("right").ticks(5);

      // console.log(cash_data)

      // add the X Axis
      chart_cash.append("g")
        .attr("transform", "translate(0," + height_sub + ")")
        .call(d3.axisBottom(x_cash));

      // add the Y Axis
      chart_cash.append("g")
        .attr("class", "yaxis")
        .style('stroke', 'blue')
        .call(d3.axisLeft(y_cash));
      chart_cash.append("g")
        .attr("class", "yaxis")
        .style('stroke', 'green')
        .attr("transform", "translate(" + width + " ,0)")
        .call(d3.axisRight(y_btc));

      chart_cash.append("path")
        .data([cash_data])
        .attr("class", "line")
        .style('stroke-width', 1)
        .style('stroke', 'blue')
        .style('fill', 'none')
        .attr("d", d=>cash_line(d));
      chart_cash.append("path")
        .data([cash_data])
        .attr("class", "line")
        .style('stroke-width', 1)
        .style('stroke', 'green')
        .style('fill', 'none')
        .attr("d", d=>btc_line(d));

      chart_cash
        .append("text")
        .attr("x", 20)
        .attr("y", 20)
        .style("fill", 'blue')
        .text("dollars on the table (in millions)")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
      chart_cash
        .append("text")
        .attr("x", 20)
        .attr("y", 40)
        .style("fill", 'green')
        .text("BTC on the table")
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")

    }

  },
  watch: {
    logs(val) {
      if (val){
        this.renderChart()
      }
    }
  }
});


socket.on('hello', function(/*data*/){
  // console.log('socket', data);
  vueData.connected = true;
});

socket.on('logs', function(logs){
  // console.log('logs', logs);
  vueData.logs = logs.map(processLog);
});

socket.on('log', function(line){
  // console.log('log', line);
  vueData.logs.push(processLog(line));
});

// var _ = require('lodash');
const config = require('./config');
const Vue = require('vue/dist/vue.js');
const d3 = require('d3/dist/d3.min.js');
const processLog = require('./process.log');
const socket = io();

const vueData = {
  connected: false,
  logs: [],
  width: 980,
  height: 500
};
window.vueData = vueData; // debug inspection and fiddling

new Vue({
  el: '#app',
  data: vueData,
  ready: function() {
    // e.g. register components
  },
  methods: {
    renderChart() {
      if (document.getElementsByTagName('svg')){
          d3.selectAll('svg').remove();
      }

      const data = this.logs;
      const dateFields = ['date', 'hour', 'minute', 'day'];
      // prep the data, merging records to mean() of the per hour
      const hourly = d3.nest()
        .key(d=>d.hour)
        .rollup(function(v) {
          const record = {};
          Object.keys(data[0]).forEach(k=>{
            if(!dateFields.includes(k)){
              return record[k] = d3.mean(v, d=>d[k]);
            }
          })
          return record;
        })
        .entries(data);
      console.log({hourly});

      // prep the data, extract each line we want to draw into a new series
      const series = [];
      config.lines.forEach(conf=>{
        series.push({
          p: hourly.map(group=>{
            return {
              x: new Date(group.key),
              y: group.value[conf.field]
            }
          }),
          c: conf.color,
          l: conf.label,
          w: conf.width
        })
      });
      window.series = series;

      var margin = { top: 20, right: 20, bottom: 30, left: 50 };
      var width = this.width - margin.left - margin.right;
      var height = this.height - margin.top - margin.bottom;

      // set the ranges
      var x = d3.scaleTime().range([0, width]);
      var y = d3.scaleLinear().range([height, 0]);

      var svg = d3.select("#all-data").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

      // scale the range of the data
      x.domain(d3.extent(data, d=>d.date));
      y.domain([
        d3.min(data, d => d.price - d.price*.2),
        d3.max(data, d => d.price + d.price*.2)
      ]);

      // add the area
      svg.append("path")
        .data([data])
        .attr("class", "area")
        .attr("d", d3.area()
          .x(d=> x(d.date))
          .y0(height)
          .y1(d=>y(d.price))
        );

      var line = d3.line()
        .x(d=>x(d.x))
        .y(d=>y(d.y));

      series.forEach(path=>{
        svg.append("path")
          .data([path])
          .attr("class", "line")
          .text(d=>d.l)
          .style('stroke-width', d=>d.w)
          .style('stroke', d=>d.c)
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


socket.on('hello', function(data){
  console.log('socket', data);
  vueData.connected = true;
});

socket.on('logs', function(logs){
  console.log('logs', logs);
  vueData.logs = logs.map(processLog);
});

socket.on('log', function(line){
  console.log('log', line);
  vueData.logs.push(processLog(line));
});

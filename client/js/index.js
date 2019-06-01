// var _ = require('lodash');
const config = require('./config');
const Vue = require('vue/dist/vue.js');
const processLog = require('./process.log');
const socket = io();
const dateFields = ['date', 'hour', 'minute', 'day'];

const vueData = {
  connected: false,
  logs: [],
  grouping: 'hour',
  target: 'default',
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
    renderChart() {
      if (document.getElementsByTagName('svg')){
          d3.selectAll('svg').remove();
      }

      const recordKeys = Object.keys(this.logs[0]);
      // prep the data, merging records via mean() of each numeric value
      console.log(this.logs);
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
        .entries(this.logs);
      console.log({grouping});

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
          width: 1
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
        console.log(conf)
        if(conf.field==='price'){
          priceData = data.p;
        }
        if(conf.name==='buy'){
          supportData = data.p;
        }
        if(conf.name==='sell'){
          resistanceData = data.p;
        }
      });
      window.series = series;

      var color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeSet2);

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

      // LEGEND
      // Add one dot in the legend for each name.
      svg.selectAll("mydots")
        .data(keys)
        .enter()
        .append("circle")
          .attr("cx", 50)
          .attr("cy", (d,i) => 25 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
          .attr("r", 7)
          .style("fill", d=>color(d))

      // Add one dot in the legend for each name.
      svg.selectAll("mylabels")
        .data(keys)
        .enter()
        .append("text")
          .attr("x", 60)
          .attr("y", (d,i) => 25 + i*25)
          .style("fill", d=>color(d))
          .text(d=>d)
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")

      // scale the range of the data
      x.domain(d3.extent(priceData, d=>d.x));
      y.domain([
        d3.min(supportData, d => d.y - d.y*.2),
        d3.max(resistanceData, d => d.y + d.y*.2)
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

      var line = d3.line()
        .x(d=>x(d.x))
        .y(d=>y(d.y));

      series.forEach(path=>{
        svg.append("path")
          .data([path])
          .attr("class", "line")
          .text(d=>d.l)
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

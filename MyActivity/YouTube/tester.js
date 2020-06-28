// Feel free to change or delete any of the code you see in this editor!
var svg = d3.select("body").append("svg")
  .attr("width", 960)
  .attr("height", 600);

var tickDuration = 500;
let data;

var top_n = 10;
var height = 600;
var width = 960;

const margin = {
  top: 80,
  right: 0,
  bottom: 5,
  left: 0
};

let barPadding = (height-(margin.bottom+margin.top))/(top_n*5);

let title = svg.append('text')
 .attr('class', 'title')
 .attr('y', 24)
 .html('Your Top 10 YouTube Channels');

let subTitle = svg.append("text")
 .attr("class", "subTitle")
 .attr("y", 55)
 .html("Views");

let caption = svg.append('text')
 .attr('class', 'caption')
 .attr('x', width)
 .attr('y', height-5)
 .style('text-anchor', 'end')
 .html('Source: Google Takeout');

 let year = 2016;

languagePluginLoader.then(function () {
  input = document.querySelector('input[type=file]');
  input.addEventListener("change", function(event) {
    const reader = new FileReader();
    reader.onload = function() {
    //data5 = JSON.parse(reader.result)
     data5=reader.result
     document.getElementById("exp2").style.display = "none";
       pyodide.loadPackage(['pandas']).then(()  => {
         pyodide.runPython(`
           import pandas as pd
           import js
           df = pd.read_json(js.data5)
           df['time'] = df['time'].apply(pd.to_datetime)
           df = df[df.subtitles.notna()]
           def extract(x):
            return x[0]['name']
           names = map(extract,df.subtitles)




           print('hello')
           print(len(names))
           print(df.shape)
           `)
         let data2 = pyodide.pyimport('df11')
         console.log(data2)
       });

     draw_chart5(data)
    }
    reader.readAsText(input.files[0])
  },false)});



d3.csv('tester.csv').then(function(data) {
//if (error) throw error;

var colorScale = d3.scaleOrdinal(d3.schemeTableau10);

   data.forEach(d => {
    d.value = +d.value,
    d.lastValue = +d.previous,
    d.value = isNaN(d.value) ? 0 : d.value,
    d.year = +d.year_month-0.01,
    d.month = d.month
    });

 let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
  .sort((a,b) => b.value - a.value)
  .slice(0, top_n);

  yearSlice.forEach((d,i) => d.rank = i);

 console.log('yearSlice: ', yearSlice)

 let x = d3.scaleLinear()
    .domain([0, d3.max(yearSlice, d => d.value)])
    .range([margin.left, width-margin.right-65]);

 let y = d3.scaleLinear()
    .domain([top_n, 0])
    .range([height-margin.bottom, margin.top]);

  colorScale.domain(data.map(function (d){ return d['names']; }));

 let xAxis = d3.axisTop()
    .scale(x)
    .ticks(width > 500 ? 5:2)
    .tickSize(-(height-margin.top-margin.bottom))
    .tickFormat(d => d3.format(',')(d));

  svg.append('g')
    .attr('class', 'axis xAxis')
    .attr('transform', `translate(0, ${margin.top})`)
    .call(xAxis)
    .selectAll('.tick line')
    .classed('origin', d => d == 0)

 svg.selectAll('rect.bar')
    .data(yearSlice, d => d.names)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', x(0)+1)
    .attr('width', d => x(d.value))
    .attr('y', d => y(d.rank)+5)
    .attr('height', y(1)-y(0)-barPadding)
    .style('fill', function (d){ return colorScale(d['names']); });

 svg.selectAll('text.label')
    .data(yearSlice, d => d.names)
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.value)-8)
    .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
    .style('text-anchor', 'end')
    .style('font-size','10px')
    .html(d => d.names);

svg.selectAll('text.valueLabel')
  .data(yearSlice, d => d.names)
  .enter()
  .append('text')
  .attr('class', 'valueLabel')
  .attr('x', d => x(d.value)+5)
  .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
  .text(d => d3.format(',.0f')(d.lastValue))
  .style('font-size','10px')

let yearText = svg.append('text')
  .attr('class', 'yearText')
  .attr('x', width-margin.right)
  .attr('y', height-25)
  .style('text-anchor', 'end')
  .html(~~year)
  .call(halo, 10);

let ticker = d3.interval(e => {

  yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
    .sort((a,b) => b.value - a.value)
    .slice(0,top_n);

  yearSlice.forEach((d,i) => d.rank = i);

  //console.log('IntervalYear: ', yearSlice);

  x.domain([0, d3.max(yearSlice, d => d.value)]);

  svg.select('.xAxis')
    .transition()
    .duration(tickDuration)
    .ease(d3.easeLinear)
    .call(xAxis);

   let bars = svg.selectAll('.bar').data(yearSlice, d => d.names);

   bars
    .enter()
    .append('rect')
    .attr('class', d => `bar ${d.names.replace(/\s/g,'_')}`)
    .attr('x', x(0)+1)
    .attr( 'width', d => x(d.value)-x(0)-1)
    .attr('y', d => y(top_n+1)+5)
    .attr('height', y(1)-y(0)-barPadding)
    .style('fill', function (d){ return colorScale(d['names']); })
    .style('font-size','10px')
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+5);

   bars
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(d.rank)+5);

   bars
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('width', d => x(d.value)-x(0)-1)
      .attr('y', d => y(top_n+1)+5)
      .remove();

   let labels = svg.selectAll('.label')
      .data(yearSlice, d => d.names);

   labels
    .enter()
    .append('text')
    .attr('class', 'label')
    .attr('x', d => x(d.value)-8)
    .attr('y', d => y(top_n+1)+5+((y(1)-y(0))/2))
    .style('text-anchor', 'end')
    .html(d => d.names)
    .style('font-size','10px')
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);


   labels
      .transition()
      .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

   labels
      .exit()
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)-8)
        .attr('y', d => y(top_n+1)+5)
        .remove();



   let valueLabels = svg.selectAll('.valueLabel').data(yearSlice, d => d.names);

   valueLabels
      .enter()
      .append('text')
      .attr('class', 'valueLabel')
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(top_n+1)+5)
      .text(d => d3.format(',.0f')(d.lastValue))
      .style('font-size','10px')
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1);

   valueLabels
      .transition()
        .duration(tickDuration)
        .ease(d3.easeLinear)
        .attr('x', d => x(d.value)+5)
        .attr('y', d => y(d.rank)+5+((y(1)-y(0))/2)+1)
        .tween("text", function(d) {
           let i = d3.interpolateRound(d.lastValue, d.value);
           return function(t) {
             this.textContent = d3.format(',')(i(t));
          };
        });


  valueLabels
    .exit()
    .transition()
      .duration(tickDuration)
      .ease(d3.easeLinear)
      .attr('x', d => x(d.value)+5)
      .attr('y', d => y(top_n+1)+5)
      .remove();

  if (d3.format('.2f')(year%1) == 0.00){
    month = 'Jan'
  } else if (d3.format('.2f')(year%1) == 0.01){
    month = 'Feb'
  } else if (d3.format('.2f')(year%1) == 0.02){
    month = 'Mar'
  } else if (d3.format('.2f')(year%1) == 0.03){
    month = 'Apr'
  } else if (d3.format('.2f')(year%1) == 0.04){
    month = 'May'
  } else if (d3.format('.2f')(year%1) == 0.05){
    month = 'Jun'
  } else if (d3.format('.2f')(year%1) == 0.06){
    month = 'Jul'
  } else if (d3.format('.2f')(year%1) == 0.07){
    month = 'Aug'
  } else if (d3.format('.2f')(year%1) == 0.08){
    month = 'Sep'
  } else if (d3.format('.2f')(year%1) == 0.09){
    month = 'Oct'
  } else if (d3.format('.2f')(year%1) == 0.10){
    month = 'Nov'
  } else if (d3.format('.2f')(year%1) == 0.11){
    month = 'Dec'
  }

  yearText.html(month + ' ' + ~~year);

 if(+year === 2020.04) ticker.stop();
 if(d3.format('.2f')(year%1) < 0.11){
   year = d3.format('.2f')((+year) + 0.01);}
 else{
   year = d3.format('.2f')((+year) + 0.89);}
},tickDuration);

});

const halo = function(text, strokeWidth) {
text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
.style('fill', '#ffffff')
 .style( 'stroke','#ffffff')
 .style('stroke-width', strokeWidth)
 .style('stroke-linejoin', 'round')
 .style('opacity', 1);

}

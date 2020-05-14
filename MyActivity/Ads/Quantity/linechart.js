
let file;


input = document.querySelector('input[type=file]');
input.addEventListener("change", function(event) {
  console.log(input.files)
  const reader = new FileReader();
  reader.onload = function() {
    let data = JSON.parse(reader.result)
    console.log(data)
    draw_chart(data)
  }
  reader.readAsText(input.files[0])
},false)


const width=700, height = 500
margin = ({top: 20, right: 12, bottom: 70, left: 30})
const N=7

const canvas = d3.select('#chart1')
                .append('svg')
                .attr('id','chart1svg')
                .attr('height',height)
                .attr('width',width)
                .append('g')
                .attr('transform','translate(0,0)');




async function draw_chart(data_temp) {
    data = data_temp.map(function(el) {
    const parser = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
    el.time = parser(el.time);
    const formatter = d3.timeFormat("%d-%m-%Y");
    el.datef = formatter(el.time)
    return el.time
    });

    canvas.append("text")
      .attr("x", (width / 2))
      .attr("y", 0 + (margin.top))
      .attr("text-anchor", "middle")
      .style("font-size", "21px")
      .style("font-family","Courier New")
      .text("How many ads do you see each day?");

  //group by day (count)
//  var dataCount = d3.nest()
//  .key(function(d) { return d.time; })
//  .rollup(function(v) {return v.length})
//  .entries(data);

  startDateX = data[data.length-1]
  endDateX = data[0]
  console.log(data[data.length-1])
  num_of_days = d3.timeDay.count(startDateX, endDateX)
  //days = d3.timeDay.count(startDateX,endDateX);

  x = d3.scaleTime()
    .domain([startDateX,endDateX])
    .range([margin.left, width-margin.right])

  bins = d3.histogram()
    .domain(d3.extent(data))
    .thresholds(x.ticks(num_of_days/7))
  (data)

  values = movingAverage(bins.map(d => d.length), N);
  console.log(values)

  y = d3.scaleLinear()
    .domain([0, d3.max(values)]).nice()
    .rangeRound([height-margin.bottom, margin.top])

  area = d3.area()
    .defined(d => !isNaN(d))
    .x((d, i) => x(bins[i].x0))
    .y0(y(0))
    .y1(y);

  areaNone = d3.area()
    .defined(d => !isNaN(d))
    .x((d, i) => x(bins[i].x0))
    .y0(y(0))
    .y1(y(0));




  xAxis = g => g
    .attr("transform", `translate(0,${height-margin.bottom})`)
    .call(d3.axisBottom(x).tickSizeOuter(1))

  yAxis = g => g
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSizeOuter(1))



    canvas
    .attr("viewBox", [0, 0, width, height])

    canvas.append("g")
        .call(xAxis);

    canvas.append("g")
        .call(yAxis);

    canvas.append("path")
        .attr('d', areaNone(values))
        .transition()
          .duration(2000)
          .delay(function (d, i) {
				        return i * 50;
			           })
          .attr("fill", "steelblue")
          .attr("d", area(values));
}

function movingAverage(values, N) {
  let i = 0;
  let sum = 0;
  const means = new Float64Array(values.length).fill(NaN);
  for (let n = Math.min(N - 1, values.length); i < n; ++i) {
    sum += values[i];
  }
  for (let n = values.length; i < n; ++i) {
    sum += values[i];
    means[i] = sum / N;
    sum -= values[i - N + 1];
  }
  return means;
}

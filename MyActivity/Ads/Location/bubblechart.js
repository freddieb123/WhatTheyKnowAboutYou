let reader2 = new FileReader();
let data;

input = document.querySelector('input[type=file]');
input.addEventListener("change", function(event) {
  console.log(input.files)
  const reader = new FileReader();
  reader.onload = function() {
    data = JSON.parse(reader.result)


    data.map(function(el) {
    let parser = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
    el.time = parser(el.time);
    let formatter = d3.timeFormat("%Y");
    el.year = +formatter(el.time)
    return el
    });

    draw_chart1(2020,data)
    slider(array)
  }
  reader.readAsText(input.files[0])
},false)


const width2=700, height2 = 500
let year;
array = [2016,2017,2018,2019,2020]

var gColorPicker = d3.select('div#slider-color-picker')
  .append('svg')
  .attr('width', 500)
  .attr('height', 200)
  .append('g')
  .attr('transform', 'translate(30,30)');

const div = d3.select('#chart2').append('div')
  .attr('class','tooltip')
  .style('opacity',0);



async function draw_chart1(year,data) {

   console.log(data)


    const canvas = d3.select('#chart2')
    .append('svg')
    .attr('id','chart2svg')
    .attr('height',height2)
    .attr('width',width2)
    .attr('class','chart2')
    .append('g')
    .attr('transform','translate(0,40)');

    canvas.append("text")
      .attr("x", (width / 2))
      .attr("y", 0 + (10))
      .attr("text-anchor", "middle")
      .style("font-size", "21px")
      .style("font-family",'Courier New')
      .text("Where do you see the most ads, by year?");



    function range(start, end) {
        var ans = [];
        for (let i = start; i <= end; i++) {
            ans.push(i);
        }
        return ans;
    }



    //array = range(d3.min(data, function(d) {return d.year})
                                    //  ,d3.max(data, function(d) {return d.year;}))

    //year = array.slice(-1)[0]

    //group by day (count)
  let dataCount1=[];

  let dataCount = d3.nest()
  .key(function(d) { return d.header; })
  .key(function(d) { return d.year; })
  .rollup(function(v) {
    dataCount1.push({
    location: v[0].header,
    count: v.length,
    year: v[0].year})
    return dataCount1
  })
  .entries(data);

  let dataCount2 = dataCount1.filter(function(d) {
    if (d.count > 10 & d.year===year) {
      return d
    }
  });
  console.log(dataCount1)



//  var myColor = d3.scaleSequential()
//    .domain([0,d3.max(data, function(d) {return d.count;})])
//    .interpolator(d3.interpolateHcl('blue', 'green'))
  let color = d3.scaleOrdinal(d3.schemePastel1)
  let radiusScale = d3.scaleSqrt()
    .domain([0,d3.max(dataCount2, function(d) {return d.count;})])
    .range([0,100])

  let simulation = d3.forceSimulation()
    .force('x',d3.forceX(width2/2).strength(0.05))
    .force('y',d3.forceY(height2/2).strength(0.05))
    .force('collide',d3.forceCollide(function(d) {
      return radiusScale(d.count) +1
    }))

  let circles = canvas.selectAll('circle')
            .data(dataCount2.filter(function(d) {return d}))
            .enter()
            .append('circle')
              .attr('r', function(d) {
                return radiusScale(d.count)
              })
              .attr('fill', function(d) {
                return color(d.location)
              })
            .on("mouseover", function(d) {
              div.transition()
                .duration(100)
                .style('opacity',1);
              div.html('<strong>Location:</strong> ' + d.location + '<br> <strong>Count:</strong> ' + d.count)
                .style('left',(d3.event.pageX)+"px")
                .style('top',(d3.event.pageY-28)+"px");
              })

             .on("mouseout", function(d) {
                 div.transition()
                  .duration(100)
                  .style('opacity',0)

               })
              .on("mousemove", function(d) {
                div.style("left", d3.event.pageX + "px")
                div.style("top",  (d3.event.pageY-28) + "px");
              })

              .on("mouseover.highlight", function(d) {
                d3.select(this)
                  .raise() // bring to front
                  .style("stroke", "red")
                  .style("stroke-width", 2);
                  })

              .on("mouseout.highlight", function(d) {
                  d3.select(this)
                    .style("stroke", null);
                })


        simulation.nodes(dataCount2)
          .on('tick',ticked)

        function ticked() {
          circles
            .attr('cx',function(d) {
              return d.x
            })
            .attr('cy', function(d) {
              return d.y
            })
          }

}


function slider(array){
    let slider =
      d3.sliderBottom()
      .min(array[0])
      .max(array[array.length-1])
      .default(array[array.length-1])
      .tickFormat(d3.format('.0f'))
      .step(1)
      .width(150)
      .ticks(0)
      .displayValue(true)
      .fill('grey')
      .handle(
        d3
          .symbol()
          .type(d3.symbolCircle)
          .size(200)()
      )
      .on('onchange', async (num) => {
        year = num
        d3.select("#chart2svg").remove();
        console.log(year)
        draw_chart1(year,data)
      })



    gColorPicker
      .append('g')
      .attr('transform', 'translate(150,0)')
      .call(slider);

    }

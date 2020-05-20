margin = ({top: 20, right: 20, bottom: 70, left: 60})
const width=700-margin.left-margin.right, height = 500-margin.bottom-margin.top
color = "steelblue"


input = document.querySelector('input[type=file]');
input.addEventListener("change", function(event) {
  const reader = new FileReader();
  reader.onload = function() {
    let data = JSON.parse(reader.result)
    document.getElementById("exp2").style.display = "none";
    draw_chart5(data)
  }
  reader.readAsText(input.files[0])
},false)

const canvas = d3.select('#chart5')
                .append('svg')
                .attr('id','chart5svg')
                .attr('height',height)
                .attr('width',width+margin.left+margin.right)
                .append('g')
                  .attr('transform',"translate(" + margin.left + "," + margin.top + ")");

async function draw_chart5(data_temp) {
    data = data_temp.map(function(el) {
    const parser = d3.timeParse("%Y-%m-%dT%H:%M:%S.%LZ");
    el.time = parser(el.time);
    const formatter = d3.timeFormat("%Y-%m-%d");
    el.datef = formatter(el.time)
    return el
    });


    let data2 = data.filter(function(d) {
        try {
          d.subtitles[0]
          return d
        } catch{}
    });


    let dataCount1=[]

    let dataCount = d3.nest()
      .key(function(d) {return d.subtitles[0].name })
      .rollup(function(v) {
        console.log(v)
        dataCount1.push({
        name: v[0].subtitles[0].name,
        count: v.length
      })
        return dataCount1
      })
      .entries(data2);

    let top10 = dataCount1.sort(function(a, b) { return a.count < b.count ? 1 : -1; })
              .slice(0, 10);

      console.log(top10)

    x = d3.scaleLinear()
    .domain([0, d3.max(top10, d => d.count)])
    .range([margin.left, width-margin.right])

    y = d3.scaleBand()
    .domain(d3.range(top10.length))
    .range([height - margin.bottom, margin.top])
    .padding(0.1)

    canvas.append("g")
      .attr("fill", color)
    .selectAll("rect")
    .data(top10)
    .enter().append('rect')
      .attr("transform", "translate(0,0)")
      .attr('x',margin.left)
      .attr("y", (d, i) => y(top10.length-i-1))
      //.attr("y", d => y(d.name))
      //.attr("x", d => x(d.count))
      .attr("width", d => x(d.count)-margin.left)
      .attr("height", y.bandwidth());

      // add the x Axis
  canvas.append("g")
      .attr("transform", "translate(0,"+(height-margin.bottom)+")")
      .call(d3.axisBottom(x));

  // add the y Axis
  canvas.append("g")
      .attr("transform", "translate("+margin.left+   "," +0+ ")")
      .call(d3.axisLeft(y).tickFormat(i => top10[top10.length-i-1].name).tickSizeOuter(0))



}

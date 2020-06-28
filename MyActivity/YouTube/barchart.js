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
    const formatter = d3.timeFormat("%Y-%m");
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

    // datevalues = Array.from(d3.rollup(data2, ([d]) => d.value, d => +d.datef, d => d.name))
    //   .map(([datef, data]) => [new Date(datef ), data])
    //   .sort(([a], [b]) => d3.ascending(a, b))

    let dataCount = d3.nest()
      .key(function(d) {return d.datef})
      .key(function(d) {return d.subtitles[0].name })
      .rollup(function(v) {
        dataCount1.push({
        month: v[0].datef,
        name: v[0].subtitles[0].name,
        count: v.length,
      })
        return dataCount1
      })
      .entries(data2);

      dataCount1 = dataCount1.filter(function(d) {
        if (!d.month.includes("1970")){
          return d
        }
      })

      let dataCount1_sorted = dataCount1.sort(function(a, b) { return a.month > b.month ? 1 : -1; })

      names = new Set(dataCount1.map(d => d.name))
      names = Array.from(names)
      dataCount1 = Object.values(dataCount1)
      console.log(names,dataCount1_sorted)

      //get cumulative sum for the number of views for each month - the bar chart will be growing!
      for (i=0;i<names.length;i++){
        count_array = []
        for (j=0;j<dataCount1_sorted.length;j++){
          if(names[i] === dataCount1_sorted[j].name){
            count_array.push(dataCount1_sorted[j].count)
            sum = count_array.reduce((a, b) => a + b, 0)
            dataCount1_sorted[j].cum_sum = sum
          } else {};
        }
      }

      datevalues = Array.from(d3.rollup(dataCount1_sorted, ([d]) => d.cum_sum, d => d.month, d => d.name))
          .map(([date, data]) => [new Date(date), data])
          .sort(([a], [b]) => d3.ascending(a, b))
      console.log(datevalues)

      languagePluginLoader.then(function (data) {
        pyodide.runPython('import js;data=js.data;print(data[0])')});

      // datevalues = d3.group(dataCount1_sorted, d => d.month)
      let n=10;

      function rank(value) {
        const data = Array.from(names, name => ({name, value: value(name)}));
        console.log(data)
        data.sort((a, b) => d3.descending(a.value, b.value));
        for (let i = 0; i < data.length; ++i) data[i].rank = Math.min(n, i);
        return data;
        }
      console.log(rank(name => datevalues[94][1].get(name)))

      //cycle through and plot bar chart for each month
      Array.from(datevalues, ([key, values]) => {
        x = d3.scaleLinear()
        .domain([0, d3.max(values, d => d.cum_sum)])
        .range([margin.left, width-margin.right])

        y = d3.scaleBand()
        .domain(d3.range(values.length))
        .range([height - margin.bottom, margin.top])
        .padding(0.1)

        canvas.append("g")
          .attr("fill", color)
        .selectAll("rect")
        .data(values)
        .enter().append('rect')
          .attr("transform", "translate(0,0)")
          .attr('x',margin.left)
          .attr("y", (d, i) => y(values.length-i-1))
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
          .call(d3.axisLeft(y).tickFormat(i => values[values.length-i-1].name).tickSizeOuter(0))
      })
        // .map(([month, dataCount1]) => {console.log(month);[new Date(month), dataCount1]})
        // .sort(([a], [b]) => d3.ascending(a, b))

      //find cumulative count for each channel
    //   console.log(datevalues)
    //
    // let top10 = dataCount1.sort(function(a, b) { return a.count < b.count ? 1 : -1; })
    //           .slice(0, 10);






}

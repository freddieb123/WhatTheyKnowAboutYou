let margin = {top: 50, left: 50, right: 50, bottom: 50},
  height = 700-margin.top-margin.bottom,
  width = 1200-margin.left-margin.right;

  input = document.querySelector('input[type=file]');
  input.addEventListener("change", function(event) {
    const reader = new FileReader();
    reader.onload = function() {
      let location = JSON.parse(reader.result)
      document.getElementById("exp").style.display = "none";
      draw(location)
    }
    reader.readAsText(input.files[0])
  },false)

let draw = function (location) {
  let svg = d3.select('#map')
    .append('svg')
    .attr('height', height + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .append('g')
  //  .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

  let projection = d3.geoMercator()
    .translate([(width+50)/2, (height+130)/2])
    .scale(200)

  let path = d3.geoPath()
    .projection(projection)


  d3.queue()
    .defer(d3.json, "world.topojson")
    .await(ready)

  times = []

  function ready (error,data) {
    console.log(location.locations)
    location.locations.forEach((obj,i) => {
      obj.latitudeE7 = obj.latitudeE7 / 10 ** 7
      obj.longitudeE7 = obj.longitudeE7 / 10 ** 7
      if (i>1) {
        obj.diff = (obj.timestampMs - location.locations[i-1].timestampMs)/(1000*60)
        times.push(obj.diff)
      }
     })

     const len = times.length
     const arrSort = times.sort();
     const mid = Math.ceil(len / 2);
     const median_time = len % 2 == 0 ? (arrSort[mid] + arrSort[mid - 1]) / 2 : arrSort[mid - 1];

    let countries = topojson.feature(data,data.objects.countries).features

    //document.getElementById('map-title').innerHTML = 'Where Google knows, or thinks, you have been:'
    document.getElementById('stats1').innerHTML = 'Number of location pings in your file: ' + location.locations.length
    document.getElementById('stats2').innerHTML = 'Median time between pings: ' + median_time.toFixed(2) + ' minutes'


    svg.selectAll('.country')
      .data(countries)
      .enter().append('path')
      .attr('class','country')
      .attr('d', path)


    svg.selectAll('.points')
      .data(location.locations)
      .enter()
      .append('circle')
      .attr('r',3)
      .style("fill", 'turquoise')
      .attr('cx',function(d) {
         let coords = projection([d.longitudeE7,d.latitudeE7])
         if (coords[0]) {
           return coords[0]
         } else {
           return 0};
      })
      .attr('cy',function(d) {
         let coords = projection([d.longitudeE7,d.latitudeE7])
         if (coords[1]) {
           return coords[1]
         } else {
           return 0};
      })
      .on('mouseover', function(d) {
        console.log(d.timestampMs)
      })
  }
}

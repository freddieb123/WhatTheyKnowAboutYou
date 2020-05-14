(function () {
  let margin = {top: 50, left: 50, right: 50, bottom: 50},
    height = 700-margin.top-margin.bottom,
    width = 1200-margin.left-margin.right;

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
      .defer(d3.csv, "location_data_2.csv")
      .await(ready)

    function ready (error,data, location) {
      console.log(data)

      let countries = topojson.feature(data,data.objects.countries).features

      svg.selectAll('.country')
        .data(countries)
        .enter().append('path')
        .attr('class','country')
        .attr('d', path)


      svg.selectAll('.points')
        .data(location)
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

})()

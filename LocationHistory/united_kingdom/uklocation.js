(function () {
  let margin = {top: 50, left: 50, right: 50, bottom: 50},
    height = 400-margin.top-margin.bottom,
    width = 800-margin.left-margin.right;

    let svg = d3.select('#map')
      .append('svg')
      .attr('height', height + margin.top + margin.bottom)
      .attr('width', width + margin.left + margin.right)
      .append('g')
      .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

    let projection = d3.geoMercator()
      .translate([width/2, height/2])
      .scale(100)

    let path = d3.geoPath()
      .projection(projection)

    d3.queue()
      .defer(d3.json, "uk_2.json")
      .await(ready)

    function ready (error,data) {
      console.log(data)

      let local_auths = topojson.feature(data,data.objects.GBR_adm2.geometries).features
      console.log(local_auths)

    }

})()

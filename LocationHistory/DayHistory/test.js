
var config = {
    "scale": 98304,
    "lat": 51.0375,
    "lon": -114.09,
    "fps": 15,
    "resampleInterval": 30
};

let date_test =  new Date("October 13, 2019 11:13:00")

var canvasPoints = document.querySelector("canvas#points"),
    contextPoints = canvasPoints.getContext("2d"),
    contextTracks = document.querySelector("canvas#tracks").getContext("2d"),
    detachedContainer = document.createElement("custom"),
    dataContainer = d3.select(detachedContainer),
    width = canvasPoints.width,
    height = canvasPoints.height;

var projection = d3.geoMercator()
    .scale((config.scale) / 2 * Math.PI)
    .translate([width / 2, height / 2])
    .center([config.lon, config.lat])
    .precision(0);

var path = d3.geoPath()
    .projection(projection)
    .pointRadius(3.5)
    .context(contextTracks);

var tiles = d3.tile()
    .size([width, height])
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection([0, 0]))();

var playButton = d3.select("#play-button"),
    restartButton = d3.select("#restart-button"),
    timer = d3.select("#timer");

d3.select("svg").selectAll("image")
    .data(tiles)
    .enter().append("image")
    .attr("xlink:href", function (d) { return "http://" + "abc"[d[1] % 3] + ".tile.openstreetmap.org/" + d[2] + "/" + d[0] + "/" + d[1] + ".png"; })
    .attr("x", function (d) { return (d[0] + tiles.translate[0]) * tiles.scale; })
    .attr("y", function (d) { return (d[1] + tiles.translate[1]) * tiles.scale; })
    .attr("width", tiles.scale)
    .attr("height", tiles.scale);

input = document.querySelector('input[type=file]');
input.addEventListener("change", function(event) {
  const reader = new FileReader();
  reader.onload = function() {
    let route = JSON.parse(reader.result)
    draw4(route)
  }
  reader.readAsText(input.files[0])
},false)

function draw4(route) {
  console.log(route.locations)
  route.locations.forEach((obj,i) => {
    obj.latitudeE7 = obj.latitudeE7 / 10 ** 7
    obj.longitudeE7 = obj.longitudeE7 / 10 ** 7
    obj.full_date = new Date(parseInt(obj.timestampMs))
    obj.date = obj.full_date.toDateString()
    })
  route = route[Object.keys(route)[0]]

  var nested = d3.nest()
        .key(function (d) { return d.date; })
        .entries(route);

  var tracks = dataContainer.selectAll("custom.geoPath")
        .data(nested, function(d) {
          if (d.date === date_test) {
            return d;
          }
        })
        .enter()
        .append("custom")
        .classed("geoPath", true);

  var runners = dataContainer.selectAll("custom.circle")
        .data(nested)
        .enter()
        .append("custom")
        .classed("circle", true)
        .attr("radius", 2);
  console.log(runners)

  function drawCanvas(t) {
        contextTracks.strokeStyle = "rgba(74,20,134,0.2)";
        contextTracks.lineWidth = 3;

        tracks.each(function () {
            var node = d3.select(this),
                trackData = node.data()[0].values;

            if (t > 0 && t < trackData.length) {
                contextTracks.beginPath();
                path({type: "LineString", coordinates: [trackData[t-1], trackData[t]]});
                contextTracks.stroke();
            }
        });

        contextPoints.clearRect(0, 0, width, height);
        contextPoints.lineWidth = 1;
        contextPoints.strokeStyle = "black";
        contextPoints.beginPath();

        runners.each(function () {
            var node = d3.select(this);
            contextPoints.moveTo(parseFloat(node.attr("x")) + parseFloat(node.attr("radius")), node.attr("y"));
            contextPoints.arc(node.attr("x")+ node.attr("radius"), node.attr("y"), node.attr("radius"), 0, 2 * Math.PI);
        });

            contextPoints.stroke();

    }

    var coord_slicer = function (d, t) {
        return projection(d.values[Math.min(t, d.values[0][3] - 1)]);
    };

}

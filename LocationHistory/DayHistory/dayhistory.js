//https://github.com/epsalt/d3-running-map
var config = {
    "scale": 50000,
    "fps": 10,
    "resampleInterval": 30
};
let current;
let previous = [config.lon,config.lat]
let t=0;
let change;
let error = false;
let count_false;

let date_test =  new Date("January 2, 2020 11:13:00")
date_test = date_test.toDateString()

var canvasPoints = document.querySelector("canvas#points"),
    contextPoints = canvasPoints.getContext("2d"),
    contextTracks = document.querySelector("canvas#tracks").getContext("2d"),
    detachedContainer = document.createElement("custom"),
    dataContainer = d3.select(detachedContainer),
    width = canvasPoints.width,
    height = canvasPoints.height;

input = document.querySelector('input[type=date]');
input.addEventListener("change", function(event) {
  const reader = new FileReader();
  reader.onload = async function() {
    route = await JSON.parse(reader.result)
    contextTracks.clearRect(0, 0, width, height);
    contextPoints.clearRect(0,0,width,height);
    dataContainer.selectAll("custom.geoPath").remove()
    dataContainer.selectAll("custom.circle").remove()
    t=0;
    d3.selectAll('image').remove()
    change=true
    draw4(route)
  }
  reader.readAsText(input.files[0])
},false)

input = document.querySelector('input[type=file]');
input.addEventListener("change", function(event) {
  const reader = new FileReader();
  reader.onload = function() {
    document.getElementById("exp2").style.display = "none";
    document.getElementById("datelabel").style.display = "inline";
    document.getElementById("date").style.display = "inline";
    document.getElementById("numberofpoints").style.display = "block";

    route = JSON.parse(reader.result)
    draw4(route)
  }
  reader.readAsText(input.files[0])
},false)




function draw4(route) {
  route.locations.forEach((obj,i) => {
    obj.latitudeE7 = obj.latitudeE7 / 10 ** 7
    obj.longitudeE7 = obj.longitudeE7 / 10 ** 7
    obj.full_date = new Date(parseInt(obj.timestampMs))
    obj.time_of_day = obj.full_date.getHours() +':'+obj.full_date.getMinutes()
    obj.date = obj.full_date.toDateString()
    })
    route = route[Object.keys(route)[0]]

  date = document.getElementById("date").value
  date=new Date(date)
  date = date.toDateString()

  let route2 = route.filter(function(d) {
      if (d.date ===date & d.accuracy <=800) {
        return d
      }
  });
  route2.shift()
  if (route2.length===0) {
    document.getElementById("numberofpoints").style.display = "none";
    document.getElementById('target').innerHTML = "Sorry, Google hasn't got any of your data for this day."
    document.getElementById('target').style.display = "block"

    error = true
    count_false=0
  }
  else {
    document.getElementById('target').style.display = "none"
    document.getElementById("numberofpoints").style.display = "block";
    error=false
    going=true
    count_false ++
  }

  document.getElementById('numberofpoints').innerHTML = 'Number of location pings for this day: ' + route2.length


  long = []
  lat = []
  route2.forEach((obj,i) => {
    lat.push(obj.latitudeE7)
    long.push(obj.longitudeE7)
  })

  var total = 0;
  for(var i = 0; i < long.length; i++) {
      total += long[i];
  }
  var long_avg = total / long.length;

  var total1 = 0;
  for(var i = 0; i < lat.length; i++) {
      total1 += lat[i];
  }
  var lat_avg = total1 / lat.length;

    min_lat = d3.min(lat)
    max_lat = d3.max(lat)
    min_long = d3.min(long)
    max_long = d3.max(long)

    var min_lat2 = route2.find(function(element) {
    return element.latitudeE7 === min_lat;
    });

    var max_lat2 = route2.find(function(element) {
    return element.latitudeE7 === max_lat;
    });

    var min_long2 = route2.find(function(element) {
    return element.longitudeE7 === min_long;
    });

    var max_long2 = route2.find(function(element) {
    return element.longitudeE7 === max_long;
    });

    // min_long_proj = projection([min_long2.longitudeE7,min_long2.latitudeE7])[0]
    // max_long_proj = projection([max_long2.longitudeE7,max_long2.latitudeE7])[0]
    // min_lat_proj = projection([min_lat2.longitudeE7,min_lat2.latitudeE7])[1]
    // max_lat_proj = projection([max_lat2.longitudeE7,max_lat2.latitudeE7])[1]

    scale = 0.4 / Math.min(
          (max_lat2.latitudeE7 - min_lat2.latitudeE7) / height,
          (max_long2.longitudeE7 - min_long2.longitudeE7) / width
        );

    let trans = [(width-(scale*(max_long2.longitudeE7+min_long2.longitudeE7)/2)),(height-(scale*(max_lat.latitudeE7+min_lat.latitudeE7)/2))]
    // projection.scale(scale)
    //           .translate(trans)
    var projection = d3.geoMercator()
        .scale(scale / 1 * 15*Math.PI)
        .center([(max_long+min_long)/2, (max_lat+min_lat)/2])
        .precision(0);
      console.log(long_avg,lat_avg)
      console.log((max_long+min_long)/2, (max_lat+min_lat)/2)


  var path = d3.geoPath()
      .projection(projection)
      .pointRadius(3.5)
      .context(contextTracks);

  var tiles = d3.tile()
      .size([width, height])
      .scale(projection.scale() * 2 * Math.PI)
      //.scale(projection.scale() * 2 * Math.PI)
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


  var maxElapsed = route2.length

  var tracks = dataContainer.selectAll("custom.geoPath")
        .data(route2)
        .enter()
        .append("custom")
        .classed("geoPath", true);

  var position = dataContainer.selectAll("custom.circle")
        .data(route2)
        .enter()
        .append("custom")
        .classed("circle", true)
        .attr("radius", 2);

  var interval = 1000 / config.fps,
       going = true,
       pct,
       time;

  function drawCanvas(t) {
        contextTracks.strokeStyle = "rgba(74,20,134,0.5)";
        contextTracks.lineWidth = 3;
        tracks.each(function () {
            var node = d3.select(tracks._groups[0][t]),
                trackData = node.data()[0];

            if (t > 1 && t < route2.length) {
                contextTracks.beginPath();
                if (t<3) {
                  previous = [trackData.longitudeE7,trackData.latitudeE7]
                }
                current = [trackData.longitudeE7,trackData.latitudeE7]
                x_c = projection([current[0],current[1]])[0]
                y_c = projection([current[0],current[1]])[1]
                x_p = projection([previous[0],previous[1]])[0]
                y_p = projection([previous[0],previous[1]])[1]

                contextTracks.moveTo(x_p,y_p)
                contextTracks.lineTo(x_c,y_c)
                  //path({type: "LineString", coordinates: [previous, current]});
                contextTracks.stroke()
                previous = [trackData.longitudeE7,trackData.latitudeE7]

            }
          })
          contextTracks.closePath();


        contextPoints.clearRect(0, 0, width, height);
        contextPoints.lineWidth = 2;
        contextPoints.strokeStyle = "black";
        contextPoints.beginPath();


        position.each(function () {
            var node = d3.select(position._groups[0][t]);
            contextPoints.moveTo(parseFloat(node.attr("x")) + parseFloat(node.attr("radius")), node.attr("y"));
            contextPoints.arc(node.attr("x")+ node.attr("radius"), node.attr("y"), node.attr("radius"), 0, 2 * Math.PI);
        });

            contextPoints.stroke();

    }

    var coord_slicer = function (d, t) {
        return projection([d.longitudeE7,d.latitudeE7]);
    };

    function step(t) {

        position
            .attr("x", function (d) { return coord_slicer(d, t)[0]; })
            .attr("y", function (d) { return coord_slicer(d, t)[1]; });
        time = route2[t].time_of_day
        pct = (t / maxElapsed * 100).toFixed(0);
        if (pct.length === 1) { pct = "0" + pct; }

        timer.text("Time UTC: " + time + "/" + pct + "%");

        drawCanvas(t);
    }


    function restart() {
        contextTracks.clearRect(0, 0, width, height);
        contextPoints.clearRect(0,0,width,height);
        going=true
        t = 0;
        step(t);
    }
    let int = d3.interval(function () {
        if (change) {if(count_false!=1) {int.stop(); change=false; error = false}}
        if (t >= (maxElapsed)) {t=0; restart(); }
        if (going) {
            step(t);
            t++;
        }
    }, interval);

    function pauseResume() {
        if (going) {
            playButton.text("Resume");
            going = false;
        } else {
            playButton.text("Pause");
            going = true;
        }
    }

    playButton.on("click", pauseResume);
    restartButton.on("click", restart);

};

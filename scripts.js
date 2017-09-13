
var locations = [];

var width = window.innerWidth,
    height = window.innerHeight,
    prefix = prefixMatch(["webkit", "ms", "Moz", "O"]);

var tile = d3.geo.tile()
    .size([width, height]);

var projection = d3.geo.mercator()
    .scale((1 << 22) / 2 / Math.PI) // change scale here, 21 is about z13
    .translate([-width / 2, -height / 2]); // just temporary

var tileProjection = d3.geo.mercator();

var tilePath = d3.geo.path()
    .projection(tileProjection);

var zoom = d3.behavior.zoom()
    .scale(projection.scale() * 2 * Math.PI)
    .scaleExtent([1 << 12, 1 << 25]) // 12 to 25 is roughly z4-z5 to z17
    //sf - 37.7524/-122.4407
    .translate(projection([114.18, 22.29]).map(function(x) { return -x; }))
    .on("zoom", zoomed);

var map = d3.select("body").append("div")
    .attr("class", "map")
    .style("width", width + "px")
    .style("height", height + "px")
    .call(zoom);

var layer = map.append("div")
    .attr("class", "layer");

var zoom_controls = map.append("div")
    .attr("class", "zoom-container");

var zoom_in = zoom_controls.append("a")
    .attr("class", "zoom")
    .attr("id", "zoom_in")
    .text("+");

var zoom_out = zoom_controls.append("a")
    .attr("class", "zoom")
    .attr("id", "zoom_out")
    .text("-");

var info = map.append("div")
    .attr("class", "info")
    .html('<a href="http://bl.ocks.org/mbostock/5593150" target="_top">Mike Bostock</a> | © <a href="https://www.openstreetmap.org/copyright" target="_top">OpenStreetMap contributors</a> | <a href="https://mapzen.com/projects/vector-tiles" title="Tiles courtesy of Mapzen" target="_top">Mapzen</a>');

zoomed();

// Resize when window resizes
window.onresize = function () {
  width = window.innerWidth;
  height = window.innerHeight;
  map.style("width", width + "px")
    .style("height", height + "px");
  tile = d3.geo.tile()
    .size([width, height]);
  zoomed();
}

function zoomed() {
  var tiles = tile
      .scale(zoom.scale())
      .translate(zoom.translate())
      ();

  projection
      .scale(zoom.scale() / 2 / Math.PI)
      .translate(zoom.translate());

  var image = layer
      .style(prefix + "transform", matrix3d(tiles.scale, tiles.translate))
    .selectAll(".tile")
      .data(tiles, function(d) { return d; });

  image.exit()
      .each(function(d) { this._xhr.abort(); })
      .remove();

  image.enter().append("svg")
      .attr("class", "tile")
      .style("left", function(d) { return d[0] * 256 + "px"; })
      .style("top", function(d) { return d[1] * 256 + "px"; })
      .each(window.renderTiles);

  d3.select('.overlay').selectAll('circle')
    // .data(raw['data'].map(d=>d.Geolocation))
    // .enter()
    // .append('circle')
    .attr('cx',d=>projection([+d.Longitude,+d.Latitude])[0])
    .attr('cy',d=>projection([+d.Longitude,+d.Latitude])[1])
    .attr('r',2)
    .attr('opacity',0.7)
    .attr('fill','steelblue')
    // .transition()
    // .duration(5000)
    // .attr('r',100)
    // .attr('opacity',0)







var voronoi = d3.voronoi()
    .extent([[-1, -1], [width + 1, height + 1]]);

locations.forEach(d=>{
  d.x = projection([+d.Longitude,+d.Latitude])[0]
  d.y = projection([+d.Longitude,+d.Latitude])[1]
})
var sites = locations.map(d=>[+d.x,+d.y]);

d3.select('.overlay').selectAll('.polygons').remove();
var polygon = d3.select('.overlay').append("g")
    .attr("class", "polygons")
  .selectAll("path")
  .data(voronoi.polygons(sites))
  .enter().append("path")
    .attr('fill','none')
    .attr('stroke','black')
    .call(redrawPolygon);

// var link = d3.select('.overlay').append("g")
//     .attr("class", "links")
//   .selectAll("line")
//   .data(voronoi.links(sites))
//   .enter().append("line")
//     .call(redrawLink);

// var site = d3.select('.overlay').append("g")
//     .attr("class", "sites")
//   .selectAll("circle")
//   .data(sites)
//   .enter().append("circle")
//     .attr("r", 2.5)
//     .call(redrawSite);

function moved() {
  sites[0] = d3.mouse(this);
  redraw();
}

function redraw() {
  var diagram = voronoi(sites);
  polygon = polygon.data(diagram.polygons()).call(redrawPolygon);
  link = link.data(diagram.links()), link.exit().remove();
  link = link.enter().append("line").merge(link).call(redrawLink);
  site = site.data(sites).call(redrawSite);
}

function redrawPolygon(polygon) {
  polygon
      .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; });
}

function redrawLink(link) {
  link
      .attr("x1", function(d) { return d.source[0]; })
      .attr("y1", function(d) { return d.source[1]; })
      .attr("x2", function(d) { return d.target[0]; })
      .attr("y2", function(d) { return d.target[1]; });
}

function redrawSite(site) {
  site
      .attr("cx", function(d) { return d[0]; })
      .attr("cy", function(d) { return d[1]; });
}







}

function matrix3d(scale, translate) {
  var k = scale / 256, r = scale % 1 ? Number : Math.round;
  return "matrix3d(" + [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, r(translate[0] * scale), r(translate[1] * scale), 0, 1 ] + ")";
}

function prefixMatch(p) {
  var i = -1, n = p.length, s = document.body.style;
  while (++i < n) if (p[i] + "Transform" in s) return "-" + p[i].toLowerCase() + "-";
  return "";
}

function formatLocation(p, k) {
  var format = d3.format("." + Math.floor(Math.log(k) / 2 - 2) + "f");
  return (p[1] < 0 ? format(-p[1]) + "°S" : format(p[1]) + "°N") + " "
       + (p[0] < 0 ? format(-p[0]) + "°W" : format(p[0]) + "°E");
}

// zoom controls

function interpolateZoom (translate, scale) {
    var self = this;
    return d3.transition().duration(350).tween("zoom", function () {
        var iTranslate = d3.interpolate(zoom.translate(), translate),
            iScale = d3.interpolate(zoom.scale(), scale);
        return function (t) {
            zoom
                .scale(iScale(t))
                .translate(iTranslate(t));
            zoomed();
        };
    });
}

function zoomClick() {
    var clicked = d3.event.target,
        direction = 1,
        factor = 0.2,
        target_zoom = 1,
        center = [width / 2, height / 2],
        extent = zoom.scaleExtent(),
        translate = zoom.translate(),
        translate0 = [],
        l = [],
        view = {x: translate[0], y: translate[1], k: zoom.scale()};

    d3.event.preventDefault();
    direction = (this.id === 'zoom_in') ? 1 : -1;
    target_zoom = zoom.scale() * (1 + factor * direction);

    if (target_zoom < extent[0] || target_zoom > extent[1]) { return false; }

    translate0 = [(center[0] - view.x) / view.k, (center[1] - view.y) / view.k];
    view.k = target_zoom;
    l = [translate0[0] * view.k + view.x, translate0[1] * view.k + view.y];

    view.x += center[0] - l[0];
    view.y += center[1] - l[1];

    interpolateZoom([view.x, view.y], view.k);
}

d3.selectAll('a.zoom').on('click', zoomClick);

//disable mousewheel zoom if iframed
if (window.self !== window.top) {
  map.on("wheel.zoom", null);

  document.documentElement.className += ' mapzen-demo-iframed';
}

// Hide zoom control on touch devices, which interferes with project page navigation overlay
if (('ontouchstart' in window) || (window.DocumentTouch && document instanceof DocumentTouch)) {
  document.getElementsByClassName('zoom-container')[0].style.display = 'none';
}




d3.json('data.json',(error,raw)=>{
  console.log(raw['data'].map(d=>d.Geolocation));
  var svg = d3.select('body').append('svg')
  svg.attr('height',height)
  svg.attr('width',width)
  svg.attr('class','overlay');

  locations = raw['data'].map(d=>d.Geolocation);


  svg.selectAll('circle')
    .data(raw['data'].map(d=>d.Geolocation))
    .enter()
    .append('circle')
    // .attr('cx',d=>projection([+d.Longitude,+d.Latitude])[1])
    // .attr('cy',d=>projection([+d.Longitude,+d.Latitude])[0])
    // .attr('r',3)
    .attr('fill','steelblue')

    zoomed();


})






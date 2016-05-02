$(function(){
  //Generate the box
  generateBox();
  //Grab the place holder website
  $.ajax({
    method: "POST",
    url: "/getNetwork",
    data: { username : "nivo1000"},
    dataType: 'json'
  })
  .done(function(data) {
    console.log(data);
    updateGraph(data);
  });

  //Wait for a user submission
  $('.signin').click(function(e) {
    console.log(e);
    $.ajax({
      method: "GET",
      url: "/authorize"
    });
  });

  $( ".submit" ).click(function(e) {
    e.preventDefault();
    $('.info').show();
    $('.failure').hide();
    $.ajax({
      method: "POST",
      url: "/getNetwork",
      data: { username : $("#username").val()},
      dataType: 'json'
    }).done(function(data) {
      console.log(data);
      // updateGraph(data);
    }).fail(function(error) {
      $('.failure').show();
    });
  });
});

var generateBox = function(){
  var width = 960;
  var height = 600;

  var header = d3.select(".row").append("div")
    .attr("class","col-md-8 col-md-offset-2 centered")
    .append("h2")
    .append("a")
    .attr("id", "username-header");

  var svg = d3.select(".row").append("svg")
    .attr("width", width)
    .attr("height", height);
};

var updateGraph = function(mapData){

  console.log(mapData);

  var username = mapData.username;
  var user = {}
  user[username] = ['self'];
  var data = mapData.relations;

  var width = 800;
  var height = 400;
  var header = d3.select("#username-header")
    .text(username)
    .attr('href',username);

  var svg = d3.select("svg");

  var force = d3.layout.force()
      .gravity(0.2)
      .distance(50)
      .size([width, height]);

      debugger;
  var edges = [];
  var nodes = [];
  nodes.push({name: username, group: 0});

  
  for(e in data) {
    targ = {}
    targ[e] = data[e];

    var group = 1;
    if(data[e] === 'follow') {
      group === 1;
    } else if (data[e] === 'follower') {
      gorup === 2;
    } else {
      group === 3;
    }
    nodes.push({name: e ,group: group});
    edges.push({source: 0, target: nodes.length - 1, weight: 1});
  };


  console.log(edges);
  console.log(nodes);

  //   data.forEach(function(e) {
  //   var sourceNode = data.nodes.filter(function(n) { return n.url === e.referer; })[0],
  //   targetNode = data.nodes.filter(function(n) { return n.url === e.url; })[0];
  //   edges.push({source: username, target: targetNode, value: 0});
  // });

  data[username] = ['self'];

  force
      .nodes(nodes)
      .links(edges)
      .charge(-500)
      .start();

  var link = svg.selectAll(".link")
      .data(edges, function(d){
        return d.source + "_" + d.target;
      });

    link.enter().append("line")
      .attr("class", "link");

  var node = svg.selectAll(".node")
      .data(nodes, function(d){
        return d.name;
      });

    node.enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  var colorScale = d3.scale.category10();

  node.append("circle")
      .attr("class", "node")
      .attr('fill', function(d){ return colorScale(d.group); })
      .attr("r", function(d){return 10});
      
  node.append("svg:text")
      .attr("class", "nodetext")
      .attr("dx", 12)
      .attr("dy", "-5")
      .text(function(d) { return d.name; });
      
  node.on("dblclick", function(d){
        window.location = d.name;
      });

  //Remove old nodes
  node.exit()
      .transition()
      .duration(500)
      .style("fill-opacity", 1e-6)
      .remove();

  link.exit()
      .transition()
      .duration(500)
      .style("fill-opacity", 1e-6)
      .remove();

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });
  $('.info').hide();
};
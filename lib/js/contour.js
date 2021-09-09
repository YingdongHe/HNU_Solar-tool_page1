
function contourfunc(epw){
  // set the dimensions and margins of the graph
  var margin = {top: 20, right: 30, bottom: 30, left: 40},
      width = 750 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  
  // append the svg object to the body of the page
  var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("viewBox", [-100, 0, width + 150, height+150])
      .style("display", "block")
      .style("margin", "0 -14px")
      .style("width", "calc(50% + 28px)");
  
  // read data
  d3.csv("https://raw.githubusercontent.com/JINGYUAN1011/Thermal-tool/main/contourdata.csv", function(data) {
    value = data.map(function(d){return d.Value}).map(Number);
    thresholds = d3.range(0, 15).map(i => Math.pow(2,((i-5)/1.8)));
    // var color = d3.scaleSequential(d3.extent(thresholds), d3.interpolateMagma);
    var color = d3.scaleSequential()
    .interpolator(d3.interpolateRdYlGn)
    .domain(d3.extent(thresholds))

    console.log(thresholds);
    
    var n = 9;
    var m = 6;
    grid = new Array(n * m);
    var q = Math.ceil(width+100)/ (n-1.5)
    for (let j = 0; j < m*n; ++j) {
        grid[j] = value[j];
      }
    grid.x = -q;
    grid.y = -q;
    grid.k = q;
    grid.n = n;
    grid.m = m;
    
  transform = ({type, value, coordinates}) => {
  return {type, value, coordinates: coordinates.map(rings => {
    return rings.map(points => {
      return points.map(([x, y]) => ([
        grid.x + grid.k * x+50,
        grid.y + grid.k * y+50
      ]));
    });
  })};
};

    contours = d3.contours()
      .size([grid.n, grid.m])
      .thresholds(thresholds)
    (grid)
    .map(transform);

    // Add X axis
    var x = d3.scaleLinear()
      .domain([-2, 2])
      .range([0, width]);
    svg.append("g")
      .attr("transform", `translate(10,${height+10})`)
      .call(d3.axisBottom(x).ticks(9));
  
    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0.5, 3])
      .range([height, 0]);
    svg.append("g")
      .attr("transform", "translate(10,10)")
      .call(d3.axisLeft(y).ticks(7));
  
    // compute the density data
  

    // Add the contour: several "path"
    svg
      .selectAll("path")
      .data(contours)
      .enter().append("path")
        .attr("fill", function(d) { return color(d.value); })
        .attr("d", d3.geoPath())

        
  })}

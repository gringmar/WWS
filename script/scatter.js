
var category = [
  "determination_perseverance", "feeling_of_responsibility", "good_manners", "hard_work"
];
var currentYear = "2000-2004";


function changeYear(){
  currentYear = document.getElementById('year').value;
  render(category,currentYear);
}

filterByCategory()
function filterByCategory() {

 

  var checkboxgroup = document.getElementById('checkboxgroup').getElementsByTagName("input");
  var limit = 4;

  for (var i = 0; i < checkboxgroup.length; i++) {
    checkboxgroup[i].onclick = function () {
      var checkedcount = 0;
      category = [];
      for (var i = 0; i < checkboxgroup.length; i++) {

        checkedcount += (checkboxgroup[i].checked) ? 1 : 0;
        if (checkboxgroup[i].checked) {
          category.push(checkboxgroup[i].value)
          if (category.length == 4) {
            render(category, currentYear);
          }
        }
      }
      if (checkedcount > limit) {
        console.log("You can select maximum of " + limit + " checkbox.");
        alert("You can select maximum of " + limit + " checkbox.");
        this.checked = false;

      }

    }
  }



}


d3.helper = {};

d3.helper.tooltip = function () {
  var tooltipDiv;
  var bodyNode = d3.select('body').node();

  function tooltip(selection) {
    selection.on('mouseover.tooltip', function (point) {
      // Clean up lost tooltips
      d3.select('body').selectAll('div.tooltip').remove();
      // Append tooltip
      tooltipDiv = d3.select('body')
        .append('div')
        .attr('class', 'tooltip');
      var absoluteMousePos = d3.mouse(bodyNode);
      tooltipDiv
        .style('left', (absoluteMousePos[0] + 10) + 'px')
        .style('top', (absoluteMousePos[1] - 30) + 'px');

      var line = '';
      _.each(d3.keys(point), function (key, index) {
        if (index != d3.keys(point).length - 1) {
          line += key + ': ' + point[key] + '</br>';
        } else {
          line += key + ': ' + point[key];
        }
      });
      tooltipDiv.html(line);
    })
      .on('mousemove.tooltip', function () {
        // Move tooltip
        var absoluteMousePos = d3.mouse(bodyNode);
        tooltipDiv
          .style("left", (absoluteMousePos[0] + 10) + 'px')
          .style("top", absoluteMousePos[1] < 80 ? absoluteMousePos[1] + 10 : (absoluteMousePos[1] - 70) + 'px');
      })
      .on('mouseout.tooltip', function () {
        // Remove tooltip
        tooltipDiv.remove();
      });

  }

  tooltip.attr = function (_x) {
    if (!arguments.length) return attrs;
    attrs = _x;
    return this;
  };

  tooltip.style = function (_x) {
    if (!arguments.length) return styles;
    styles = _x;
    return this;
  };

  return tooltip;
};


var width = 960,
  size = 230,
  padding = 20;

var x = d3.scaleLinear()
  .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
  .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
  .scale(x)
  .ticks(6);

var yAxis = d3.axisLeft()
  .scale(y)
  .ticks(6);

var color = d3.scaleOrdinal(d3.schemeCategory10);


render(category, currentYear);

function render(category, currentYear) {
  var datatoload ="data/data2000.csv";
    switch(currentYear) {
      case "2000-2004":
       datatoload="data/data2000.csv";
        break;
      case "2005-2009":
        datatoload="data/data2005.csv";
        break;
        case "2010-2014":
        datatoload="data/data2010.csv";
        break;
        case "1995-1999":
        datatoload="data/data1995.csv";
        break;
      default:
        // code block
    }
  
   d3.csv(datatoload, function (error, data) {
    d3.select("svg").remove();
    if (error) throw error;

    var domainByTrait = {},
      traits = d3.keys(data[0]).filter(function (d) {
        return d == category[0] || d == category[1] || d == category[2] || d == category[3];
      }),
      n = 4;
    traits.forEach(function (trait) {
      domainByTrait[trait] = d3.extent(data, function (d) { return d[trait]; });
    });
    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var brush = d3.brush()
      .on("start", brushstart)
      .on("brush", brushmove)
      .on("end", brushend)
      .extent([[0, 0], [size, size]]);


    var svg = d3.select("body").append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
      .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    svg = d3.select("svg > g");
    svg.selectAll("*").remove();

    svg.selectAll(".y.axis").remove();//add this to remove the links
    svg.selectAll(".x.axis").remove();//add this to remove the nodes
    svg.selectAll(".cell").remove();//add this to remove the nodes

    svg.selectAll(".x.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "x axis")
      .attr("transform", function (d, i) { return "translate(" + (n - i - 1) * size+ ",0)"; })
      .each(function (d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

    svg.selectAll(".y.axis")
      .data(traits)
      .enter().append("g")
      .attr("class", "y axis")
      .attr("transform", function (d, i) { return "translate(0," + i * size + ")"; })
      .each(function (d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

    svg.exit().remove();

    var cell = svg.selectAll(".cell")
      .data(cross(traits, traits))
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function (d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      ;

    // Titles for the diagonal.
    cell.filter(function (d) { return d.i === d.j; }).append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function (d) { return d.x; });

    cell.call(brush);
    cell.each(plot);
    cell.exit().remove();


    function plot(p) {
      var cell = d3.select(this);

      x.domain(domainByTrait[p.x]);
      y.domain(domainByTrait[p.y]);

      cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .style("pointer-events", "none")
        .attr("height", size - padding);

      var circles = cell.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", function (d) { return x(d[p.x]); })
        .attr("cy", function (d) { return y(d[p.y]); })
        .attr("r", 4)
        .call(d3.helper.tooltip())
        .style("fill", function (d) { return color(d.country); });

      circles.exit().remove();

      circles.on('mousedown', function () {
      });
    }

    var brushCell;

    // Clear the previously-active brush, if any.
    function brushstart(p) {
      if (brushCell !== this) {
        d3.select(brushCell).call(brush.move, null);
        brushCell = this;
        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);
      }
    }

    // Highlight the selected circles.
    function brushmove(p) {
      var e = d3.brushSelection(this);
      svg.selectAll("circle").classed("hidden", function (d) {
        return !e
          ? false
          : (
            e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
            || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
          );
      });
    }

    // If the brush is empty, select all circles.
    function brushend() {
      var e = d3.brushSelection(this);
      if (e === null) svg.selectAll(".hidden").classed("hidden", false);
    }
  });
}

function cross(a, b) {
  var c = [], n = a.length, m = b.length, i, j;
  for (i = -1; ++i < n;) for (j = -1; ++j < m;) c.push({ x: a[i], i: i, y: b[j], j: j });
  return c;
}

// The following Scatterplot chart is inspired by http://bl.ocks.org/weiglemc/6185069
/**
 * @todo Avoid overlaping of Time axis
 */

var url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"

var margin = { top: 50, right: 20, bottom: 30, left: 40 },
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

/* 
 * value accessor - returns the value to encode for a given data object.
 * scale - maps value to a visual display encoding, such as a pixel position.
 * map function - maps from data value to display value
 * axis - sets up axis
 */

// setup x 
// format() https://github.com/d3/d3-format/blob/master/README.md#format
var xValue = function (d) { return d.Year; }, // data -> value
	xScale = d3.scaleLinear().range([0, width]), // value -> display
	xMap = function (d) { return xScale(xValue(d)); }, // data -> display
	xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));

// setup y
// timeFormat() https://github.com/d3/d3-time-format/blob/master/README.md#d3-time-format
var yValue = function (d) { return d.Time; }, // data -> value
	yScale = d3.scaleTime().range([height, 0]), // value -> display
	yMap = function (d) { return yScale(yValue(d)); }, // data -> display
	timeFormat = d3.timeFormat("%M:%S");
yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);

// setup fill color
// var cValue = function(d) { return d.Manufacturer;},
//     color = d3.scale.category10();

// Setup color
var color = d3.scaleOrdinal(d3.schemeCategory10),
	cValue = function (d) {
		if (d.Doping) {
			return "Riders with doping allegations";
		} else {
			return "No doping allegations";
		}
	};

// add the graph canvas to the body of the webpage
var svg = d3.select("#scatterplot").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("#scatterplot").append("div")
	.attr("class", "tooltip")
	.attr("id", "tooltip")
	.style("opacity", 0);

// load data
d3.json(url).then(function (data) {
	// change string (from CSV) into number format
	data.forEach(function (d) {
		var parsedTime = d.Time.split(':');
		d.Time = new Date(Date.UTC(1970, 0, 1, 0, parsedTime[0], parsedTime[1]));
		// console.log(d);
	});

	// don't want dots overlapping axis, so add in buffer to data domain
	xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue)]);
	yScale.domain([d3.min(data, yValue), d3.max(data, yValue)]);

	// x-axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("id", "x-axis")
		.attr("transform", `translate(0, ${height})`)
		.call(xAxis)
		.append("text")
		.attr("class", "label")
		.attr("x", width)
		.attr("y", -6)
		.style("text-anchor", "end")
		.text("Year");

	// y-axis
	svg.append("g")
		.attr("class", "y axis")
		.attr("id", "y-axis")
		.call(yAxis)
		.append("text")
		.attr("class", "label")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("Time");

	// draw dots
	svg.selectAll(".dot")
		.data(data)
		.enter().append("circle")
		.attr("class", "dot")
		.attr("r", 4)
		.attr("cx", xMap)
		.attr("cy", yMap)
		.attr("data-xvalue", xValue)
		.attr("data-yvalue", yValue)
		.style("fill", function (d) { return color(cValue(d)); })
		.on("mouseover", function (d) {
			console.log(d);
			console.log(d3.event.pageX, d3.event.pageY);
			tooltip.transition()
				.duration(200)
				.style("opacity", .9);
			tooltip.html(d.Name + "<br/> Year: " + d.Year + ", Time: " + timeFormat(d.Time))
				.style("left", (d3.event.pageX + 5) + "px")
				.style("top", (d3.event.pageY - 28) + "px")
				.attr("data-year", d.Year);
		})
		.on("mouseout", function (d) {
			tooltip.transition()
				.duration(500)
				.style("opacity", 0);
		});

	// draw legend
	var legend = svg.selectAll(".legend")
		.data(color.domain())
		.enter().append("g")
		.attr("class", "legend")
		.attr("id", "legend")
		.attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

	// draw legend colored rectangles
	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

	// draw legend text
	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function (d) { return d; })

	// Title
	svg.append("text")
		.text("Doping in Professional Bicycle Racing")
		.style("text-anchor", "middle")
		.attr("x", width / 2)
		.attr("y", -10)
		.attr("id", "title")
});
(async function() {
	const url =
		"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
	const { baseTemperature, monthlyVariance } = await d3
		.json(url)
		.catch(e => console.log(e));
	console.log(baseTemperature);
	console.log(monthlyVariance);

	const margin = { top: 50, right: 50, bottom: 100, left: 60 },
		innerWidth = window.innerWidth,
		width = innerWidth - margin.left - margin.right,
		height = 430 - margin.top - margin.bottom,
		gridSize = Math.floor(width / 24);

	function getMonth(month) {
		let date = new Date(0);
		date.setUTCMonth(month - 1);
		return d3.utcFormat("%B")(date);
	}

	//heading
	var heading = d3
		.select("#chart")
		.append("div")
		.attr("class", "header");

	d3.select(".header").attr(
		"style",
		`width:${width}px;margin-left:${margin.left}px`
	);

	heading
		.append("h1")
		.attr("id", "title")
		.text("Monthly Global Land-Surface Temperature");
	heading
		.append("h3")
		.attr("id", "description")
		.html(
			monthlyVariance[0].year +
				" - " +
				monthlyVariance[monthlyVariance.length - 1].year +
				": base temperature " +
				baseTemperature +
				" &#8451;"
		);
	// Create SVG
	let svg = d3
		.select("#chart")
		.append("svg")
		.attr("width", width)
		.attr("height", height + margin.top + margin.bottom)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// X
	let xValue = x => x.year;
	let xScale = d3
		.scaleBand()
		.domain(monthlyVariance.map(x => xValue(x)))
		.rangeRound([0, width])
		.align(0.1);
	let xAxis = d3
		.axisBottom(xScale)
		.tickValues(
			xScale.domain().filter(function(year) {
				return year % 10 === 0;
			})
		)
		.tickFormat(function(year) {
			let date = new Date(0);
			date.setUTCFullYear(year);
			return d3.utcFormat("%Y")(date);
		});
	svg
		.append("g")
		.call(xAxis)
		.attr("id", "x-axis")
		.attr("transform", `translate(${margin.left} ,${height + margin.top})`);

	let yValue = y => y.month;
	let yScale = d3
		.scaleBand()
		.domain(monthlyVariance.map(x => yValue(x)))
		.rangeRound([0, height]);
	let yAxis = d3.axisLeft(yScale).tickFormat(month => getMonth(month));
	svg
		.append("g")
		.call(yAxis)
		.attr("id", "y-axis")
		.attr("transform", `translate(${margin.left} ,${margin.top})`);

	// Scale color
	let colorScale = d3
		.scaleLinear()
		.range([1, 0])
		.domain([
			d3.min(monthlyVariance.map(x => baseTemperature + x.variance)),
			d3.max(monthlyVariance.map(x => baseTemperature + x.variance))
		]);

	// Rects
	svg
		.append("g")
		.classed("map", true)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.selectAll("rect")
		.data(monthlyVariance)
		.enter()
		.append("rect")
		.attr("class", "cell")
		.attr("data-month", function(d) {
			return d.month - 1;
		})
		.attr("data-year", function(d) {
			return d.year;
		})
		.attr("data-temp", function(d) {
			return baseTemperature + d.variance;
		})
		.attr("x", function(d) {
			return xScale(d.year);
		})
		.attr("y", function(d) {
			return yScale(d.month);
		})
		.attr("width", function(d) {
			return xScale.bandwidth(d.year);
		})
		.attr("height", function(d) {
			return yScale.bandwidth(d.month);
		})
		.attr("fill", function(d) {
			return d3.interpolateRdYlBu(colorScale(baseTemperature + d.variance));
		})
		.on("mouseover", function(d) {
			console.log(d);
			console.log(d3.event.pageX, d3.event.pageY);
			tooltip
				.transition()
				.duration(200)
				.style("opacity", 0.9);
			tooltip
				.html(
					`Temperature: ${Math.round((baseTemperature + d.variance) * 100) /
						100}<br/> Year: ${d.year}, Month: ${getMonth(d.month)}`
				)
				.style("left", d3.event.pageX + 5 + "px")
				.style("top", d3.event.pageY - 28 + "px")
				.attr("data-year", d.Year);
		});

	// Add the tooltip area to the webpage
	var tooltip = d3
		.select("body")
		.append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip")
		.style("opacity", 0);
})();

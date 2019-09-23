$("document").ready(function () {

	const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json"

	$.get({
		url: url,
		dataType: "json",
	}).done(data => {
		createChart(data.data);
	})

	function createChart(data) {

		const w = $(window).width() - 600;
		const h = 600;
		const padding = 40;
		const barW = (w - 2 * padding) / data.length;
		console.log(barW);
		const timeData = data.map(item => [item[0].split("-"), item[1]]);

		const minYear = d3.min(timeData, (d) => d[0][0]);
		const maxYear = d3.max(timeData, (d) => d[0][0]);

		const minGDP = d3.min(timeData, d => d[1]);
		const maxGDP = d3.max(timeData, d => d[1]);
		console.log(minGDP + " " + maxGDP);
		// Create Scales

		const xScale = d3.scaleTime()
			.domain([new Date(minYear, 0, 1), new Date(maxYear, 11, 31)])
			.range([0, w - (padding * 2)])

		const xAxis = d3.axisBottom(xScale);

		const yScale = d3.scaleLinear()
			.domain([0, maxGDP])
			.range([h - (padding * 2), 0]);

		const yAxis = d3.axisLeft(yScale);

		// Create SVG

		const svg = d3.select("#chart")
			.append("svg")
			.attr("width", w)
			.attr("height", h);

		var tooltip = d3.select("#chart").append("div")
			.attr("id", "tooltip")
			.style("opacity", 0);

		d3.select("svg")
			.selectAll("rect")
			.data(timeData)
			.enter()
			.append("rect")
			.attr("height", d => (h - (padding * 2)) - yScale(d[1]))
			.attr("width", barW)
			.attr("y", d => yScale(d[1]) + padding)
			.attr("x", (d, i) => padding + (barW * (i + 1)))
			.attr("class", "bar")
			.attr("data-gdp", d => d[1])
			.attr("data-date", d => d[0].join("-"))
			.attr("fill", "pink")
			.on("mouseover", function (d) {
				console.log(d);
				tooltip.transition()
					.duration(200)
					.style("opacity", .9)
					.style("display", "block");
				tooltip.html("Date " + d[0].join("-") + "<br/>GDP " + d[1])
					.attr("data-date", d[0].join("-"))
					.style("left", (d3.event.pageX + 20) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function (d) {
				tooltip.transition()
					.duration(500)
					.style("opacity", 0);
			});

		// Append Axis

		svg.append("g")
			.call(xAxis)
			.attr("transform", `translate(${padding}, ${h - padding})`)
			.attr("id", "x-axis")

		svg.append("g")
			.call(yAxis)
			.attr("transform", `translate(${padding}, ${padding})`)
			.attr("id", "y-axis")

		svg.append("text")
			.text("United States GDP")
			.style("text-anchor", "middle")
			.attr("x", w / 2)
			.attr("y", padding)
			.attr("id", "title")
	}

}); // Jquery End


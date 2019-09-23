(async function() {
	// localStorage.setItem("example_project", "D3: Choropleth");

	const margin = { top: 50, right: 50, bottom: 100, left: 60 };
	const innerWidth = window.innerWidth;
	const width = innerWidth - margin.left - margin.right;
	const height = Math.round(innerWidth / 1.9);
	const legendWidth = 600;
	const legendHeight = 10;
	const legendCellWidth = legendWidth / 9;

	let svg = d3
		.select("#chart")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Define the div for the tooltip
	const tooltip = d3
		.select("#main")
		.append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip")
		.style("opacity", 0);

	// const unemployment = d3.map();

	const path = d3.geoPath();

	const x = d3
		.scaleLinear()
		.domain([2.6, 75.1])
		.rangeRound([600, 860]);

	const COUNTY_FILE =
		"https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json";
	const EDUCATION_FILE =
		"https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json";

	const us = await d3.json(COUNTY_FILE).catch(e => console.log(e));
	const education = await d3.json(EDUCATION_FILE).catch(e => console.log(e));
	const bachelorsOrHigher = education.map(obj => obj.bachelorsOrHigher);
	const minBachelorOrHigher = d3.min(bachelorsOrHigher);
	const maxBachelorOrHigher = d3.max(bachelorsOrHigher);

	const thresholdDomain = d3.range(
		minBachelorOrHigher,
		maxBachelorOrHigher,
		(maxBachelorOrHigher - minBachelorOrHigher) / 9
	);
	const color = d3
		.scaleThreshold()
		.domain(thresholdDomain)
		.range(d3.schemeBlues[9]);
	/**
	 * arcs: []
	 * bbox: (4) [-56.77775821661018, 12.469025989284091, 942.7924311762474, 596.9298966319916]
	 * objects: {counties: {…}, states: {…}, nation: {…}}
	 * transform: {scale: Array(2), translate: Array(2)}
	 * type: "Topology"
	 */
	console.log(us);
	/**
	 * area_name: "Autauga County"
	 * bachelorsOrHigher: 21.9
	 * fips: 1001
	 * state: "AL"
	 */
	console.group("Bachelor");
	console.log("Min: " + d3.min(bachelorsOrHigher));
	console.log("Max: " + d3.max(bachelorsOrHigher));
	console.log(bachelorsOrHigher);
	console.groupEnd();

	// Scale for x axis of the legend
	const legendXScale = d3
		.scaleLinear()
		.domain([minBachelorOrHigher, maxBachelorOrHigher])
		.range([0, legendWidth]);

	// Legend x axis function
	const legendXAxis = d3
		.axisBottom(legendXScale)
		.tickValues(thresholdDomain)
		.tickFormat(d3.format(".1f"));

	// Append g to svg to create legend
	const legend = svg
		.append("g")
		.attr("class", "legend")
		.attr("id", "legend")
		.attr("transform", "translate(" + margin.left + "," + 0 + ")");

	/**
	 *	Apend rects to g#legend for each step
	 *  Calculate color with the color threshold
	 */

	legend
		.append("g")
		.selectAll("rect")
		.data(thresholdDomain)
		.enter()
		.append("rect")
		.style("fill", d => color(d))
		.attr("x", (d, i) => legendCellWidth * i)
		.attr("y", 0)
		.attr("width", legendCellWidth)
		.attr("height", legendHeight);

	legend
		.append("g")
		.attr("transform", "translate(" + 0 + "," + legendHeight + ")")
		.call(legendXAxis);

	/**
	 * Country Map
	 */
	svg
		.append("g")
		.attr("class", "counties")
		.selectAll("path")
		.data(topojson.feature(us, us.objects.counties).features)
		.enter()
		.append("path")
		.attr("class", "county")
		.attr("data-fips", d => d.id)
		.attr("data-education", d => {
			const result = education.filter(obj => obj.fips == d.id);
			if (result[0]) {
				return result[0].bachelorsOrHigher;
			}
			//could not find a matching fips id in the data
			console.log("could find data for: ", d.id);
			return 0;
		})
		.attr("fill", d => {
			const result = education.filter(obj => obj.fips == d.id);
			if (result[0]) {
				return color(result[0].bachelorsOrHigher);
			}
			return color(0);
		})
		.attr("d", path)
		.attr("transform", `translate(${0}, ${margin.top})`)
		.on("mouseover", function(d) {
			console.log(d);
			const result = education.filter(obj => obj.fips == d.id);

			tooltip
				.transition()
				.duration(200)
				.style("display", "block")
				.style("opacity", 0.9);
			tooltip
				.html(
					`Area: ${result[0].area_name}<br/> State: ${result[0].state}<br/> 
					People with bachelor or higher education: ${result[0].bachelorsOrHigher}%`
				)
				.style("left", d3.event.pageX + 5 + "px")
				.style("top", d3.event.pageY - 28 + "px")
				.attr("data-education", d => {
					if (result[0]) {
						return result[0].bachelorsOrHigher;
					}
					return 0;
				});
		})
		.on("mouseout", function(d) {
			tooltip
				.transition()
				.duration(0)
				.style("display", "none")
				.style("opacity", 0);
		});

	svg
		.append("path")
		.datum(
			topojson.mesh(us, us.objects.states, function(a, b) {
				return a !== b;
			})
		)
		.attr("class", "states")
		.attr("d", path);
})();

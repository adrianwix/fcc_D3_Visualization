(async function() {
	const width = innerWidth - 60;
	// const width = 960;
	const height = Math.round(innerWidth / 1.9);
	// const height = 570;

	const VIDEO_GAMES =
		"https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json";

	const data = await d3.json(VIDEO_GAMES).catch(e => console.log(e));

	const color = d3.scaleOrdinal(d3.schemeCategory10);

	const root = d3
		.hierarchy(data)
		.sum(d => d.value)
		.sort((a, b) => b.height - a.height || b.value - a.value)
		.eachBefore(d => {
			d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
		});

	const treemapLayout = d3
		.treemap()
		.size([width, height])
		.paddingOuter(2);

	treemapLayout(root);

	const tooltip = d3
		.select("#chart")
		.append("div")
		.attr("class", "tooltip")
		.attr("id", "tooltip")
		.style("opacity", 0);

	const nodes = d3
		.select("svg")
		.attr("width", width)
		.attr("height", height)
		.selectAll("g")
		.data(root.leaves())
		.enter()
		.append("g")
		.attr("transform", d => `translate(${d.x0}, ${d.y0})`)
		.attr("data-name", d => d.data.name)
		.attr("data-category", d => d.data.category)
		.attr("data-value", d => d.data.value)
		.on("mouseover", function(d) {
			tooltip
				.transition()
				.duration(200)
				.style("display", "block")
				.style("opacity", 0.9);
			tooltip
				.html(
					`Name: ${d.data.name}</br> Category: ${d.data.category}</br> Value: ${
						d.data.value
					}`
				)
				.style("left", d3.event.pageX + 5 + "px")
				.style("top", d3.event.pageY - 28 + "px")
				.attr("data-value", d.data.value);
		})
		.on("mouseout", function(d) {
			tooltip
				.transition()
				.duration(0)
				.style("display", "none")
				.style("opacity", 0);
		});

	nodes
		.append("rect")
		.attr("id", d => d.data.id)
		.attr("class", "tile")
		.attr("width", d => d.x1 - d.x0)
		.attr("height", d => d.y1 - d.y0)
		.attr("data-name", d => d.data.name)
		.attr("data-category", d => d.data.category)
		.attr("data-value", d => d.data.value)
		.attr("fill", d => color(d.data.category));

	nodes
		.append("text")
		.attr("class", "node-label")
		.selectAll("tspan")
		.data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
		.enter()
		.append("tspan")
		.attr("x", 4)
		.attr("y", function(d, i) {
			return 13 + i * 10;
		})
		.text(d => d);

	const categoriesRepeated = root.leaves().map(nodes => nodes.data.category);
	const categories = categoriesRepeated.filter(
		(category, index, self) => self.indexOf(category) === index
	);
	console.log(categories);
	const LEGEND_WIDTH = 500;
	const LEGEND_OFFSET = 10;
	const LEGEND_RECT_SIZE = 15;
	const LEGEND_H_SPACING = 150;
	const LEGEND_V_SPACING = 10;
	const LEGEND_TEXT_X_OFFSET = 3;
	const LEGEND_TEXT_Y_OFFSET = -2;
	var legendElemsPerRow = Math.floor(LEGEND_WIDTH / LEGEND_H_SPACING);

	const legend = d3.select("#legend");

	var legendElem = legend
		.append("svg")
		.attr("width", LEGEND_WIDTH)
		.attr("transform", "translate(60," + LEGEND_OFFSET + ")")
		.selectAll("g")
		.data(categories)
		.enter()
		.append("g")
		.attr(
			"transform",
			(d, i) =>
				`translate(${(i % legendElemsPerRow) * LEGEND_H_SPACING}, ${Math.floor(
					i / legendElemsPerRow
				) *
					LEGEND_RECT_SIZE +
					LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)})`
		);

	legendElem
		.append("rect")
		.attr("width", LEGEND_RECT_SIZE)
		.attr("height", LEGEND_RECT_SIZE)
		.attr("class", "legend-item")
		.attr("fill", d => color(d));

	legendElem
		.append("text")
		.attr("x", LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
		.attr("y", LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
		.text(d => d);
})();

// script.js

// Margins and dimensions
const margin = { top: 100, right: 30, bottom: 120, left: 100 },
      width = 1000 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

const colors = [
    "#05B89A", "#0B90B6", "#FFCE65", "#FFC039", "#FFC707",
    "#FF9339", "#FF6307", "#FF4739", "#FF1907", "#960018"
];
const legendLabels = ["0-3", "3-5.5", "5.5-6", "6-6.5", "6.5-7", "7-8.5", "8.5-9", "9-9.5", "9.5-10", "10+"];

// Tooltip
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// SVG container
const svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json')
    .then(data => {
        const baseTemp = data.baseTemperature;
        const monthlyData = data.monthlyVariance;

        // Scales
        const xScale = d3.scaleBand()
            .domain(monthlyData.map(d => d.year))
            .range([0, width])
            .padding(0.01);

        const yScale = d3.scaleBand()
            .domain(d3.range(1, 13))
            .range([0, height])
            .padding(0.01);

        const colorScale = d3.scaleQuantize()
            .domain([0, 10])
            .range(colors);

        // X Axis
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter(year => year % 10 === 0)))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        // Y Axis
        svg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale).tickFormat(month => {
                const date = new Date(0, month - 1);
                return d3.timeFormat("%B")(date);
            }));

        // Draw cells
        svg.selectAll("rect")
            .data(monthlyData)
            .enter().append("rect")
            .attr("x", d => xScale(d.year))
            .attr("y", d => yScale(d.month))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(baseTemp + d.variance))
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip.html(
                    `${d3.timeFormat("%B")(new Date(0, d.month - 1))} ${d.year}<br/>
                     Temp: ${(baseTemp + d.variance).toFixed(2)}°C<br/>
                     Variance: ${d.variance.toFixed(2)}°C`
                )
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => tooltip.transition().duration(500).style("opacity", 0));

        // Legend
        const legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(0, ${height + 40})`);

        legend.selectAll("rect")
            .data(colors)
            .enter().append("rect")
            .attr("x", (d, i) => i * 35)
            .attr("width", 35)
            .attr("height", 20)
            .attr("fill", d => d);

        legend.selectAll("text")
            .data(legendLabels)
            .enter().append("text")
            .attr("x", (d, i) => i * 35 + 2)
            .attr("y", 35)
            .text(d => d)
            .style("fill", "#FCFCFC")
            .style("font-size", "12px");
    })
    .catch(error => console.error('Error loading the data:', error));

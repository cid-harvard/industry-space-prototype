import * as d3 from 'd3';
import {getAspectRation} from './Utils';

export default (rootEl, data, rootWidth, rootHeight) => {
  const {
    width, height, outerWidth, outerHeight, margin,
  } = getAspectRation({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, 20);

  const state = {
    zoom: 1,
  };

  const svg = d3.select(rootEl).append("svg")
    .attr("width",  outerWidth)
    .attr("height", outerHeight);

  const xScale = d3.scaleLinear()                // interpolator for X axis -- inner plot region
    .domain(d3.extent(data.nodes, ({x}) => x))
    .range([0, width]);

  const yScale = d3.scaleLinear()                // interpolator for Y axis -- inner plot region
    .domain(d3.extent(data.nodes, ({y}) => y))
    .range([height, 0]);

  const g = svg.append("g");

  g.selectAll(".industry-node")                  // plot a node at each data location
    .data(data.nodes)
    .enter().append("circle")
      .attr("class", "industry-node")
      .attr("cx", d => xScale(d.x) + margin.left )
      .attr("cy", d => yScale(d.y) + margin.top )
      .attr("r", d => d.radius)
      .attr('fill', d => d.color)

  const zoom = d3.zoom()
    .scaleExtent([0.75, 50])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed() {
    state.zoom = d3.event.transform.k;
    g.attr("transform", d3.event.transform);
  }

}

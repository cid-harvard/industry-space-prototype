import * as d3 from 'd3';
import {getAspectRation} from './Utils';

export default (rootEl, data, rootWidth, rootHeight) => {
  const {
    width, height, outerWidth, outerHeight, margin,
  } = getAspectRation({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, 20);

  const state = {
    zoom: 1,
    active: null,
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

  const zoom = d3.zoom()
    .scaleExtent([0.75, 50])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed() {
    state.zoom = d3.event.transform.k;
    g.attr("transform", d3.event.transform);
    updateChart();
  }

  function reset() {
    state.active = null;
    svg.transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);
  }

  g.selectAll(".industry-node")                  // plot a node at each data location
    .data(data.nodes)
    .enter().append("circle")
      .attr("class", "industry-node")
      .attr("cx", d => xScale(d.x) + margin.left )
      .attr("cy", d => yScale(d.y) + margin.top )
      .attr("r", d => d.radius)
      .attr('fill', d => d.color)
      .on("click", zoomToPoint);

  function zoomToPoint(d) {
    if (state.active !== null && state.active.node() === this) {
      return reset();
    }
    if (state.active !== null) {
      state.active.classed("active", false);
    }
    state.active = d3.select(this).classed("active", true);

    const allEdgeXValues = [xScale(d.x) + margin.left];
    const allEdgeYValues = [yScale(d.y) + margin.top];
    // [...primaryNodes, ...secondaryNodes].forEach(n => {
    //   allEdgeXValues.push(xScale(n.new_x));
    //   allEdgeYValues.push(yScale(n.new_y));
    // });

    const xBounds = d3.extent(allEdgeXValues);
    const yBounds = d3.extent(allEdgeYValues);
    const bounds = [
      [xBounds[0], yBounds[0]],
      [xBounds[1], yBounds[1]],
    ];
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(15, 0.9 / Math.max(dx / width, dy / height)));
    const translate = [outerWidth / 2 - scale * x, outerHeight / 2 - scale * y];

    svg.transition()
      .duration(500)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));

  }

  function updateChart() {
    console.log(state);
    if (state.active) {
      g.selectAll(".industry-node")
        .style('opacity', 0)
      state.active
        .style('opacity', 1)
    } else {
      g.selectAll(".industry-node")
        .style('opacity', 1)
    }
  }

}

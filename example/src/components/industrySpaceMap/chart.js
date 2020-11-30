import * as d3 from 'd3';
import {getAspectRation, drawPoint} from './Utils';

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
    if (state.active !== null && state.active.element.node() === this) {
      return reset();
    }
    if (state.active !== null) {
      state.active.element.classed("active", false);
    }
    state.active = {};
    state.active.element = d3.select(this).classed("active", true);
    state.active.datum = d;

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
      .duration(300)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));

  }

  function updateChart() {
    console.log(state);
    if (state.active) {

      const edgeData = state.active.datum.edges.map(({trg}) => data.nodes.find(({id}) => id === trg));

      g.selectAll(".industry-node")
        .style('opacity', d => edgeData.find(e => e.id === d.id) ? 1 : 0)
        .transition()
        .duration(500)
        .attr("cx", d => {
          const i = edgeData.findIndex(e => e.id === d.id);
          if (i !== -1) {
            const innerCircleLength = edgeData.length < 7 ? edgeData.length : 7;
            return drawPoint(
              i < 7 ? 10 : 20,
              i < 7 ? i : i - 7,
              i < 7 ? innerCircleLength : edgeData.length - 7,
              xScale(state.active.datum.x) + margin.left,
              yScale(state.active.datum.y) + margin.top,
            ).x;
          } else {
            return xScale(d.x) + margin.left;
          }
        })
        .attr("cy", d => {
          const i = edgeData.findIndex(e => e.id === d.id);
          if (i !== -1) {
            const innerCircleLength = edgeData.length < 7 ? edgeData.length : 7;
            return drawPoint(
              i < 7 ? 10 : 20,
              i < 7 ? i : i - 7,
              i < 7 ? innerCircleLength : edgeData.length - 7,
              xScale(state.active.datum.x) + margin.left,
              yScale(state.active.datum.y) + margin.top,
            ).y;
          } else {
            return yScale(d.y) + margin.top;
          }
        })

      state.active.element
        .style('opacity', '1')


      console.log(state)
    } else {
      g.selectAll(".industry-node")
        .style('opacity', '1')
        .attr("cx", d => xScale(d.x) + margin.left )
        .attr("cy", d => yScale(d.y) + margin.top )

      // g.selectAll('.industry-edge-node').remove();

    }
  }

}

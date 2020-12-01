import * as d3 from 'd3';
import {getAspectRation, drawPoint, getBounds} from './Utils';

const shape = 'custom'; // convex || custom || points

const minZoom = 0.75;
const maxZoom = 50;
const innerRingRadius = 24;
const outerRingRadius = 48;

const zoomScales = {
  continent: {
    fill: d3.scaleLinear()
      .domain([1, 4])
      .range([1, 0]),
    stroke: d3.scaleLinear()
      .domain([1, maxZoom])
      .range([1, 1]),
  },
  countries: {
    fill: d3.scaleLinear()
      .domain([1.5, 2, 5, 6, 7, 8])
      .range([0, 0.5, 0.75, 0.5, 0.1, 0]),
    stroke: d3.scaleLinear()
      .domain([1.2, 2, 5, 12, maxZoom])
      .range([0, 0.5, 1, 0.75, 0.2]),
  },
  nodes: {
    fill: d3.scaleLinear()
      .domain([2, 2.55, 3.5])
      .range([0, 0.75, 1]),
  },
}

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
    .scaleExtent([minZoom, maxZoom])
    .on("zoom", zoomed);

  svg.call(zoom);

  function zoomed() {
    state.zoom = d3.event.transform.k;
    g.attr("transform", d3.event.transform);
    updateChart();
  }

  function reset() {
    if (state.active !== null) {
      state.active.element.classed("active", false);
    }
    state.active = null;
    svg.transition()
      .duration(300)
      .call(zoom.transform, d3.zoomIdentity);
    svg.call(zoom);
    updateChart();
  }

  const outerRing = g.append('circle')
    .attr("class", "outer-ring")
    .attr("r", outerRingRadius)
    .attr('fill', 'none')
    .attr('stroke', '#bfbfbf')
    .attr('stroke-width', 0.5)
    .style('opacity', '0')
    .style('pointer-events', 'none')


  const innerRing = g.append('circle')
    .attr("class", "inner-ring")
    .attr("r", innerRingRadius)
    .attr('fill', 'none')
    .attr('stroke', '#bfbfbf')
    .attr('stroke-width', 0.5)
    .style('opacity', '0')
    .style('pointer-events', 'none')


  const continents = g.selectAll(".industry-continents")
    .data(data.clusters.continents)
    .enter().append("polygon")
      .attr("class", "industry-continents")
      .attr("points", d =>
        d[shape].map(([xCoord, yCoord]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(",")).join(" ")
      )
      .attr("fill","rgba(208, 208, 208, 1)")
      .attr("stroke","rgba(0, 0, 0, 1)")
      .style('opacity', 1)
      .on("click", zoomToShape);

  const countries = g.selectAll(".industry-countries")
    .data(data.clusters.countries)
    .enter().append("polygon")
      .attr("class", "industry-countries")
      .attr("points", d =>
        d[shape].map(([xCoord, yCoord]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(",")).join(" ")
      )
      .attr("fill","rgba(208, 208, 208, 0)")
      .attr("stroke","rgba(0, 0, 0, 0)")
      .style('pointer-events', 'none')
      .style('opacity', 1)
      .on("click", zoomToShape);

  const nodes = g.selectAll(".industry-node")
    .data(data.nodes)
    .enter().append("circle")
      .attr("class", "industry-node")
      .attr("cx", d => xScale(d.x) + margin.left )
      .attr("cy", d => yScale(d.y) + margin.top )
      .attr("r", d => d.radius)
      .attr('fill', d => d.color)
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .on("click", zoomToPoint);

  function zoomToPoint(d) {
    if (state.active !== null && state.active.element.node() === this) {
      return reset();
    }
    svg.on(".zoom", null);
    if (state.active !== null) {
      state.active.element.classed("active", false);
    }
    state.active = {};
    state.active.element = d3.select(this).classed("active", true);
    state.active.datum = d;

    const centerX = d.adjustedCoords ? d.adjustedCoords.x : xScale(d.x) + margin.left;
    const centerY = d.adjustedCoords ? d.adjustedCoords.y : yScale(d.y) + margin.top;
    const allXValues = [centerX];
    const allYValues = [centerY];
    d.edges.forEach((_n, i) => {
      const radiusCoords = drawPoint(outerRingRadius, i, d.edges.length, centerX, centerY);
      allXValues.push(radiusCoords.x);
      allYValues.push(radiusCoords.y);
    });

    const {translate, scale} = getBounds(allXValues, allYValues, width, height, outerWidth, outerHeight, 7);

    svg.transition()
      .duration(300)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
  }

  function zoomToShape(d) {

    const allXValues = [];
    const allYValues = [];
    d[shape].forEach(([xValue, yValue]) => {
      allXValues.push(xScale(xValue) + margin.left)
      allYValues.push(yScale(yValue) + margin.top)
    });

    const {translate, scale} = getBounds(allXValues, allYValues, width, height, outerWidth, outerHeight, 50);

    svg.transition()
      .duration(300)
      .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
  }

  function updateChart() {
    if (state.active) {
      const edgeData = state.active.datum.edges.map(({trg}) => data.nodes.find(({id}) => id === trg));
      const centerX = state.active.datum.adjustedCoords ?
        state.active.datum.adjustedCoords.x : xScale(state.active.datum.x) + margin.left;
      const centerY = state.active.datum.adjustedCoords ?
        state.active.datum.adjustedCoords.y : yScale(state.active.datum.y) + margin.top;

      outerRing
        .attr("cx", centerX)
        .attr("cy", centerY)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1)
      innerRing
        .attr("cx", centerX)
        .attr("cy", centerY)
        .style('opacity', 0)
        .transition()
        .duration(300)
        .style('opacity', 1)

      nodes
        .each(d => {
          const i = edgeData.findIndex(e => e.id === d.id);
          if (i !== -1) {
            const innerCircleLength = edgeData.length < 7 ? edgeData.length : 7;
            const adjustedCoords = drawPoint(
              i < 7 ? innerRingRadius : outerRingRadius,
              i < 7 ? i : i - 7,
              i < 7 ? innerCircleLength : edgeData.length - 7,
              centerX,
              centerY,
            );
            d.adjustedCoords = adjustedCoords;
          } else if (d.id !== state.active.datum.id) {
            d.adjustedCoords = undefined;
          }
        })
        .style('pointer-events', 'auto')
        .style('opacity', 1)
        .style('display', d => d.id === state.active.datum.id || edgeData.find(e => e.id === d.id) ? 'block' : 'none')
        .transition()
        .duration(500)
        .attr("cx", d => d.adjustedCoords ? d.adjustedCoords.x : xScale(d.x) + margin.left)
        .attr("cy", d => d.adjustedCoords ? d.adjustedCoords.y : yScale(d.y) + margin.top)

      continents
        .style('pointer-events', 'none')
        .style('opacity', 0)

      countries
        .style('pointer-events', 'none')
        .style('opacity', 0)

      state.active.element
        .style('display', 'block')
    } else {

      const nodeOpacity = zoomScales.nodes.fill(state.zoom)
      console.log(nodeOpacity)
      nodes
        .each(d => d.adjustedCoords = undefined)
        .style('display', 'block')
        .style('pointer-events', zoomScales.nodes.fill(state.zoom) > 0.025 ? 'auto' : 'none')
        .style('opacity', nodeOpacity)
        .attr("cx", d => xScale(d.x) + margin.left )
        .attr("cy", d => yScale(d.y) + margin.top )

      continents
        .style('pointer-events', zoomScales.continent.fill(state.zoom) > 0.1 ? 'auto' : 'none')
        .attr("fill",`rgba(208, 208, 208, ${zoomScales.continent.fill(state.zoom)})`)
        .attr("stroke",`rgba(0, 0, 0, ${zoomScales.continent.stroke(state.zoom)})`)
        .style('opacity', 1)

      countries
        .style('pointer-events', zoomScales.countries.fill(state.zoom) > 0.01 ? 'auto' : 'none')
        .attr("fill",`rgba(208, 208, 208, ${zoomScales.countries.fill(state.zoom)})`)
        .attr("stroke",`rgba(0, 0, 0, ${zoomScales.countries.stroke(state.zoom)})`)
        .style('opacity', 1)

      outerRing
        .style('opacity', 0)
      innerRing
        .style('opacity', 0)
    }
  }

  return {updateChart}

}

import * as d3 from 'd3';
import {
  getAspectRation,
  drawPoint,
  getBounds,
  wrap,
  intensityLegendClassName,
  sectorLegendClassName,
  ellipsisText,
} from './Utils';
import {rgba, lighten} from 'polished';
import {getStandardTooltip} from './rapidTooltip';

const defaultShape = 'custom'; // convex || custom || points
const minExpectedScreenSize = 1020;

const minZoom = 0.75;
const maxZoom = 50;
export const innerRingRadius = 24;
export const outerRingRadius = 48;

const zoomScales = {
  continent: {
    fill: d3.scaleLinear()
      .domain([1, 3])
      .range([1, 0]),
    stroke: d3.scaleLinear()
      .domain([1, maxZoom])
      .range([1, 1]),
    label: d3.scaleLinear()
      .domain([1, 1.85, 2.15])
      .range([1, 1, 0]),
  },
  countries: {
    fill: d3.scaleLinear()
      .domain([1.5, 2, 3, 4, 7, 8])
      .range([0, 0.5, 0.75, 0.3, 0.1, 0]),
    stroke: d3.scaleLinear()
      .domain([1.2, 2, 5, 12, maxZoom])
      .range([0, 0.5, 1, 0.75, 0.2]),
    label: d3.scaleLinear()
      .domain([1.45, 1.75, 3.65, 4])
      .range([0, 1, 1, 0]),
  },
  nodes: {
    fill: d3.scaleLinear()
      .domain([0, 2, 2.55, 3.5])
      .range([0, 0.2, 0.75, 1]),
    label: d3.scaleLinear()
      .domain([8, 9])
      .range([0, 1]),
  },
}

export default (rootEl, data, rootWidth, rootHeight, backButton, tooltipEl, legendEl) => {
  let shape = defaultShape;

  const urlParams = new URLSearchParams(window.location.search);
  const shapeParam = urlParams.get('shape');
  if (shapeParam) {
    shape = shapeParam;
  }

  const {
    width, height, outerWidth, outerHeight, margin,
  } = getAspectRation({w: 4, h: 3}, {w: rootWidth, h: rootHeight}, 20);

  const smallerSize = width < height ? width : height;
  const radiusAdjuster = smallerSize / minExpectedScreenSize;
  let radius = 2.5;
  radius = radius < 2.5 ? 2.5 * radiusAdjuster : radius * radiusAdjuster;

  const sectorLegend = legendEl.querySelector('.' + sectorLegendClassName);
  const intensityLegend = legendEl.querySelector('.' + intensityLegendClassName);

  const state = {
    zoom: 1,
    active: null,
    hoveredShape: null,
    hoveredNode: null,
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
    clearActiveLabels();
    svg.transition()
      .duration(300)
      .call(zoom.transform, d3.zoomIdentity);
    svg.call(zoom);
    updateChart();
  }

  function softReset(d) {
    if (state.active !== null) {
      state.active.element.classed("active", false);
    }
    state.active = null;
    clearActiveLabels();

    const {translate, scale} = getBounds(
      [xScale(d.x) + margin.left],
      [yScale(d.y) + margin.top],
      width, height, outerWidth, outerHeight, 7
    );

    svg.call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
    svg.call(zoom);
    d.wasActive = true;
    updateChart();
  }

  backButton.removeEventListener('click', reset);
  backButton.addEventListener('click', reset);

  function setHoveredShape(datum) {
    state.hoveredShape = datum;
    updateChart();
  }

  function setHoveredNode(datum) {
    state.hoveredNode = datum;
    if (!state.active) {
      updateChart();
    }
  }

  function clearActiveLabels() {
    g.selectAll('.industry-ring-label').remove();
  }

  const outerRing = g.append('circle')
    .attr("class", "outer-ring")

  const innerRing = g.append('circle')
    .attr("class", "inner-ring")

  const continents = g.selectAll(".industry-continents")
    .data(data.clusters.continents)
    .enter().append("polygon")
      .attr("class", "industry-continents")
      .attr("points", d =>
        d[shape].map(([xCoord, yCoord]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(",")).join(" ")
      )
      .attr("fill", d => rgba(d.color, 1))
      .attr("stroke", d => rgba('#efefef', 1))
      .style('opacity', 1)
      .on("click", d => zoomToShape(d, 3))
      .on("mouseenter", d => setHoveredShape(d))
      .on("mouseleave", () => setHoveredShape(null))

  const countries = g.selectAll(".industry-countries")
    .data(data.clusters.countries)
    .enter().append("polygon")
      .attr("class", "industry-countries")
      .attr("points", d =>
        d[shape].map(([xCoord, yCoord]) =>
          [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(",")).join(" ")
      )
      .attr("fill", d => rgba(d.color, 0))
      .attr("stroke", d => rgba('#efefef', 0))
      .style('opacity', 1)
      .on("click", d => zoomToShape(d, 5))
      .on("mouseenter", d => setHoveredShape(d))
      .on("mouseleave", () => setHoveredShape(null))

  const hoveredShape = g.append('polygon')
    .attr('class', 'industry-cluster-hovered')
    .style('display', 'none')

  const nodeOpacity = zoomScales.nodes.fill(state.zoom)
  const nodes = g.selectAll(".industry-node")
    .data(data.nodes)
    .enter().append("circle")
      .attr("class", "industry-node")
      .attr("cx", d => xScale(d.x) + margin.left )
      .attr("cy", d => yScale(d.y) + margin.top )
      .attr("r", radius)
      .attr('fill', d => '#fff')
      .style('opacity', nodeOpacity)
      .on("click", zoomToPoint)
      .on('mousemove', d => {
        tooltipEl.innerHTML = getStandardTooltip({
          title: d.label,
          color: rgba(d.color, 0.3),
          rows: [
            ['NAICS', d.id],
          ],
        });
        tooltipEl.style.display = 'block';
        tooltipEl.style.top = d3.event.pageY + 'px';
        tooltipEl.style.left = d3.event.pageX + 'px';
      })
      .on("mouseenter", d => setHoveredNode(d))
      .on("mouseleave", () => {
        tooltipEl.style.display = 'none';
        setHoveredNode(null)
      })

  const hoveredNode = g.append('circle')
    .attr('class', 'industry-node-hovered')
    .style('display', 'none')

  const continentLabels = g.selectAll(".industry-continents-label")
    .data(data.clusters.continents)
    .enter().append("text")
      .attr("class", "industry-continents-label")
      .attr('x', d => xScale(d.center[0]) + margin.left)
      .attr('y', d => yScale(d.center[1]) + margin.top)
      .style('font-size', radius * 8)
      .text(d => d.name);

  const countryLabels = g.append("g")
    .attr("class", "industry-countries-label-group")
    .style('display', 'none')

  countryLabels.selectAll(".industry-countries-label")
    .data(data.clusters.countries)
    .enter().append("text")
      .attr("class", "industry-countries-label")
      .attr('x', d => xScale(d.center[0]) + margin.left)
      .attr('y', d => yScale(d.center[1]) + margin.top)
      .style('font-size', radius * 5)
      .text(d => d.name);

  const nodeLabels = g.append("g")
    .attr("class", "industry-nodes-label-group")
    .style('display', 'none')

  nodeLabels.selectAll(".industry-nodes-label")
    .data(data.nodes)
    .enter().append("text")
      .attr("class", "industry-nodes-label")
      .attr('x', d => xScale(d.x) + margin.left)
      .attr('y', d => yScale(d.y) + margin.top + (radius * 1.45))
      .style('font-size', radius * 0.5)
      .text(d => d.label)
      .call(wrap, radius * 8, radius * 7);


  function zoomToPoint(d) {
    if (state.active !== null && state.active.element.node() === this) {
      return softReset(d);
    }
    svg.on(".zoom", null);
    clearActiveLabels();
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

  function zoomToShape(d, maxZoom) {

    const allXValues = [];
    const allYValues = [];
    d[shape].forEach(([xValue, yValue]) => {
      allXValues.push(xScale(xValue) + margin.left)
      allYValues.push(yScale(yValue) + margin.top)
    });

    const {translate, scale} = getBounds(allXValues, allYValues, outerWidth, outerHeight, outerWidth, outerHeight, maxZoom);

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
        .attr('fill', d => d.color)
        .transition()
        .ease(d3.easeCircleInOut)
        .duration(500)
        .attr("cx", d => d.adjustedCoords ? d.adjustedCoords.x : xScale(d.x) + margin.left)
        .attr("cy", d => d.adjustedCoords ? d.adjustedCoords.y : yScale(d.y) + margin.top)

      g.selectAll(".industry-ring-label")
        .data(data.nodes.filter(d => d.id === state.active.datum.id || edgeData.find(e => e.id === d.id)))
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
          }
        })
        .enter().append("text")
          .attr("class", "industry-ring-label")
          .attr('x', d => d.adjustedCoords ? d.adjustedCoords.x : xScale(d.x) + margin.left)
          .attr('y', d => d.adjustedCoords ?
            d.adjustedCoords.y + Math.max(radius * 2, 4)
            : yScale(d.y) + margin.top + Math.max(radius * 2, 4)
          )
          .style('pointer-events', 'none')
          .style('font-size', Math.max(radius * 0.8, 1.85))
          .text(d => ellipsisText(d.label, 60))
          .call(wrap, Math.max(radius * 14, 20), radius * 9)
          .style('opacity', 0)
          .transition()
          .delay(500)
          .duration(300)
          .style('opacity', 1)

      continents
        .style('pointer-events', 'none')
        .style('opacity', 0)

      countries
        .style('pointer-events', 'none')
        .style('opacity', 0)

      hoveredShape
        .style('display', 'none')

      hoveredNode
        .style('display', 'none')

      continentLabels
        .style('display', 'none')

      countryLabels
        .style('display', 'none')

      nodeLabels
        .style('display', 'none')

      state.active.element
        .style('display', 'block')

      backButton.style.display = 'block';
      sectorLegend.style.display = 'block';
      intensityLegend.style.display = 'none';
    } else {
      const nodeOpacity = zoomScales.nodes.fill(state.zoom)
      nodes
        .each(d => d.adjustedCoords = undefined)
        .style('display', 'block')
        .style('pointer-events', zoomScales.nodes.fill(state.zoom) > 0.275 ? 'auto' : 'none')
        .style('opacity', nodeOpacity)
        .attr('fill', d => {
          if (state.zoom < 3) {
            return '#fff';
          } else if (state.zoom < 3.25) {
            return lighten(zoomScales.countries.fill(state.zoom) - 0.1, d.color);
          } else if (state.zoom < 3.85) {
            return lighten(zoomScales.countries.fill(state.zoom) - 0.3, d.color);
          } else {
            return d.color;
          }
        })
        .transition()
        .ease(d3.easeCircleInOut)
        .duration(d => {
          if (d.wasActive) {
            d.wasActive = undefined;
            return 0;
          } else {
            return 500;
          }
        })
        .attr("cx", d => xScale(d.x) + margin.left )
        .attr("cy", d => yScale(d.y) + margin.top )

      continents
        .style('pointer-events', zoomScales.continent.fill(state.zoom) > 0.1 ? 'auto' : 'none')
        .attr("fill", d => rgba(d.color, zoomScales.continent.fill(state.zoom)))
        .attr("stroke", d => rgba('#efefef', zoomScales.continent.stroke(state.zoom)))
        .style('opacity', 1)

      countries
        .style('pointer-events', zoomScales.countries.fill(state.zoom) > 0.01 ? 'auto' : 'none')
        .attr("fill", d => rgba(d.color, zoomScales.countries.fill(state.zoom)))
        .attr("stroke", d => rgba('#efefef', zoomScales.countries.stroke(state.zoom)))
        .style('opacity', 1)

      continentLabels
        .style('opacity', zoomScales.continent.label(state.zoom))
        .style("display", 'block')

      countryLabels
        .style('opacity', zoomScales.countries.label(state.zoom))
        .style("display", 'block')

      if (state.zoom > 8) {
        nodeLabels
          .style('opacity', zoomScales.nodes.label(state.zoom))
          .style("display", 'block')
      } else {
        nodeLabels
          .style("display", 'none')
      }

      if (state.zoom > 2) {
       backButton.style.display = 'block';
      } else {
       backButton.style.display = 'none';
      }

      if (state.zoom > 3.5) {
        sectorLegend.style.display = 'block';
        intensityLegend.style.display = 'none';
      } else {
        sectorLegend.style.display = 'none';
        intensityLegend.style.display = 'block';
      }

      outerRing
        .style('opacity', 0)
      innerRing
        .style('opacity', 0)

      if (state.hoveredShape) {
        hoveredShape
          .attr("points", state.hoveredShape[shape].map(([xCoord, yCoord]) =>
            [xScale(xCoord) + margin.left, yScale(yCoord) + margin.top].join(",")).join(" ") )
          .attr("fill", 'none')
          .attr("stroke", '#efefef')
          .attr("stroke-width", 3)
          .style('display', 'block')
      } else {
        hoveredShape
          .style('display', 'none')
      }
      if (state.hoveredNode) {
        hoveredNode
          .attr("cx", xScale(state.hoveredNode.x) + margin.left )
          .attr("cy", yScale(state.hoveredNode.y) + margin.top )
          .attr("fill", state.hoveredNode.color)
          .attr("r", radius)
          .attr("stroke", state.zoom > 4 ? '#333' : '#efefef')
          .attr("stroke-width", radius < 2 ? 0.6 : 1)
          .style('display', 'block')
      } else {
        hoveredNode
          .style('display', 'none')
      }
    }
  }

  return {updateChart}

}

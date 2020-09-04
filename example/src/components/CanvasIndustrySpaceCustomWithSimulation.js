import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';

const minExpectedScreenSize = 1020;

const data = JSON.parse(raw('../data/industry-space-with-start-positions.json'));

const createForceGraph = (rootEl, data) => {
  const root = d3.select(rootEl);

  const height = window.innerHeight;
  const width =  window.innerWidth;

  const smallerSize = width < height ? width : height;
  const padding = smallerSize * 0.1;
  const widthMargin = (width - smallerSize) / 2;
  const heightMargin = (height - (smallerSize * 0.9)) / 2;
  const rangeWidth = width - padding - widthMargin;
  const rangeHeight = height - padding - heightMargin;

  const allXValues = [];
  const allYValues = [];
  data.nodes.forEach(({x, y}) => {
    allXValues.push(x);
    allYValues.push(y);
  });

  const radiusAdjuster = smallerSize / minExpectedScreenSize;

  data.nodes = data.nodes.map(n => {
    let radius = Math.random() * 8;
    radius = radius < 2.5 ? 2.5 * radiusAdjuster : radius * radiusAdjuster;
    // const radius = 5;
    return {...n, radius}
  })

  const xRange = d3.extent(allXValues);
  const yRange = d3.extent(allYValues);

  const xScale = d3.scaleLinear()
    .domain(xRange)
    .range([0 + padding + widthMargin, rangeWidth]);

  const yScale = d3.scaleLinear()
    .domain(yRange)
    .range([ rangeHeight, 0 + padding + heightMargin]);

  const canvas = root.append('canvas')
    .attr('width', width + 'px')
    .attr('height', height + 'px')
    .node();

  const context = canvas.getContext('2d');

  const simulation = d3.forceSimulation()
                .force("center", d3.forceCenter(rangeWidth / 10, rangeHeight / 10))
                .force("charge", d3.forceManyBody().strength(-6.5))
                .force("collision", d3.forceCollide().radius(function(d) {
                  return d.radius * 5 ;
                }))
                .force("link", d3.forceLink().strength(d => parseFloat(d.proximity)).id(function(d) { return d.id; }))
                // .velocityDecay(0.3)


  let transform = d3.zoomIdentity;

  initGraph(data)

  function initGraph(tempData){

    function zoomed() {
      transform = d3.event.transform;
      simulationUpdate();
    }

    const zoom = d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed);

    let hoveredNode = undefined;
    
    const canvasEl = d3.select(canvas);
    canvasEl
      .call(zoom)
      .on('mousemove', function() {
        hoveredNode = dragsubject();
        simulationUpdate();
      })
      .on('click', function(event) {
        const node = dragsubject();
        if (node) {
          // alert('Clicked ' + node.id);
          // const x0 = xScale(node.x);
          // const x1 = xScale(node.x + 20);
          // const y0 = yScale(node.y);
          // const y1 = yScale(node.y + 20);
          // context.clearRect(0, 0, width, height);
          // context.translate(transform.x, transform.y);
          // context.scale(transform.k, transform.k);
          // context.transition().duration(750).call(
          //   zoom.transform,
          //   d3.zoomIdentity
          //     .translate(width / 10, height / 10)
          //     .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / (rangeWidth / 10), (y1 - y0) / (rangeHeight / 10))))
          // );
        }
      })



    function dragsubject() {
      const x = transform.invertX(d3.event.x);
      const y = transform.invertY(d3.event.y);
      for (let i = tempData.nodes.length - 1; i >= 0; --i) {
        const node = tempData.nodes[i];
        let nodeX = xScale(node.x);
        let nodeY = yScale(node.y);
        const dx = x - nodeX;
        const dy = y - nodeY;

        if (dx * dx + dy * dy < node.radius * node.radius) {

          nodeX =  transform.applyX(nodeX);
          nodeY = transform.applyY(nodeY);

          return node;
        }
      }
    }

    simulation.nodes(tempData.nodes)
              .on("tick", simulationUpdate);

    simulation.force("link")
              .links(tempData.edges);



    function simulationUpdate() {
      const hoveredId = hoveredNode && hoveredNode.id ? hoveredNode.id : undefined;

      context.save();

      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function(d) {
        context.beginPath();
        context.moveTo(xScale(d.source.x), yScale(d.source.y));
        context.lineTo(xScale(d.target.x), yScale(d.target.y));
        context.strokeStyle = hoveredId === d.source.id || hoveredId === d.target.id
          ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.08)';
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
        context.fillStyle = d.color
        context.fill();
      });

      if (hoveredNode) {
        rootEl.style.cursor = 'pointer';
        context.beginPath();
        context.arc(xScale(hoveredNode.x), yScale(hoveredNode.y), hoveredNode.radius, 0, 2 * Math.PI, true);
        context.fillStyle = hoveredNode.color
        context.fill();
        context.strokeStyle = 'black';
        context.stroke();
      } else {
        rootEl.style.cursor = 'move';
      }

      context.restore();
    }
  }
}

export default () => {
  const rootNodeRef = useRef(null);

  useEffect(() => {
    let rootEl = null;
    if (rootNodeRef && rootNodeRef.current) {
      rootEl = rootNodeRef.current;
      createForceGraph(rootEl, data);
    }
    return (() => {
      if (rootEl) {
        rootEl.innerHTML = '';
      }
    })
  }, [rootNodeRef]);

  return (
    <div ref={rootNodeRef} />
  );
}

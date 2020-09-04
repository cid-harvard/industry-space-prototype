import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import * as polished from 'polished';

const minExpectedScreenSize = 1020;

// const data = JSON.parse(raw('../data/industry-space-with-start-positions.json'));
const data = JSON.parse(raw('../data/industry-space-no-overlap.json'));

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
    let radius = Math.random() * 6;
    radius = radius < 2.5 ? 2.5 * radiusAdjuster : radius * radiusAdjuster;
    // const radius = 3;
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
                  return (d.radius * 5) * (minExpectedScreenSize / smallerSize);
                }))
                .force("link", d3.forceLink().strength(d => parseFloat(d.proximity)).id(function(d) { return d.id; }))
                .velocityDecay(0.8)
  let k = 0;
  while ((simulation.alpha() > 1e-2) && (k < 150)) {
      simulation.tick();
      k = k + 1;
  }

  let transform = d3.zoomIdentity;

  initGraph(data)

  function initGraph(tempData){

    function zoomed() {
      transform = d3.event.transform;
      simulationUpdate();
    }

    const zoom = d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed);

    let hoveredNode = undefined;
    let highlightedNode = undefined;
    
    const canvasEl = d3.select(canvas);
    canvasEl
      .call(zoom)
      .on('mousemove', function() {
        hoveredNode = dragsubject();
        simulationUpdate();
      })
      .on('click', function(event) {
        console.log(tempData);
        const node = dragsubject();
        highlightedNode = node;
        simulationUpdate();
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
      const highlightedId = highlightedNode && highlightedNode.id ? highlightedNode.id : undefined;
      const linkedEdges = tempData.edges.filter(({source, target}) =>
          source.id === hoveredId || target.id === hoveredId ||
          source.id === highlightedId || target.id === highlightedId)

      context.save();

      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function(d) {
        context.beginPath();
        context.moveTo(xScale(d.source.x), yScale(d.source.y));
        context.lineTo(xScale(d.target.x), yScale(d.target.y));
        if (highlightedId) {
          context.strokeStyle = '#f9f9f9';
        } else {
          context.strokeStyle = '#e6e6e6';
        }
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
        context.fillStyle = highlightedId === undefined ? d.color : polished.setLightness(0.91, d.color);
        context.fill();
      });

      const linkedNodeIds = [];
      linkedEdges.forEach(function(d) {
        if (!linkedNodeIds.includes(d.source.id)) {
          linkedNodeIds.push(d.source.id);
        }
        if (!linkedNodeIds.includes(d.target.id)) {
          linkedNodeIds.push(d.target.id);
        }
        context.beginPath();
        context.moveTo(xScale(d.source.x), yScale(d.source.y));
        context.lineTo(xScale(d.target.x), yScale(d.target.y));
        context.strokeStyle = '#afafaf';
        context.stroke();
      });

      linkedNodeIds.forEach(function(nodeId, i) {
        const d = tempData.nodes.find(({id}) => id === nodeId);
        if (d) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = d.color;
          context.fill();
          context.strokeStyle = '#afafaf';
          context.stroke();
        }
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
      if (highlightedNode) {
        context.beginPath();
        context.arc(xScale(highlightedNode.x), yScale(highlightedNode.y), highlightedNode.radius, 0, 2 * Math.PI, true);
        context.fillStyle = highlightedNode.color
        context.fill();
        context.strokeStyle = 'black';
        context.stroke();
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
    <div>
      <div ref={rootNodeRef} />
    </div>
  );
}

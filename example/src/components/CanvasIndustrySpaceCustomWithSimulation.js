import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import debounce from 'lodash/debounce';

const data = JSON.parse(raw('../data/industry-space-with-start-positions.json'));

const createForceGraph = (rootEl, data) => {
  const root = d3.select(rootEl);

  // const radius = 5;

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

  data.nodes = data.nodes.map(n => {
    return {...n, radius: (Math.random() + 0.5) * 5}
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
                .force("center", d3.forceCenter(rangeHeight / 10, rangeHeight / 10))
                .force("charge", d3.forceManyBody().strength(-5))
                .force("collision", d3.forceCollide().radius(function(d) {
                  return d.radius * 4;
                }))
                .force("link", d3.forceLink().strength(d => parseFloat(d.proximity) * 1.5).id(function(d) { return d.id; }))
                // .velocityDecay(0.3)


  let transform = d3.zoomIdentity;

  initGraph(data)

  function initGraph(tempData){

    function zoomed() {
      transform = d3.event.transform;
      simulationUpdate();
    }

    let hoveredNode = undefined;
    
    d3.select(canvas)
      .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))
      .on('mousemove', function() {
        hoveredNode = dragsubject();
        simulationUpdate();
      })
      .on('click', function() {
        const node = dragsubject();
        if (node) {
          alert('Clicked ' + node.id);
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


  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateWindowDimensions = debounce(() => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 500);
    window.addEventListener('resize', updateWindowDimensions);
    return () => {
      window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

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

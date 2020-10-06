import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import debounce from 'lodash/debounce';


const data = JSON.parse(raw('../data/product-space.json'));

const createForceGraph = (rootEl, data) => {
  const root = d3.select(rootEl);

  const height = window.innerHeight;
  const width =  window.innerWidth;

  const smallerSize = width < height ? width : height;
  const padding = smallerSize * 0.05;
  const widthMargin = (width - smallerSize) / 2;
  const heightMargin = (height - (smallerSize * 0.9)) / 2;

  const allXValues = [];
  const allYValues = [];
  data.nodes.forEach(({init_x, init_y}) => {
    allXValues.push(init_x);
    allYValues.push(init_y);
  });

  const xRange = d3.extent(allXValues);
  const yRange = d3.extent(allYValues);

  const xScale = d3.scaleLinear()
    .domain(xRange)
    .range([0 + padding + widthMargin, width - padding - widthMargin]);

  const yScale = d3.scaleLinear()
    .domain(yRange)
    .range([ 0 + padding + heightMargin, height - padding - heightMargin]);



  const canvas = root.append('canvas')
    .attr('width', width + 'px')
    .attr('height', height + 'px')
    .node();

  const context = canvas.getContext('2d');

  const simulation = d3.forceSimulation()
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("charge", d3.forceManyBody().strength(-50))
                .force("link", d3.forceLink().strength(1).id(function(d) { return d.id; }))

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
        let nodeX = xScale(node.init_x);
        let nodeY = yScale(node.init_y);
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
        context.moveTo(xScale(d.source.init_x), yScale(d.source.init_y));
        context.lineTo(xScale(d.target.init_x), yScale(d.target.init_y));
        context.strokeStyle = hoveredId === d.source.id || hoveredId === d.target.id
          ? 'rgba(0, 0, 0, 0.5)' : 'rgba(150, 150, 150, 0.3)';
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc(xScale(d.init_x), yScale(d.init_y), d.radius, 0, 2 * Math.PI, true);
        context.fillStyle = d.color
        context.fill();

        context.lineWidth = 0.5;
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context.stroke();
      });

      if (hoveredNode) {
        rootEl.style.cursor = 'pointer';
        context.beginPath();
        context.arc(xScale(hoveredNode.init_x), yScale(hoveredNode.init_y), hoveredNode.radius, 0, 2 * Math.PI, true);
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
  }, [rootNodeRef, windowDimensions]);

  return (
    <div>
      <div ref={rootNodeRef} />
    </div>
  );
}

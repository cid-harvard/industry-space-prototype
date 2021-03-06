import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import debounce from 'lodash/debounce';


const data0 = JSON.parse(raw('../data/industry-space.json'));
const data1 = JSON.parse(raw('../data/industry-space-custom-3-clean.json'));

const createForceGraph = (rootEl, data) => {
  const root = d3.select(rootEl);

  const radius = 5;

  const height = window.innerHeight;
  const width =  window.innerWidth;

  const smallerSize = width < height ? width : height;
  const padding = smallerSize * 0.05;
  const widthMargin = (width - smallerSize) / 2;
  const heightMargin = (height - (smallerSize * 0.9)) / 2;

  const allXValues = [];
  const allYValues = [];
  data.nodes.forEach(({graphics: {x, y}}) => {
    allXValues.push(x);
    allYValues.push(y);
  });

  const xRange = d3.extent(allXValues);
  const yRange = d3.extent(allYValues);

  const xScale = d3.scaleLinear()
    .domain(xRange)
    .range([0 + padding + widthMargin, width - padding - widthMargin]);

  const yScale = d3.scaleLinear()
    .domain(yRange)
    .range([ height - padding - heightMargin, 0 + padding + heightMargin]);



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
        let nodeX = xScale(node.graphics.x);
        let nodeY = yScale(node.graphics.y);
        const dx = x - nodeX;
        const dy = y - nodeY;

        if (dx * dx + dy * dy < radius * radius) {

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
        context.moveTo(xScale(d.source.graphics.x), yScale(d.source.graphics.y));
        context.lineTo(xScale(d.target.graphics.x), yScale(d.target.graphics.y));
        context.strokeStyle = hoveredId === d.source.id || hoveredId === d.target.id
          ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.04)';
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc(xScale(d.graphics.x), yScale(d.graphics.y), radius, 0, 2 * Math.PI, true);
        context.fillStyle = d.color
        context.fill();
      });

      if (hoveredNode) {
        rootEl.style.cursor = 'pointer';
        context.beginPath();
        context.arc(xScale(hoveredNode.graphics.x), yScale(hoveredNode.graphics.y), radius, 0, 2 * Math.PI, true);
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

  const [dataset, setDataset] = useState(0)

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
      const data = dataset ? data1 : data0;
      createForceGraph(rootEl, data);
    }
    return (() => {
      if (rootEl) {
        rootEl.innerHTML = '';
      }
    })
  }, [rootNodeRef, windowDimensions, dataset]);

  return (
    <div>
      <button 
        style={{position: 'fixed'}}
        onClick={() => setDataset(v => v ? 0 : 1)}
      >
        {dataset ? 'Switch to Original Layout' : 'Switch to No Overlap Layout'}
      </button>
      <div ref={rootNodeRef} />
    </div>
  );
}

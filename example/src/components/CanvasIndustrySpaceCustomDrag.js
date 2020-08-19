import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import debounce from 'lodash/debounce';

const output = {nodes: [], edges: []};

let data = JSON.parse(raw('../data/industry-space-custom-3.json'));
data = {
  nodes: data.nodes.map(n => {
    const node = {
      id: n.id,
      graphics: n.graphics,
      naics2d: n.naics2d,
      color: n.color,
    }
    output.nodes.push({...node})
    return node;
  }),
  edges: data.edges.map(e => {
    const edge = {
      id: e.id,
      source: e.source.id,
      target: e.target.id,
      value: e.value,
      proximity: e.proximity,
    }
    output.edges.push({...edge})
    return edge;
  })
}
console.log(output)

const createForceGraph = (rootEl, data) => {
  const root = d3.select(rootEl);

  const radius = 15;

  const height = window.innerHeight;
  const width =  window.innerWidth;

  // const allXValues = [];
  // const allYValues = [];
  // data.nodes.forEach(({graphics: {x, y}}) => {
  //   allXValues.push(x);
  //   allYValues.push(y);
  // });

  // const xRange = d3.extent(allXValues);
  // const yRange = d3.extent(allYValues);

  // const  = d3.scaleLinear()
  //   .domain(xRange)
  //   .range([ 0 + 100, width - 100 ]);

  // const  = d3.scaleLinear()
  //   .domain(yRange)
  //   .range([ height - 100, 0 + 100]);



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
    let selectedNode = undefined;
    
    d3.select(canvas)
      .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))
      .on('mousemove', function() {
        hoveredNode = dragsubject();
        simulationUpdate();
      })
      .on('click', function() {
        const node = dragsubject();
        if (node) {
          selectedNode = node;
        } else {
          if (selectedNode) {
            const index = tempData.nodes.findIndex(({id}) => id === selectedNode.id);
            if (index !== -1) {

              const x = transform.invertX(d3.event.x);
              const y = transform.invertY(d3.event.y);
              tempData.nodes[index].graphics.x = x;
              tempData.nodes[index].graphics.y = y;
            }
          }
          selectedNode = undefined;
        }
      })



    function dragsubject() {
      const x = transform.invertX(d3.event.x);
      const y = transform.invertY(d3.event.y);
      for (let i = tempData.nodes.length - 1; i >= 0; --i) {
        const node = tempData.nodes[i];
        let nodeX = (node.graphics.x);
        let nodeY = (node.graphics.y);
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
        context.moveTo((d.source.graphics.x), (d.source.graphics.y));
        context.lineTo((d.target.graphics.x), (d.target.graphics.y));
        context.strokeStyle = hoveredId === d.source.id || hoveredId === d.target.id
          ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.04)';
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc((d.graphics.x), (d.graphics.y), radius, 0, 2 * Math.PI, true);
        context.fillStyle = d.color
        context.fill();
      });

      if (hoveredNode) {
        rootEl.style.cursor = 'pointer';
        context.beginPath();
        context.arc((hoveredNode.graphics.x), (hoveredNode.graphics.y), radius, 0, 2 * Math.PI, true);
        context.fillStyle = hoveredNode.color
        context.fill();
        context.strokeStyle = 'black';
        context.stroke();
      } else {
        rootEl.style.cursor = 'move';
      }

      if (selectedNode) {
        rootEl.style.cursor = 'pointer';
        context.beginPath();
        context.arc((selectedNode.graphics.x), (selectedNode.graphics.y), radius, 0, 2 * Math.PI, true);
        context.fillStyle = selectedNode.color
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
    <div ref={rootNodeRef} width={500} height={500} />
  );
}

import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';

const data = JSON.parse(raw('../data/industry-space.json'));

const createForceGraph = (root, data) => {
  const radius = 3;

  const height = window.innerHeight;
  const width =  window.innerWidth;

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
    .range([ 0 + 100, width - 100 ]);

  const yScale = d3.scaleLinear()
    .domain(yRange)
    .range([ height - 100, 0 + 100]);



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

    d3.select(canvas).call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))

    simulation.nodes(tempData.nodes)
              .on("tick", simulationUpdate);

    simulation.force("link")
              .links(tempData.edges);



    function simulationUpdate(){
      context.save();

      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function(d) {
        context.beginPath();
        context.moveTo(xScale(d.source.graphics.x), yScale(d.source.graphics.y));
        context.lineTo(xScale(d.target.graphics.x), yScale(d.target.graphics.y));
        context.strokeStyle = 'rgba(0, 0, 0, 0.1)'
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc(xScale(d.graphics.x), yScale(d.graphics.y), radius, 0, 2 * Math.PI, true);
        context.fillStyle = d.color
        context.fill();
      });

        context.restore();
    }
  }


}

export default () => {
  const rootNodeRef = useRef(null);

  useEffect(() => {
    let svgNode = null;
    if (rootNodeRef && rootNodeRef.current) {
      svgNode = rootNodeRef.current;
      const svg = d3.select(svgNode);
      createForceGraph(svg, data);
    }
  }, [rootNodeRef]);

  return (
    <div ref={rootNodeRef} width={500} height={500} />
  );
}

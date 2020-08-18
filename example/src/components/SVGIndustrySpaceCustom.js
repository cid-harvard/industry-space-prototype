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



  const svg = root.append('svg')
    .attr('width', width + 'px')
    .attr('height', height + 'px')
    .node();

  const simulation = d3.forceSimulation()
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("charge", d3.forceManyBody().strength(-50))
                .force("link", d3.forceLink().strength(1).id(function(d) { return d.id; }))

  let transform = d3.zoomIdentity;

  initGraph(data)

  function initGraph(tempData){

    function zoomed() {
      transform = d3.event.transform;
      // simulationUpdate();
    }

    d3.select(svg).call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))

    // simulation.nodes(tempData.nodes)
    //           .on("tick", simulationUpdate);

    // simulation.force("link")
    //           .links(tempData.edges);



    svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.edges)
      .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(data.nodes)
      .enter().append("g")
      
    const circles = node.append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return d.graphics.color; })

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

import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';

const data = JSON.parse(raw('../data/canvas-data.json'));
// const data = JSON.parse(raw('../data/industry-space.json'));

const createForceGraph = (root, data) => {
  var radius = 5;

  var defaultNodeCol = "white",
      highlightCol = "yellow";

  var height = window.innerHeight;
  var graphWidth =  window.innerWidth;

  var graphCanvas = root.append('canvas')
  .attr('width', graphWidth + 'px')
  .attr('height', height + 'px')
  .node();

  var context = graphCanvas.getContext('2d');

  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


  var simulation = d3.forceSimulation()
                .force("center", d3.forceCenter(graphWidth / 2, height / 2))
                .force("x", d3.forceX(graphWidth / 2).strength(0.1))
                .force("y", d3.forceY(height / 2).strength(0.1))
                .force("charge", d3.forceManyBody().strength(-50))
                .force("link", d3.forceLink().strength(1).id(function(d) { return d.id; }))
                .alphaTarget(0)
                .alphaDecay(0.05)

  var transform = d3.zoomIdentity;



  initGraph(data)

  function initGraph(tempData){


    function zoomed() {
      console.log("zooming")
      transform = d3.event.transform;
      simulationUpdate();
    }

    d3.select(graphCanvas)
        .call(d3.drag().subject(dragsubject).on("start", dragstarted).on("drag", dragged).on("end",dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed))



  function dragsubject() {
    var i,
    x = transform.invertX(d3.event.x),
    y = transform.invertY(d3.event.y),
    dx,
    dy;
    for (i = tempData.nodes.length - 1; i >= 0; --i) {
      let node = tempData.nodes[i];
      let dx = x - node.x;
      let dy = y - node.y;

      if (dx * dx + dy * dy < radius * radius) {

        node.x =  transform.applyX(node.x);
        node.y = transform.applyY(node.y);

        return node;
      }
    }
  }


  function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
    // console.log(d3.event)
  }

  function dragged() {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);

  }

  function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
  }

    simulation.nodes(tempData.nodes)
              .on("tick",simulationUpdate);

    simulation.force("link")
              .links(tempData.edges);



    function render(){

    }

    function simulationUpdate(){
      context.save();

      context.clearRect(0, 0, graphWidth, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function(d) {
            context.beginPath();
            context.moveTo(d.source.x, d.source.y);
            context.lineTo(d.target.x, d.target.y);
            context.stroke();
        });

        // Draw the nodes
        tempData.nodes.forEach(function(d, i) {

            context.beginPath();
            context.arc(d.x, d.y, radius, 0, 2 * Math.PI, true);
            context.fillStyle = d.col ? "red":"black"
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
    // return () => {
    //   if (svgNode) {
    //     svgNode.innerHTML = '';
    //   }
    // };
  }, [rootNodeRef]);

  return (
    <div ref={rootNodeRef} width={500} height={500} />
  );
}

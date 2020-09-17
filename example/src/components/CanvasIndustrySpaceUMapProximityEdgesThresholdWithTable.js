import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import * as polished from 'polished';
import Table from './Table';

const minExpectedScreenSize = 1020;

// const data = JSON.parse(raw('../data/industry-space-with-start-positions.json'));
const data = JSON.parse(raw('../data/umap-custom-2.json'));
const proximityNodes = JSON.parse(raw('../data/proximity-15.json'));
const naicsData = JSON.parse(raw('../data/naics_2017.json'));

const colorMap = [
  { id: '0', color: '#A973BE' },
  { id: '1', color: '#F1866C' },
  { id: '2', color: '#FFC135' },
  { id: '3', color: '#93CFD0' },
  { id: '4', color: '#488098' },
  { id: '5', color: '#77C898' },
  { id: '6', color: '#6A6AAD' },
  { id: '7', color: '#D35162' },
  { id: '8', color: '#F28188' },
]

const createForceGraph = (rootEl, data, setNodeList, setHovered) => {
  const root = d3.select(rootEl);

  const height = window.innerHeight;
  const width =  window.innerWidth - 450;

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
    // const radius = 2.5;
    const industry6Digit = naicsData.find(({code}) => n.id.toString() === code);
    if (!industry6Digit) {
      throw new Error('undefined industry');
      
    }
    const naics_id = industry6Digit.naics_id;
    let topLevelParentId = naics_id.toString();
    let current = naicsData.find(datum => datum.naics_id === naics_id);
    while(current && current.parent_id !== null) {
    // eslint-disable-next-line
      current = naicsData.find(datum => datum.naics_id === current.parent_id);
      if (current && current.parent_id !== null) {
        topLevelParentId = current.parent_id.toString();
      } else if (current && current.naics_id !== null) {
        topLevelParentId = current.naics_id.toString();
      }
    }
    if (parseInt(topLevelParentId, 10) > 8) {
      console.error(current);
      throw new Error('Parent out of range')
    }
    const {color} = colorMap.find(({id}) => id === topLevelParentId);
    return {...n, radius, color, parent: current}
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
                .force("center", d3.forceCenter(rangeWidth / 1.3, rangeHeight / 1.8))
                .force("charge", d3.forceManyBody().strength(-10))
                .force("collision", d3.forceCollide().radius(function(d) {
                  return (d.radius * 1.25) * (minExpectedScreenSize / smallerSize);
                }))
                .force("link", d3.forceLink().strength(d => d.proximity).id(d => d.id))
                .velocityDecay(0.96)
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
    let primaryNodes = [];
    let secondaryNodes = [];
    let tertiaryNodes = [];
    
    const canvasEl = d3.select(canvas);
    canvasEl
      .call(zoom)
      .on('mousemove', function() {
        hoveredNode = dragsubject();
        setHovered(hoveredNode);
        simulationUpdate();
      })
      .on('click', function(event) {
        const node = dragsubject();
        highlightedNode = node;
        if (node) {
          primaryNodes = [];
          secondaryNodes = [];
          tertiaryNodes = [];
          proximityNodes[node.id].forEach(({trg, proximity}, i) => {
            const node2 = tempData.nodes.find(n => n.id === trg);
            if (node2) {
              if (i < 5) {
                primaryNodes.push({...node2, proximity});
              } else if (i < 10) {
                secondaryNodes.push({...node2, proximity});
              } else {
                tertiaryNodes.push({...node2, proximity});
              }
            }
          });
          const allEdgeXValues = [];
          const allEdgeYValues = [];
          [node, ...primaryNodes].forEach(n => {
            allEdgeXValues.push(xScale(n.x));
            allEdgeYValues.push(yScale(n.y));
          });

          const xBounds = d3.extent(allEdgeXValues);
          const yBounds = d3.extent(allEdgeYValues);
          const bounds = [
            [xBounds[0], yBounds[0]],
            [xBounds[1], yBounds[1]],
          ];
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const x = (bounds[0][0] + bounds[1][0]) / 2;
          const y = (bounds[0][1] + bounds[1][1]) / 2;
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / rangeWidth, dy / rangeHeight)));
          const translate = [width / 2 - scale * x, height / 2 - scale * y];

          canvasEl.transition()
              .duration(500)
              .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));

          setNodeList({
            selected: node,
            connected: [...primaryNodes, ...secondaryNodes, ...tertiaryNodes],
          })
        } else {
          setNodeList(undefined);
        }
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
      // const hoveredId = hoveredNode && hoveredNode.id ? hoveredNode.id : undefined;
      const highlightedId = highlightedNode && highlightedNode.id ? highlightedNode.id : undefined;
      // const linkedEdges = tempData.edges.filter(({source, target}) =>
      //     source.id === hoveredId || target.id === hoveredId ||
      //     source.id === highlightedId || target.id === highlightedId)

      context.save();

      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      // tempData.edges.forEach(function(d) {
      //   context.beginPath();
      //   context.moveTo(xScale(d.source.x), yScale(d.source.y));
      //   context.lineTo(xScale(d.target.x), yScale(d.target.y));
      //   if (highlightedId) {
      //     context.strokeStyle = '#f9f9f9';
      //   } else {
      //     context.strokeStyle = '#e6e6e6';
      //   }
      //   context.stroke();
      // });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
        context.fillStyle = highlightedId === undefined ? d.color : polished.rgba(d.color, 0.035);
        context.fill();
      });

      // const linkedNodeIds = [];
      // linkedEdges.forEach(function(d) {
      //   if (!linkedNodeIds.includes(({id}) => d.source.id)) {
      //     linkedNodeIds.push(d.source);
      //   }
      //   if (!linkedNodeIds.includes(({id}) => d.target.id)) {
      //     linkedNodeIds.push(d.target);
      //   }
      //   // context.beginPath();
      //   // context.moveTo(xScale(d.source.x), yScale(d.source.y));
      //   // context.lineTo(xScale(d.target.x), yScale(d.target.y));
      //   // context.strokeStyle = '#afafaf';
      //   // context.stroke();
      // });

      // linkedNodeIds.forEach(function(d, i) {
      //   if (d) {
      //     context.beginPath();
      //     context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
      //     context.fillStyle = d.color;
      //     context.fill();
      //     context.strokeStyle = '#afafaf';
      //     context.stroke();
      //   }
      // });


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
      if (primaryNodes && primaryNodes.length) {
        primaryNodes.forEach(function(d, i) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = polished.rgba(d.color, 0.8);
          context.fillStyle = polished.rgba(d.color, d.proximity * 100);
          context.fill();
        });
      }
      if (secondaryNodes && secondaryNodes.length) {
        secondaryNodes.forEach(function(d, i) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = polished.rgba(d.color, 0.5);
          context.fillStyle = polished.rgba(d.color, d.proximity * 100);
          context.fill();
        });
      }
      if (tertiaryNodes && tertiaryNodes.length) {
        tertiaryNodes.forEach(function(d, i) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = polished.rgba(d.color, 0.3);
          context.fill();
        });
      }

      context.restore();
    }
  }
}

export default () => {
  const rootNodeRef = useRef(null);
  const [nodeList, setNodeList] = useState(undefined);
  const [hovered, setHovered] = useState(undefined);

  useEffect(() => {
    let rootEl = null;
    if (rootNodeRef && rootNodeRef.current) {
      rootEl = rootNodeRef.current;
      createForceGraph(rootEl, data, setNodeList, setHovered);
    }
    return (() => {
      if (rootEl) {
        rootEl.innerHTML = '';
      }
    })
  }, [rootNodeRef, setNodeList, setHovered]);

  return (
    <div>
      <div ref={rootNodeRef} />
      <Table nodes={nodeList} hovered={hovered} />
    </div>
  );
}

import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import * as polished from 'polished';
import Table from './Table';
import styled from 'styled-components';
import sortBy from 'lodash/sortBy';

const Tooltip = styled.div`
  position: fixed;
  max-width: 100px;
  font-family: 'OfficeCodeProWeb', monospace;
  font-size: 0.75rem;
  text-align: center;
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 1rem));
  font-weight: 600;
  color: black;
  text-shadow:
   -1px -1px 0 #fff,  
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
     1px 1px 0 #fff;
`;

const minExpectedScreenSize = 1020;

const data = JSON.parse(raw('../data/industry-space-no-overlap.json'));
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
    return {...n, radius, color, parent: current, label: industry6Digit.name}
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

  const update = initGraph(data);

  function initGraph(tempData){

    function zoomed() {
      transform = d3.event.transform;
      simulationUpdate();
    }

    const zoom = d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed);

    let hoveredNode = undefined;
    let highlightedNode = undefined;
    let connectedNodes = [];
    
    const canvasEl = d3.select(canvas);
    canvasEl
      .call(zoom)
      .on('mousemove', function() {
        hoveredNode = dragsubject();
        setHovered({node: hoveredNode, coords: {x: d3.event.x, y: d3.event.y}});
        simulationUpdate();
      })
      .on('click', function(event) {
        const node = dragsubject();
        highlightedNode = node;
        if (node) {
          const edges = tempData.edges.filter(({source, target}) => source.id === node.id || target.id === node.id)
          const allEdgeXValues = [];
          const allEdgeYValues = [];
          connectedNodes = [];
          edges.forEach(({source, target, proximity}) => {
            allEdgeXValues.push(xScale(source.x));
            allEdgeXValues.push(xScale(target.x));
            allEdgeYValues.push(yScale(source.y));
            allEdgeYValues.push(yScale(target.y));
            if (source.id !== node.id && !connectedNodes.find(n => n.id === source.id)) {
              connectedNodes.push({...source, proximity: proximity.toFixed(5)});
            }
            if (target.id !== node.id && !connectedNodes.find(n => n.id === target.id)) {
              connectedNodes.push({...target, proximity: proximity.toFixed(5)});
            }
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
          connectedNodes = sortBy(connectedNodes, 'proximity').reverse()
          setNodeList({
            selected: node,
            connected: connectedNodes,
          })

        } else {
          connectedNodes = [];
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
        context.fillStyle = highlightedId === undefined ? d.color : polished.setLightness(0.97, d.color);
        context.fill();
      });

      const linkedNodeIds = [];
      linkedEdges.forEach(function(d) {
        if (!linkedNodeIds.includes(({id}) => d.source.id)) {
          linkedNodeIds.push(d.source);
        }
        if (!linkedNodeIds.includes(({id}) => d.target.id)) {
          linkedNodeIds.push(d.target);
        }
        context.beginPath();
        context.moveTo(xScale(d.source.x), yScale(d.source.y));
        context.lineTo(xScale(d.target.x), yScale(d.target.y));
        context.strokeStyle = '#afafaf';
        context.stroke();
      });

      linkedNodeIds.forEach(function(d, i) {
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

      let nodeCount = 1;
      connectedNodes.forEach(function(d, i) {
        if (d) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = d.color;
          context.fill();
          context.strokeStyle = hoveredNode && hoveredNode.id === d.id ? 'black' : '#afafaf';
          context.stroke();

          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.font = `400 ${d.radius}px OfficeCodeProWeb`;
          context.fillStyle = "white";
          context.fillText(nodeCount++, xScale(d.x), yScale(d.y));
        }
      });

      context.restore();
    }
    const triggerSimulationUpdate = (node) => {
      highlightedNode = node;
      if (node) {
        const edges = tempData.edges.filter(({source, target}) => source.id === node.id || target.id === node.id)
        const allEdgeXValues = [];
        const allEdgeYValues = [];
        connectedNodes = [];
        edges.forEach(({source, target, proximity}) => {
          allEdgeXValues.push(xScale(source.x));
          allEdgeXValues.push(xScale(target.x));
          allEdgeYValues.push(yScale(source.y));
          allEdgeYValues.push(yScale(target.y));
          if (source.id !== node.id && !connectedNodes.find(n => n.id === source.id)) {
            connectedNodes.push({...source, proximity: proximity.toFixed(5)});
          }
          if (target.id !== node.id && !connectedNodes.find(n => n.id === target.id)) {
            connectedNodes.push({...target, proximity: proximity.toFixed(5)});
          }
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
        connectedNodes = sortBy(connectedNodes, 'proximity').reverse()
        setNodeList({
          selected: node,
          connected: connectedNodes,
        })

      } else {
        connectedNodes = [];
        setNodeList(undefined);
      }
      simulationUpdate();
    }
    const clearSelections = () => {
      const allEdgeXValues = [];
      const allEdgeYValues = [];
      tempData.nodes.forEach(n => {
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
      hoveredNode = undefined;
      highlightedNode = undefined;
      connectedNodes = [];
      setNodeList(undefined);
      simulationUpdate();
    }
    return {triggerSimulationUpdate, clearSelections};
  }
  return update;
}

export default () => {
  const rootNodeRef = useRef(null);
  const [nodeList, setNodeList] = useState(undefined);
  const [hovered, setHovered] = useState(undefined);
  const [updateSimulation, setUpdateSimulation] = useState(undefined);

  useEffect(() => {
    let rootEl = null;
    if (rootNodeRef && rootNodeRef.current) {
      rootEl = rootNodeRef.current;
      const triggerSimulationUpdate = createForceGraph(rootEl, data, setNodeList, setHovered);
      setUpdateSimulation(triggerSimulationUpdate);
    }
    return (() => {
      if (rootEl) {
        rootEl.innerHTML = '';
      }
    })
  }, [rootNodeRef, setNodeList, setHovered, setUpdateSimulation]);

  const tooltip = hovered && hovered.node ? (
    <Tooltip
      style={{top: hovered.coords.y, left: hovered.coords.x}}
    >
      {hovered.node.label.replace(hovered.node.id, '')}
    </Tooltip>
  ) : null

  return (
    <div>
      {tooltip}
      <div ref={rootNodeRef} />
      <Table nodes={nodeList} hovered={hovered} updateSimulation={updateSimulation} />
    </div>
  );
}

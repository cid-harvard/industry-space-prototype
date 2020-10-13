import React, {useEffect, useState, useRef} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import * as polished from 'polished';
import styled, {keyframes} from 'styled-components';

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

const BackButton = styled.button`
  position: fixed;
  left: 0;
  top: 0;
  background-color: transparent;
  border: none;
  font-size: 1rem;
  font-family: 'OfficeCodeProWeb', monospace;
  cursor: pointer;
  padding: 1rem;
`;

const data = JSON.parse(raw('../data/product-space.json'));
const chemData = JSON.parse(raw('../data/chemical-space.json'));

const createForceGraph = (rootEl, data, setNodeList, setHovered, codeList) => {
  const root = d3.select(rootEl);

  const height = window.innerHeight;
  const width =  window.innerWidth;

  // const smallerSize = width < height ? width : height;
  // const padding = smallerSize * 0.05;
  // const widthMargin = (width - smallerSize) / 2;
  // const heightMargin = (height - (smallerSize * 0.9)) / 2;

  const allXValues = [];
  const allYValues = [];
  
  data.nodes = data.nodes.map((n) => {
    const {x, y} = n;
    allXValues.push(x);
    allYValues.push(y);
    const isIncluded = codeList && codeList.length ? codeList.find(code => code === n.code) : true;
    return {...n, fill: isIncluded ? n.color : 'white'}
  });

  const xRange = d3.extent(allXValues);
  const yRange = d3.extent(allYValues);

  const xScale = d3.scaleLinear()
    .domain(xRange)
    // .range([0 + padding + widthMargin, width - padding - widthMargin]);
    .range([0 + (width * 0.05), width - (width * 0.05)]);

  const yScale = d3.scaleLinear()
    .domain(yRange)
    // .range([ 0 + padding + heightMargin, height - padding - heightMargin]);
    .range([ 0 + (height * 0.05), height - (height * 0.05)]);



  const canvas = root.append('canvas')
    .attr('width', width + 'px')
    .attr('height', height + 'px')
    .node();

  const context = canvas.getContext('2d');

  const simulation = d3.forceSimulation()
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("charge", d3.forceManyBody().strength(-50))
                .force("link", d3.forceLink().strength(1).id(function(d) { return d.id; }))
                .alphaDecay(1)

  let transform = d3.zoomIdentity;

  let hoveredNode = undefined;
  let highlightedNode = undefined;
  let primaryNodes = [];

  const update = initGraph(data);

  function initGraph(tempData){

    function zoomed() {
      transform = d3.event.transform;
      simulationUpdate();
    }

    const zoom = d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed);
    
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
          primaryNodes = [];
          const connections = tempData.edges.filter(({target, source}) => target.id === node.id || source.id === node.id);
          connections.forEach(({target, source}) => {
            if (!primaryNodes.find(n => n.id === target.id) && node.id !== target.id) {
              primaryNodes.push(target);
            }
            if (!primaryNodes.find(n => n.id === source.id) && node.id !== source.id) {
              primaryNodes.push(source);
            }
          })
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
          const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
          const translate = [width / 2 - scale * x, height / 2 - scale * y];

          canvasEl.transition()
              .duration(500)
              .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));

          setNodeList({
            selected: node,
            connected: [...primaryNodes],
          })
        } else {
          primaryNodes = [];
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
      const highlightedId = highlightedNode && highlightedNode.id ? highlightedNode.id : undefined;
      const linkedEdges = tempData.edges.filter(({source, target}) =>
          (hoveredNode && (source.id === hoveredNode.id || target.id === hoveredNode.id)) ||
          source.id === highlightedId || target.id === highlightedId)

      context.save();

      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);

      tempData.edges.forEach(function(d) {
        context.beginPath();
        context.moveTo(xScale(d.source.x), yScale(d.source.y));
        context.lineTo(xScale(d.target.x), yScale(d.target.y));
        context.strokeStyle = hoveredNode && (hoveredNode.id === d.source.id || hoveredNode.id === d.target.id)
          ? 'rgba(0, 0, 0, 0.5)' : 'rgba(150, 150, 150, 0.4)';
        context.stroke();
      });

      // Draw the nodes
      tempData.nodes.forEach(function(d, i) {
        context.beginPath();
        context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
        context.lineWidth = 2;
        context.strokeStyle =  highlightedId === undefined ? '#6d6d6d' : polished.setLightness(0.9, "#6d6d6d");
        context.lineWidth = 2;
        context.stroke();
        context.fillStyle = highlightedId === undefined ? d.fill : polished.setLightness(0.9, d.fill);
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
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        context.stroke();
      });

      linkedNodeIds.forEach(function(d, i) {
        if (d) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = d.fill;
          context.fill();
          context.lineWidth = 2;
          context.strokeStyle = '#afafaf';
          context.stroke();
        }
      });

      if (hoveredNode) {
        rootEl.style.cursor = 'pointer';
        context.beginPath();
        context.arc(xScale(hoveredNode.x), yScale(hoveredNode.y), hoveredNode.radius, 0, 2 * Math.PI, true);
        context.fillStyle = hoveredNode.fill
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.stroke();
      } else {
        rootEl.style.cursor = 'move';
      }
      if (highlightedNode) {
        context.beginPath();
        context.arc(xScale(highlightedNode.x), yScale(highlightedNode.y), highlightedNode.radius, 0, 2 * Math.PI, true);
        context.fillStyle = highlightedNode.fill
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = 'black';
        context.stroke();
      }
      // let nodeCount = 1;
      if (primaryNodes && primaryNodes.length) {
        primaryNodes.forEach(function(d, i) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = d.fill;
          context.fill();
          context.lineWidth = 2;
          context.strokeStyle =  hoveredNode && hoveredNode.id === d.id ? 'black' : '#6d6d6d';
          context.stroke();

          // context.textAlign = 'center';
          // context.textBaseline = 'middle';
          // context.font = `400 ${d.radius}px OfficeCodeProWeb`;
          // context.fillStyle = "white";
          // context.fillText(nodeCount++, xScale(d.x), yScale(d.y));
        });
      }
      context.restore();
    }

    const triggerSimulationUpdate = (node) => {
      if (node) {
        highlightedNode = node;
        primaryNodes = [];
        const connections = tempData.edges.filter(({target, source}) => target.id === node.id || source.id === node.id);
        connections.forEach(({target, source}) => {
          if (!primaryNodes.find(n => n.id === target.id) && node.id !== target.id) {
            primaryNodes.push(target);
          }
          if (!primaryNodes.find(n => n.id === source.id) && node.id !== source.id) {
            primaryNodes.push(source);
          }
        })
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
        const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
        const translate = [width / 2 - scale * x, height / 2 - scale * y];

        canvasEl.transition()
            .duration(500)
            .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
        setNodeList({
          selected: node,
          connected: [...primaryNodes],
        })
      } else {
        setNodeList(undefined);
      }
      simulationUpdate();
    }
    const clearSelections = () => {
      const allEdgeXValues = [];
      const allEdgeYValues = [];
      chemData.nodes.forEach(n => {
        const node = data.nodes.find(({id}) => id === n.id);
        allEdgeXValues.push(xScale(node.x));
        allEdgeYValues.push(yScale(node.y));
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
      const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
      const translate = [width / 2 - scale * x, height / 2 - scale * y];

      canvasEl.transition()
          .duration(500)
          .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale));
      hoveredNode = undefined;
      highlightedNode = undefined;
      primaryNodes = [];
      setNodeList(undefined);
      simulationUpdate();
    }
    return {triggerSimulationUpdate, clearSelections};
  }
  setTimeout(() => {
    update.clearSelections();
  }, 5)

  return update;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const Root = styled.div`
  opacity: 0;
  animation: ${fadeIn} 0.15s linear 1 forwards 0.4s;
`;

export default ({codeList}) => {
  const rootNodeRef = useRef(null);
  const [hovered, setHovered] = useState(undefined);
  const [updateSimulation, setUpdateSimulation] = useState(undefined);
  const [nodeList, setNodeList] = useState(undefined);

  useEffect(() => {
    let rootEl = null;
    if (rootNodeRef && rootNodeRef.current) {
      rootEl = rootNodeRef.current;
      const triggerSimulationUpdate = createForceGraph(rootEl, data, setNodeList, setHovered, codeList);
      setUpdateSimulation(triggerSimulationUpdate);
    }
    return (() => {
      if (rootEl) {
        rootEl.innerHTML = '';
      }
    })
  }, [rootNodeRef, setNodeList, setHovered, setUpdateSimulation, codeList]);

  const tooltip = hovered && hovered.node ? (
    <Tooltip
      style={{top: hovered.coords.y, left: hovered.coords.x}}
    >
      {hovered.node.label.replace(hovered.node.id, '')}
    </Tooltip>
  ) : null;

  const onClear = () => updateSimulation ? updateSimulation.clearSelections() : null;
  const backButton = nodeList ? (
    <BackButton onClick={onClear}>{'< Back to Chemical Space'}</BackButton>
  ) : null;

  return (
    <Root>
      {backButton}
      {tooltip}
      <div ref={rootNodeRef} />
    </Root>
  );
}

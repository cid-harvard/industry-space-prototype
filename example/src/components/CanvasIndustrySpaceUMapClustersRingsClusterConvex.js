import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import raw from 'raw.macro';
import Table from './PercentTable';
import styled from 'styled-components';
import {interval} from 'd3-timer';
import * as polished from 'polished';
import hull from 'hull.js';

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

function getLines(ctx, text, maxWidth) {
    var words = text.split(" ");
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
            currentLine += " " + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
}

// var roundedPoly = function(ctx, points,radius){
//     var i, x, y, len, p1, p2, p3, v1, v2, sinA, sinA90, radDirection, drawDirection, angle, halfAngle, cRadius, lenOut;
//     var asVec = function (p, pp, v) { // convert points to a line with len and normalised
//         v.x = pp.x - p.x; // x,y as vec
//         v.y = pp.y - p.y;
//         v.len = Math.sqrt(v.x * v.x + v.y * v.y); // length of vec
//         v.nx = v.x / v.len; // normalised
//         v.ny = v.y / v.len;
//         v.ang = Math.atan2(v.ny, v.nx); // direction of vec
//     }
//     v1 = {};
//     v2 = {};
//     len = points.length;                         // number points
//     p1 = points[len - 1];                        // start at end of path
//     for (i = 0; i < len; i++) {                  // do each corner
//         p2 = points[(i) % len];                  // the corner point that is being rounded
//         p3 = points[(i + 1) % len];
//         // get the corner as vectors out away from corner
//         asVec(p2, p1, v1);                       // vec back from corner point
//         asVec(p2, p3, v2);                       // vec forward from corner point
//         // get corners cross product (asin of angle)
//         sinA = v1.nx * v2.ny - v1.ny * v2.nx;    // cross product
//         // get cross product of first line and perpendicular second line
//         sinA90 = v1.nx * v2.nx - v1.ny * -v2.ny; // cross product to normal of line 2
//         angle = Math.asin(sinA);                 // get the angle
//         radDirection = 1;                        // may need to reverse the radius
//         drawDirection = false;                   // may need to draw the arc anticlockwise
//         // find the correct quadrant for circle center
//         if (sinA90 < 0) {
//             if (angle < 0) {
//                 angle = Math.PI + angle; // add 180 to move us to the 3 quadrant
//             } else {
//                 angle = Math.PI - angle; // move back into the 2nd quadrant
//                 radDirection = -1;
//                 drawDirection = true;
//             }
//         } else {
//             if (angle > 0) {
//                 radDirection = -1;
//                 drawDirection = true;
//             }
//         }
//         halfAngle = angle / 2;
//         // get distance from corner to point where round corner touches line
//         lenOut = Math.abs(Math.cos(halfAngle) * radius / Math.sin(halfAngle));
//         if (lenOut > Math.min(v1.len / 2, v2.len / 2)) { // fix if longer than half line length
//             lenOut = Math.min(v1.len / 2, v2.len / 2);
//             // ajust the radius of corner rounding to fit
//             cRadius = Math.abs(lenOut * Math.sin(halfAngle) / Math.cos(halfAngle));
//         } else {
//             cRadius = radius;
//         }
//         x = p2.x + v2.nx * lenOut; // move out from corner along second line to point where rounded circle touches
//         y = p2.y + v2.ny * lenOut;
//         x += -v2.ny * cRadius * radDirection; // move away from line to circle center
//         y += v2.nx * cRadius * radDirection;
//         // x,y is the rounded corner circle center
//         ctx.arc(x, y, cRadius, v1.ang + Math.PI / 2 * radDirection, v2.ang - Math.PI / 2 * radDirection, drawDirection); // draw the arc clockwise
//         p1 = p2;
//         p2 = p3;
//     }
//     ctx.closePath();
// }

const minExpectedScreenSize = 1020;

// const data = JSON.parse(raw('../data/industry-space-with-start-positions.json'));
const data = JSON.parse(raw('../data/umap-clusters-custom-2.json'));
const proximityNodes = JSON.parse(raw('../data/proximity-min-max.json'));
const naicsData = JSON.parse(raw('../data/naics_2017.json'));
const clusterMap = JSON.parse(raw('../data/clusters-mapping-1.json'));

const allProximities = [];
for (let node in proximityNodes) {
  proximityNodes[node].forEach(({proximity}) => allProximities.push(proximity));
}
const proximityRange = d3.extent(allProximities);
const proximityScale = d3.scaleLinear()
    .domain(proximityRange)
    .range([0, 100]);

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

  // const radiusAdjuster = smallerSize / minExpectedScreenSize;

  data.nodes = data.nodes.map(n => {
    // let radius = Math.random() * 6;
    // radius = radius < 2.5 ? 2.5 * radiusAdjuster : radius * radiusAdjuster;
    const radius = 2.5;
    const industry6Digit = naicsData.find(({code}) => n.id.toString() === code);
    if (!industry6Digit) {
      throw new Error('undefined industry');
      
    }
    const naics_id = industry6Digit.naics_id;
    const label = industry6Digit.name;
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

    return {
      ...n,
      radius,
      color,
      parent: current,
      label,
      initial_x: n.x,
      initial_y: n.y,
    }
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
                .alphaDecay(0.99)

  let transform = d3.zoomIdentity;


  let hoveredNode = undefined;
  let highlightedNode = undefined;
  let primaryNodes = [];
  let secondaryNodes = [];
  let shouldTick = false;

  const update = initGraph(data);

  function initGraph(tempData){

    function zoomed() {
      transform = d3.event.transform;
      simulationUpdate();
    }

    const zoom = d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed);

    function drawPoint(r, currentPoint, totalPoints, centerX, centerY) {  

      var theta = ((Math.PI*2) / totalPoints);
      var angle = (theta * currentPoint);

      const x = (r * Math.cos(angle) + centerX);
      const y = (r * Math.sin(angle) + centerY);

      return {x, y};
    }

    const canvasEl = d3.select(canvas);
    canvasEl
      .call(zoom)
      .on('mousemove', function() {
        if (!shouldTick) {
          hoveredNode = dragsubject();
          setHovered({node: hoveredNode, coords: {x: d3.event.x, y: d3.event.y}});
          simulationUpdate();
        }
      })
      .on('click', function(event) {
        const node = dragsubject();
        if (node) {
          highlightedNode = node;
          primaryNodes = [];
          secondaryNodes = [];
          proximityNodes[node.id].forEach(({trg, proximity}, i) => {
            const node2 = tempData.nodes.find(n => n.id === trg);
            if (node2) {
              const numPrimary = Math.floor((proximityNodes[node.id].length - 1) / 2);
              const numSecondary = proximityNodes[node.id].length - numPrimary;
              if (i < numPrimary) {
                const newCoords = drawPoint(20, i, numPrimary, node.x, node.y)
                node2.new_x = newCoords.x;
                node2.new_y = newCoords.y;
                const xDist = newCoords.x > node2.x ? newCoords.x - node2.x : node2.x - newCoords.x;
                const yDist = newCoords.y > node2.y ? newCoords.y - node2.y : node2.y - newCoords.y;
                node2.x_interval = xDist / 20;
                node2.y_interval = yDist / 20;
                primaryNodes.push({
                  ...node2,
                  proximity,
                });
              } else {
                const newCoords = drawPoint(40, i, numSecondary, node.x, node.y)
                node2.new_x = newCoords.x;
                node2.new_y = newCoords.y;
                const xDist = newCoords.x > node2.x ? newCoords.x - node2.x : node2.x - newCoords.x;
                const yDist = newCoords.y > node2.y ? newCoords.y - node2.y : node2.y - newCoords.y;
                node2.x_interval = xDist / 20;
                node2.y_interval = yDist / 20;
                secondaryNodes.push({
                  ...node2,
                  proximity,
                });
              }
            }
          });
          const allEdgeXValues = [];
          const allEdgeYValues = [];
          [...primaryNodes, ...secondaryNodes].forEach(n => {
            allEdgeXValues.push(xScale(n.new_x));
            allEdgeYValues.push(yScale(n.new_y));
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
              .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale))

          const t = interval(function(elapsed) {
            shouldTick = false;
            [...primaryNodes, ...secondaryNodes].forEach(n => {
              const currentNode = tempData.nodes.find(d => d.id === n.id);
              if (Math.ceil(currentNode.x) === Math.ceil(currentNode.new_x)) {
                currentNode.x = currentNode.new_x;
              } else {
                shouldTick = true;
                currentNode.x = currentNode.x > currentNode.new_x
                  ? currentNode.x - currentNode.x_interval
                  : currentNode.x + currentNode.x_interval;
              }
              if (Math.ceil(currentNode.y) === Math.ceil(currentNode.new_y)) {
                currentNode.y = currentNode.new_y;
              } else {
                shouldTick = true;
                currentNode.y = currentNode.y > currentNode.new_y
                  ? currentNode.y - currentNode.y_interval
                  : currentNode.y + currentNode.y_interval;
              }
            });
            simulationUpdate();
            if (!shouldTick || elapsed > 350) {
              t.stop()
            };
          }, 10);
          setNodeList({
            selected: node,
            connected: [...primaryNodes, ...secondaryNodes],
          })
          setHovered({node: undefined, coords: {x: d3.event.x, y: d3.event.y}});
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

          if ((!primaryNodes.length && !secondaryNodes.length) ||
                primaryNodes.find(n => n.id === node.id) ||
                secondaryNodes.find(n => n.id === node.id)) {

            return node;
          }

        }
      }
    }

    simulation.nodes(tempData.nodes)
              .on("tick", simulationUpdate);

    simulation.force("link")
              .links(tempData.edges);

    function simulationUpdate() {
      const highlightedId = highlightedNode && highlightedNode.id ? highlightedNode.id : undefined;

      context.save();

      context.clearRect(0, 0, width, height);
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);


      // Draw the cluster shapes 
      if (highlightedId === undefined) {
        const convexMap = [
          { id: '4', color: '#93CFD0', coords: [] },
          { id: '5', color: '#488098', coords: [] },
          { id: '9', color: '#77C898', coords: [] },
          { id: '10', color: '#A973BE', coords: [] },
          { id: '12', color: '#F1866C', coords: [] },
          { id: '13', color: '#D35162', coords: [] },
          { id: '14', color: '#FFC135', coords: [] },
        ]

        clusterMap.forEach(({naics, C1}) => {
          const node = tempData.nodes.find(({id}) => id.toString() === naics.toString());
          const convex = convexMap.find(({id}) => id.toString() === C1.toString());
          if (node && convex) {
            convex.coords.push([node.x, node.y]);
          }
        })

        // const cornerRadius = 30;
        context.lineWidth = 2;
        convexMap.forEach(({coords, color}) => {
          context.fillStyle = polished.rgba(color, 0.095);
          context.strokeStyle = polished.rgba(color, 0.5);
          context.beginPath(); // start a new path

          // const points = hull(coords.map(([x, y]) => [xScale(x), yScale(y)]), 60)
          //                 .map(([x, y]) => ({x, y}));
          // roundedPoly(context, points, cornerRadius);
          // context.fill();
          // context.stroke();

          const points = hull(coords.map(([x, y]) => [xScale(x), yScale(y)]), 200)
          context.beginPath();
          context.lineCap = 'round'
          points.forEach((point, i) => {
            if (i === 0) {
              context.moveTo(...point);
            } else {
              context.lineTo(...point);
            }
          })
          context.closePath();
          context.stroke();
          context.fill();
        })
        context.lineWidth = 1;
      } 


      // Draw the nodes
      if (highlightedNode) {
        context.beginPath();
        context.arc(
          xScale(highlightedNode.x),
          yScale(highlightedNode.y),
          20 / (minExpectedScreenSize / smallerSize),
          0,
          2 * Math.PI,
          true
        );
        context.strokeStyle = '#dfdfdf';
        context.lineWidth = 0.2;
        context.stroke();

        context.beginPath();
        context.arc(
          xScale(highlightedNode.x),
          yScale(highlightedNode.y),
          40 / (minExpectedScreenSize / smallerSize),
          0,
          2 * Math.PI,
          true
        );
        context.stroke();

        context.beginPath();
        context.arc(xScale(highlightedNode.x), yScale(highlightedNode.y), highlightedNode.radius, 0, 2 * Math.PI, true);
        context.fillStyle = highlightedNode.color
        context.fill();
        context.strokeStyle = 'black';
        context.stroke();


        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillStyle = "#000";
        context.font = `400 1.3px OfficeCodeProWeb`;
        getLines(context, highlightedNode.label, 15).reverse().forEach((t, i) => {
          context.fillText(t, xScale(highlightedNode.x), yScale(highlightedNode.y) - (2 * (i + 2)));
        });
      }
      let nodeCount = 1;
      if (!primaryNodes.length && !secondaryNodes.length) {
        tempData.nodes.forEach(function(d, i) {
          context.beginPath();
          context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
          context.fillStyle = !hoveredNode ||
            (hoveredNode.id === d.id || proximityNodes[hoveredNode.id].find(n => n.trg === d.id))
            ? d.color : polished.rgba(d.color, 0.125);
          context.fill();
        });


        if (hoveredNode) {
          const linkedNodes = [hoveredNode];
          proximityNodes[hoveredNode.id].forEach(function({trg}) {
            const targetNode = tempData.nodes.find(({id}) => id === trg);
            context.beginPath();
            context.moveTo(xScale(hoveredNode.x), yScale(hoveredNode.y));
            context.lineTo(xScale(targetNode.x), yScale(targetNode.y));
            context.strokeStyle = '#afafaf';
            context.stroke();
            linkedNodes.push(targetNode);
          });

          linkedNodes.forEach(function(d, i) {
            if (d) {
              context.beginPath();
              context.arc(xScale(d.x), yScale(d.y), d.radius, 0, 2 * Math.PI, true);
              context.fillStyle = d.color;
              context.fill();
              context.strokeStyle = '#afafaf';
              context.stroke();
            }
          });
        }
      } else {
        [...primaryNodes, ...secondaryNodes].forEach(function(d, i) {
          const node = tempData.nodes.find(n => n.id === d.id);
          context.beginPath();
          context.arc(xScale(node.x), yScale(node.y), node.radius, 0, 2 * Math.PI, true);
          context.fillStyle = node.color;
          context.fill();

          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.font = `400 ${node.radius}px OfficeCodeProWeb`;
          context.fillStyle = "white";
          context.fillText(String.fromCharCode(64 + nodeCount++), xScale(node.x), yScale(node.y));


          if (!hoveredNode || hoveredNode.id !== d.id) {
            context.fillStyle = "#000";
            context.font = `400 1.3px OfficeCodeProWeb`;
            const shortenedLabel = d.label.length <= 30 ? d.label : d.label.slice(0, 30) + '...'
            getLines(context, shortenedLabel, 15).reverse().forEach((t, i) => {
              context.fillText(t, xScale(node.x), yScale(node.y) - (2 * (i + 2)));
            });
          }
        });
      }

      if (hoveredNode && hoveredNode.id !== highlightedId) {
        rootEl.style.cursor = 'pointer';
        context.beginPath();
        context.arc(xScale(hoveredNode.x), yScale(hoveredNode.y), hoveredNode.radius, 0, 2 * Math.PI, true);
        context.strokeStyle = 'black';
        context.stroke();
      } else {
        rootEl.style.cursor = 'move';
      }

      context.restore();
    }

    const triggerSimulationUpdate = (node) => {
      if (node) {
        highlightedNode = node;
        primaryNodes = [];
        secondaryNodes = [];
        proximityNodes[node.id].forEach(({trg, proximity}, i) => {
          const node2 = tempData.nodes.find(n => n.id === trg);
          if (node2) {
            const numPrimary = Math.floor((proximityNodes[node.id].length - 1) / 2);
            const numSecondary = proximityNodes[node.id].length - numPrimary;
            if (i < numPrimary) {
              const newCoords = drawPoint(20, i, numPrimary, node.x, node.y)
              node2.new_x = newCoords.x;
              node2.new_y = newCoords.y;
              const xDist = newCoords.x > node2.x ? newCoords.x - node2.x : node2.x - newCoords.x;
              const yDist = newCoords.y > node2.y ? newCoords.y - node2.y : node2.y - newCoords.y;
              node2.x_interval = xDist / 20;
              node2.y_interval = yDist / 20;
              primaryNodes.push({
                ...node2,
                proximity,
              });
            } else {
              const newCoords = drawPoint(40, i, numSecondary, node.x, node.y)
              node2.new_x = newCoords.x;
              node2.new_y = newCoords.y;
              const xDist = newCoords.x > node2.x ? newCoords.x - node2.x : node2.x - newCoords.x;
              const yDist = newCoords.y > node2.y ? newCoords.y - node2.y : node2.y - newCoords.y;
              node2.x_interval = xDist / 20;
              node2.y_interval = yDist / 20;
              secondaryNodes.push({
                ...node2,
                proximity,
              });
            }
          }
        });
        const allEdgeXValues = [];
        const allEdgeYValues = [];
        [...primaryNodes, ...secondaryNodes].forEach(n => {
          allEdgeXValues.push(xScale(n.new_x));
          allEdgeYValues.push(yScale(n.new_y));
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

        const t = interval(function(elapsed) {
          shouldTick = false;
          [...primaryNodes, ...secondaryNodes].forEach(n => {
            const currentNode = tempData.nodes.find(d => d.id === n.id);
            if (Math.ceil(currentNode.x) === Math.ceil(currentNode.new_x)) {
              currentNode.x = currentNode.new_x;
            } else {
              shouldTick = true;
              currentNode.x = currentNode.x > currentNode.new_x
                ? currentNode.x - currentNode.x_interval
                : currentNode.x + currentNode.x_interval;
            }
            if (Math.ceil(currentNode.y) === Math.ceil(currentNode.new_y)) {
              currentNode.y = currentNode.new_y;
            } else {
              shouldTick = true;
              currentNode.y = currentNode.y > currentNode.new_y
                ? currentNode.y - currentNode.y_interval
                : currentNode.y + currentNode.y_interval;
            }
          });
          simulationUpdate();
          if (!shouldTick || elapsed > 350) {
            t.stop()
          };
        }, 10);
        setNodeList({
          selected: node,
          connected: [...primaryNodes, ...secondaryNodes],
        })
      } else {
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
        n.x = n.initial_x;
        n.y = n.initial_y;
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
      primaryNodes = [];
      secondaryNodes = [];
      setNodeList(undefined);
      simulationUpdate();
    }
    return {triggerSimulationUpdate, clearSelections};
  }
  setTimeout(() => {
    update.clearSelections();
  }, 0)

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
      <Table
        nodes={nodeList}
        hovered={hovered}
        updateSimulation={updateSimulation}
        proximityScale={proximityScale}
      />
    </div>
  );
}

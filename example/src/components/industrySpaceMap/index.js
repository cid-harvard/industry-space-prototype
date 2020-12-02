import React, {useRef, useEffect, useState} from 'react';
import {useWindowSize, usePrevious} from 'react-use';
import createChart, {
  outerRingRadius,
  innerRingRadius,
} from './chart';
import baseData from './data';
import styled from 'styled-components';

const Chart = styled.div`
  svg {

    /* Node hover and active styling */
    .industry-node,
    .industry-edge-node {
      &:hover,
      &.active {
        cursor: pointer;
        stroke: #333;
        stroke-width: 0.5;
      }
    }

    .industry-continents,
    .industry-countries {
      &:hover {
        cursor: pointer;
      }
    }

    /* Ring styling for when in ring mode */
    circle.outer-ring {
      fill: none;
      stroke: #bfbfbf;
      stroke-width: 0.5;
      r: ${outerRingRadius};
      opacity: 0;
    }

    circle.inner-ring {
      r: ${innerRingRadius};
      fill: none;
      stroke: #bfbfbf;
      stroke-width: 0.5;
      opacity: 0;
    }

    /* Remove pointer events from multiple layers */
    .industry-countries,
    circle.outer-ring,
    circle.inner-ring,
    .industry-cluster-hovered,
    .industry-node,
    .industry-node-hovered,
    .industry-nodes-label-group,
    .industry-continents-label,
    .industry-countries-label-group {
      pointer-events: none;
    }

    /* Label styling */
    .industry-continents-label,
    .industry-countries-label,
    .industry-nodes-label,
    .industry-ring-label {
      fill: #444;
      paint-order: stroke;
      text-anchor: middle;
      font-family: monospace;
    }

    .industry-continents-label {
      stroke: #efefef;
      stroke-width: 2.5px;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .industry-countries-label {
      stroke: #efefef;
      stroke-width: 1px;
      font-size: 8px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .industry-nodes-label {
      stroke: #fff;
      stroke-width: 0.1px;
      font-size: 0.7px;
    }

    .industry-ring-label {
      stroke: #fff;
      stroke-width: 0.6px;
      font-size: 1.5px;
    }
  }
`;

const IndustrySpaceMap = () => {
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);
  const dimensions = useWindowSize();
  const prevDimensions = usePrevious(dimensions);

  useEffect(() => {
    const node = chartRef.current;
    if (node && (chart === null ||
        (prevDimensions && (dimensions.width !== prevDimensions.width || dimensions.height !== prevDimensions.height))
    )) {
      node.innerHTML = '';
      setChart(createChart(node, baseData, dimensions.width, dimensions.height));
    }
  }, [chart, chartRef, dimensions, prevDimensions]);

  return (
    <Chart ref={chartRef} />
  );

}

export default IndustrySpaceMap;

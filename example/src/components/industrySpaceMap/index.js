import React, {useRef, useEffect, useState} from 'react';
import {useWindowSize, usePrevious} from 'react-use';
import createChart from './chart';
import baseData from './data';
import styled from 'styled-components';

const Root = styled.div`
  .industry-node,
  .industry-edge-node,
  .industry-continents,
  .industry-countries {
    &:hover,
    &.active {
      cursor: pointer;
      stroke: #333;
      stroke-width: 0.5px;
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
    <Root ref={chartRef} />
  );

}

export default IndustrySpaceMap;

import React, {useRef, useEffect, useState} from 'react';
import {useWindowSize, usePrevious} from 'react-use';
import createChart from './chart';
import baseData from './data';
import {
  Root,
  BackButton,
  ChartContainer,
} from './styling';

const IndustrySpaceMap = () => {
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);
  const backButtonRef = useRef(null);
  const dimensions = useWindowSize();
  const prevDimensions = usePrevious(dimensions);

  useEffect(() => {
    const chartNode = chartRef.current;
    const backButtonNode = backButtonRef.current;

    if (chartNode && backButtonNode && (chart === null ||
        (prevDimensions && (dimensions.width !== prevDimensions.width || dimensions.height !== prevDimensions.height))
    )) {
      chartNode.innerHTML = '';
      setChart(createChart(chartNode, baseData, dimensions.width, dimensions.height, backButtonNode));
    }
  }, [chart, chartRef, backButtonRef, dimensions, prevDimensions]);

  return (
    <Root>
      <BackButton ref={backButtonRef}>{'< Back to Industry Space'}</BackButton>
      <ChartContainer ref={chartRef} />
    </Root>
  );

}

export default IndustrySpaceMap;

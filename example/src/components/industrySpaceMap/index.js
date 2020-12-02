import React, {useRef, useEffect, useState} from 'react';
import {usePrevious} from 'react-use';
import createChart from './chart';
import baseData from './data';
import {
  Root,
  BackButton,
  ChartContainer,
} from './styling';
import {
  RapidTooltipRoot
} from './rapidTooltip';
import debounce from 'lodash/debounce'

const IndustrySpaceMap = () => {
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);
  const backButtonRef = useRef(null);
  const tooltipRef = useRef(null);
  // const dimensions = useWindowSize();
    const [dimensions, setWindowDimensions] = useState({
      width: window.innerWidth,
      height: window.innerHeight,
    });

  const prevDimensions = usePrevious(dimensions);

  useEffect(() => {
    const updateWindowDimensions = debounce(() => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 250);
    window.addEventListener('resize', updateWindowDimensions);
    return () => {
      window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

  useEffect(() => {
    const chartNode = chartRef.current;
    const backButtonNode = backButtonRef.current;
    const tooltipNode = tooltipRef.current;

    if (chartNode && backButtonNode && tooltipNode && (chart === null ||
        (prevDimensions && (dimensions.width !== prevDimensions.width || dimensions.height !== prevDimensions.height))
    )) {
      chartNode.innerHTML = '';
      setChart(createChart(chartNode, baseData, dimensions.width, dimensions.height, backButtonNode, tooltipNode));
    }
  }, [chart, chartRef, backButtonRef, tooltipRef, dimensions, prevDimensions]);

  return (
    <Root>
      <BackButton ref={backButtonRef}>{'< Back to Industry Space'}</BackButton>
      <ChartContainer ref={chartRef} />
      <RapidTooltipRoot ref={tooltipRef} />
    </Root>
  );

}

export default IndustrySpaceMap;

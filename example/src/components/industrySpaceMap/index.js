import React, {useRef, useEffect, useState} from 'react';
import {usePrevious} from 'react-use';
import createChart from './chart';
import baseData from './data';
import {
  Root,
  BackButton,
  ChartContainer,
  LegendContainer,
  LegendImage,
} from './styling';
import {
  RapidTooltipRoot
} from './rapidTooltip';
import debounce from 'lodash/debounce';
import {
  intensityLegendClassName,
  sectorLegendClassName,
} from './Utils';

const IndustrySpaceMap = () => {
  const [chart, setChart] = useState(null);
  const chartRef = useRef(null);
  const backButtonRef = useRef(null);
  const tooltipRef = useRef(null);
  const legendRef = useRef(null);
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
    const legendNode = legendRef.current;

    if (chartNode && backButtonNode && tooltipNode && legendNode && (chart === null ||
        (prevDimensions && (dimensions.width !== prevDimensions.width || dimensions.height !== prevDimensions.height))
    )) {
      chartNode.innerHTML = '';
      setChart(createChart(chartNode, baseData, dimensions.width, dimensions.height, backButtonNode, tooltipNode, legendNode));
    }
  }, [chart, chartRef, backButtonRef, tooltipRef, legendRef, dimensions, prevDimensions]);

  return (
    <Root>
      <BackButton ref={backButtonRef}>{'< Back to Industry Space'}</BackButton>
      <ChartContainer ref={chartRef} />
      <LegendContainer ref={legendRef}>
        <LegendImage
          className={intensityLegendClassName}
          src={require('../../intensity-legend.png')}
        />
        <LegendImage
          className={sectorLegendClassName}
          src={require('../../sector-legend.png')}
        />
      </LegendContainer>
      <RapidTooltipRoot ref={tooltipRef} />
    </Root>
  );

}

export default IndustrySpaceMap;

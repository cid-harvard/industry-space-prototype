import React from 'react'
import CanvasIndustrySpace from '../components/CanvasIndustrySpaceUMapClustersRingsEdgesOpacity';
import Legend from '../components/BasicLegend';

export default () => {
  return (
    <div>
      <CanvasIndustrySpace />
      <Legend tableLayout={true} />
    </div>
  );
}

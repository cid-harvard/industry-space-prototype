import {extent} from 'd3-array';

export const getAspectRation = (aspect, actual, buffer) => {
  const longerAspectSide = aspect.w > aspect.h ? 'width' : 'height';
  const smallerActualValue = (actual.w > actual.h ? actual.h : actual.w) - (buffer * 2);
  const ratio = longerAspectSide === 'width' ? aspect.h / aspect.w : aspect.w / aspect.h;
  const width = longerAspectSide === 'width' ? smallerActualValue : smallerActualValue * ratio;
  const height = longerAspectSide === 'height' ? smallerActualValue : smallerActualValue * ratio;
  const margin = {
    left: ((actual.w - width) / 2) + (buffer / 2), right: ((actual.w - width) / 2) + (buffer / 2),
    top: ((actual.h - height) / 2) + (buffer / 2), bottom: ((actual.h - height) / 2) + (buffer / 2),
  }
  return {
    width, height, margin,
    outerWidth: actual.w,
    outerHeight: actual.h,
  }
};

export function drawPoint(r, currentPoint, totalPoints, centerX, centerY) {  

  var theta = ((Math.PI*2) / totalPoints);
  var angle = (theta * currentPoint);

  const x = (r * Math.cos(angle) + centerX);
  const y = (r * Math.sin(angle) + centerY);

  return {x, y};
}

export const getBounds = (xValues, yValues, innerWidth, innerHeight, outerWidth, outerHeight, maxZoom) => {
  const xBounds = extent(xValues);
  const yBounds = extent(yValues);
  const bounds = [
    [xBounds[0], yBounds[0]],
    [xBounds[1], yBounds[1]],
  ];
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = Math.max(1, Math.min(maxZoom, 0.9 / Math.max(dx / innerWidth, dy / innerHeight)));
  const translate = [outerWidth / 2 - scale * x, outerHeight / 2 - scale * y];

  return {translate, scale};
}

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

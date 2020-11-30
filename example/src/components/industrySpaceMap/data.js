import raw from 'raw.macro';

const {nodes} = JSON.parse(raw('../../data/umap-clusters-custom-2.json'));
const naicsData = JSON.parse(raw('../../data/naics_2017.json'));
const proximityNodes = JSON.parse(raw('../../data/proximity-min-max.json'));
// const clusterMap = JSON.parse(raw('../../data/clusters-mapping-2.json'));

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

const data = {};

const allXValues = [];
const allYValues = [];
nodes.forEach(({x, y}) => {
  allXValues.push(x);
  allYValues.push(y);
});

// const radiusAdjuster = smallerSize / minExpectedScreenSize;

data.nodes = nodes.map(n => {
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

  const edges = proximityNodes[n.id] && proximityNodes[n.id].length ? proximityNodes[n.id] : [];

  return {
    ...n,
    radius,
    color,
    parent: current,
    label,
    edges,
    initial_x: n.x,
    initial_y: n.y,
  }
})

export default data;

import raw from 'raw.macro';
import hull from 'hull.js';
import ClusterNamesFull from '../../data/cluster-names.json';
const turf = require('turf');

const {nodes} = JSON.parse(raw('../../data/umap-clusters-custom-2.json'));
const naicsData = JSON.parse(raw('../../data/naics_2017.json'));
const proximityNodes = JSON.parse(raw('../../data/proximity-min-max.json'));
const clusterMap = JSON.parse(raw('../../data/clusters-mapping-2.json'));
// const gqlClusterData = JSON.parse(raw('../../data/gql-clusters-response-data.json'));

const customClusterShapes = JSON.parse(raw('../../data/custom_cluster_shapes.json'));

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

const clusterColorMap = {
  // '4': '#A973BE',
  // '5': '#F1866C',
  // '9': '#FFC135',
  // '10': '#93CFD0',
  // '12': '#488098',
  // '13': '#77C898',
  // '14': '#6A6AAD',
  '4': '#004c6d',
  '5': '#2d6484',
  '9': '#4c7c9b',
  '10': '#6996b3',
  '12': '#86b0cc',
  '13': '#a3cbe5',
  '14': '#c1e7ff',
}

data.clusters = {continents: [], countries: []};

clusterMap.forEach(({C1, C3, naics}) => {
  let indexC1 = data.clusters.continents.findIndex(c => c.id === C1);
  if (indexC1 === -1) {
    indexC1 = data.clusters.continents.length;
    data.clusters.continents[indexC1] = {id: C1, points: [], color: clusterColorMap[C1]};
  }
  let indexC3 = data.clusters.countries.findIndex(c => c.id === C3);
  if (indexC3 === -1) {
    indexC3 = data.clusters.countries.length;
    data.clusters.countries[indexC3] = {id: C3, points: [], color: clusterColorMap[C1]};
  }
  const industry = data.nodes.find(n => n.id === naics);
  if (industry) {
    data.clusters.continents[indexC1].points.push([industry.x, industry.y]);
    data.clusters.countries[indexC3].points.push([industry.x, industry.y]);
  }
})


data.clusters.continents = data.clusters.continents.map(d => {
  const custom = customClusterShapes.continents.find(c => c.id === d.id);
  const clusterNameFirst = ClusterNamesFull.C1.find(c => c.code === d.id);
  return {
    ...d,
    name: clusterNameFirst.name,
    convex: custom.points,
    custom: custom.points,
    center: custom.center,
  }
})

data.clusters.countries = data.clusters.countries.map(d => {
  const custom = customClusterShapes.countries.find(c => c.id === d.id);
  const center = turf.center(turf.featureCollection(d.points.map(point => turf.point(point))));
  const clusterNameFirst = ClusterNamesFull.C3.find(c => c.code === d.id);
  return {
    ...d,
    name: clusterNameFirst.name,
    convex: hull(d.points, 200),
    custom: custom.points,
    center: center.geometry.coordinates,
  }
})

// const countries = data.clusters.countries.map(d => {
//   const cluster = clusterMap.find(c => c.C3 === d.id);
//   const gqlCluster1 = gqlClusterData.data.classificationNaicsClusterList.find(c => c.level === 1 && c.name === cluster.C1.toString())
//   const gqlCluster3 = gqlClusterData.data.classificationNaicsClusterList.find(c => c.level === 3 && c.name === d.id.toString())
//   return {
//     center: d.center,
//     polygon: d.custom,
//     name: d.name,
//     color: '#cfcfcf',
//     continent: gqlCluster1.clusterId,
//     clusterId: gqlCluster3.clusterId,
//     clusterCode: d.id,
//   }
// })

// const nodesCompiled = data.nodes.map(d => {
//   const industry6Digit = naicsData.find(({code}) => d.id.toString() === code);
//   const cluster = clusterMap.find(c => c.naics === d.id);
//   const gqlCluster1 = gqlClusterData.data.classificationNaicsClusterList.find(c => c.level === 1 && c.name === cluster.C1.toString())
//   const gqlCluster3 = gqlClusterData.data.classificationNaicsClusterList.find(c => c.level === 3 && c.name === cluster.C3.toString())
//   return {
//     id: industry6Digit.naics_id.toString(),
//     x: d.x,
//     y: d.y,
//     edges: d.edges.map(({trg, proximity}) => {
//       const trgDigit = naicsData.find(({code}) => trg.toString() === code);
//       return {trg: trgDigit.naics_id.toString(), proximity}
//     }),
//     continent: gqlCluster1.clusterId,
//     country: gqlCluster3.clusterId,
//     name: d.label,
//     industryColor: d.color,
//   }
// })

// console.log(countries)
// console.log(nodesCompiled)

data.customViewbox = customClusterShapes.dimension;


export default data;

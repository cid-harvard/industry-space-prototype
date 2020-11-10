import React from 'react'

const App = () => {

  return (
    <ul>
      <li><a href={'#/original'}>Industry Space as <strong>Network</strong></a></li>
      <li><a href={'#/no-edges'}>Industry Space as <strong>Network w/o Edges</strong></a></li>
      <li><a href={'#/u-map'}>Industry Space as <strong>UMap</strong></a></li>
      <li><a href={'#/u-map-lines'}>Industry Space as <strong>UMap w/ Edges</strong></a></li>
      <li><a href={'#/u-map-edges-abs'}>Industry Space as <strong>UMap w/ Edges, Highlighted Based on <em>Value</em></strong></a></li>
      <li><a href={'#/u-map-edges-threshold'}>Industry Space as <strong>UMap w/ Edges, Highlighted based on <em>Threshold</em></strong></a></li>
      <li><a href={'#/u-map-edges-threshold-table'}>Industry Space as <strong>UMap w/ Edges, Highlighted based on <em>Threshold</em> w/ Table</strong></a></li>
      <li><a href={'#/network-table'}>Industry Space as <strong>Network w/ Table</strong></a></li>
      <li><a href={'#/network-no-edges-table'}>Industry Space as <strong>Network w/o edges and w/ Table</strong></a></li>
      <li>
        <a href={'#/u-map-edges-threshold-table-strength'}>Industry Space as <strong>UMap w/ Edges, Highlighted based on <em>Adjusted Threshold</em> w/ Updated Table</strong></a>
        <ul>
          <li>
            <a href={'#/u-map-edges-threshold-table-strength-no-sizing'}>No Node Sizing</a>
          </li>
        </ul>
      </li>
      <li>
        <a href={'#/u-map-clusters'}>Industry Space as <strong>UMap Clusters</strong></a>
        <ul>
          <li>
            <a href={'#/u-map-clusters-no-sizing'}>No Node Sizing</a>
          </li>
        </ul>
      </li>
      <li>
        <a href={'#/u-map-clusters-rings'}>Industry Space as <strong>UMap Clusters w/ Ring Chart</strong></a>
        <ul>
          <li><a href={'#/u-map-clusters-rings-lines'}>Show Edges as <em>Lines</em></a></li>
          <li><a href={'#/u-map-clusters-rings-opacity'}>Show Edges with <em>Opacity</em></a></li>
          <li><a href={'#/u-map-clusters-rings-opacity-lines'}>Show Edges with <em>Lines &amp; Opacity</em></a></li>
          <li><a href={'#/u-map-clusters-rings-opacity-lines-rca'}>Show Edges with <em>Lines &amp; Opacity</em> <strong>and random RCA highlighting</strong></a></li>
        </ul>
      </li>
      <li>
        <a href={'#/u-map-clusters-rings-cluster-color'}>Industry Space as <strong>UMap Clusters w/ Ring Chart</strong> and <strong>Colored by Cluster</strong></a>
      </li>
      <li>
        <a href={'#/u-map-clusters-rings-cluster-hull'}>Industry Space as <strong>UMap Clusters w/ Ring Chart</strong> and <strong>Cluster Shapes</strong></a>
      </li>
      <li>
        <a href={'#/u-map-clusters-rings-cluster-hull-lv2'}>Industry Space as <strong>UMap Clusters w/ Ring Chart</strong> and <strong>Cluster Shapes, Level 2 detail</strong></a>
      </li>
    </ul>
  );
}

export default App

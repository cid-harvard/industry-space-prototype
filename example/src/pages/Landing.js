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
    </ul>
  );
}

export default App

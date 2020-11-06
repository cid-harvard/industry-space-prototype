import React from 'react'

const TestLanding = () => {

  return (
    <ol>
      <li>
        Lines and opacity
        <ol>
          <li><a href={'#/u-map-clusters-rings-opacity-lines-rca'}>No node sizing</a></li>
          <li><a href={'#/u-map-clusters-rings-opacity-lines-rca-sizing'}>Random node sizing</a></li>
        </ol>
      </li>
      <li>
        No lines, no opacity
        <ol>
          <li><a href={'#/u-map-clusters-rings-rca'}>No node sizing</a></li>
          <li><a href={'#/u-map-clusters-rings-rca-sizing'}>Random node sizing</a></li>
        </ol>
      </li>
    </ol>
  );
}

export default TestLanding

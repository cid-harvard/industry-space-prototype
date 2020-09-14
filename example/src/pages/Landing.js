import React from 'react'
import {
  Link,
} from 'react-router-dom';

const App = () => {

  return (
    <ul>
      <li><Link to={'/original'}>Industry Space as <strong>Network</strong></Link></li>
      <li><Link to={'/no-edges'}>Industry Space as <strong>Network w/o Edges</strong></Link></li>
      <li><Link to={'/u-map'}>Industry Space as <strong>UMap</strong></Link></li>
      <li><Link to={'/u-map-lines'}>Industry Space as <strong>UMap w/ Edges</strong></Link></li>
    </ul>
  );
}

export default App

import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import IndustrySpaceNetwork from './pages/IndustrySpaceNetwork';
import IndustrySpaceNetworkNoLines from './pages/IndustrySpaceNetworkNoLines';
import IndustrySpaceUMap from './pages/IndustrySpaceUMap';
import IndustrySpaceUMapWithLines from './pages/IndustrySpaceUMapWithLines';
import IndustrySpaceUMapEdgesAbs from './pages/IndustrySpaceUMapEdgesAbs';
import IndustrySpaceUMapEdgesThreshold from './pages/IndustrySpaceUMapEdgesThreshold';
import Landing from './pages/Landing';

const App = () => {

  return (
    <div>
      <Router>
          <Switch>
            <Route exact path={'/original'} component={IndustrySpaceNetwork} />
            <Route exact path={'/no-edges'} component={IndustrySpaceNetworkNoLines} />
            <Route exact path={'/u-map'} component={IndustrySpaceUMap} />
            <Route exact path={'/u-map-lines'} component={IndustrySpaceUMapWithLines} />
            <Route exact path={'/u-map-edges-abs'} component={IndustrySpaceUMapEdgesAbs} />
            <Route exact path={'/u-map-edges-threshold'} component={IndustrySpaceUMapEdgesThreshold} />
            <Route component={Landing} />
          </Switch>
        </Router>
    </div>
  );
}

export default App

import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import IndustrySpaceNetwork from './pages/IndustrySpaceNetwork';
import IndustrySpaceNetworkNoLines from './pages/IndustrySpaceNetworkNoLines';

const App = () => {

  return (
    <div>
      <Router>
          <Switch>
              <Route exact path={'/'} component={IndustrySpaceNetwork} />
              <Route exact path={'/u-map'} component={IndustrySpaceNetworkNoLines} />
            <Route component={IndustrySpaceNetwork} />
          </Switch>
        </Router>
    </div>
  );
}

export default App

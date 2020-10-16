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
import IndustrySpaceUMapEdgesThresholdWithTable from './pages/IndustrySpaceUMapEdgesThresholdWithTable';
import IndustrySpaceNetworkWithTable from './pages/IndustrySpaceNetworkWithTable';
import IndustrySpaceNetworkNoEdgesWithTable from './pages/IndustrySpaceNetworkNoEdgesWithTable';
import IndustrySpaceUMapEdgesThresholdWithTableStrength from './pages/IndustrySpaceUMapEdgesThresholdWithTableStrength';
import IndustrySpaceUMapEdgesThresholdWithTableStrengthNoSizing from './pages/IndustrySpaceUMapEdgesThresholdWithTableStrengthNoSizing';
import IndustrySpaceClusters from './pages/IndustrySpaceClusters';
import IndustrySpaceClustersNoSizing from './pages/IndustrySpaceClustersNoSizing';
import ChemicalSpace from './pages/ChemicalSpace';
import ChemicalSpaceCustomHighlighting from './pages/ChemicalSpaceCustomHighlighting';
import ProductSpace from './pages/ProductSpace';
import ProductSpaceSaudi from './pages/ProductSpaceSaudi';
import ProductSpaceCustom from './pages/ProductSpaceCustomHighlighting';
import IndustrySpaceClustersRings from './pages/IndustrySpaceClustersRings';
import IndustrySpaceClustersRingsEdgesLines from './pages/IndustrySpaceClustersRingsEdgesLines';
import IndustrySpaceClustersRingsEdgesOpacity from './pages/IndustrySpaceClustersRingsEdgesOpacity';
import IndustrySpaceClustersRingsEdgesOpacityLines from './pages/IndustrySpaceClustersRingsEdgesOpacityLines';
import Landing from './pages/Landing';
import './fonts/fonts.css';

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
            <Route exact path={'/u-map-edges-threshold-table'} component={IndustrySpaceUMapEdgesThresholdWithTable} />
            <Route exact path={'/network-table'} component={IndustrySpaceNetworkWithTable} />
            <Route exact path={'/network-no-edges-table'} component={IndustrySpaceNetworkNoEdgesWithTable} />
            <Route exact path={'/u-map-edges-threshold-table-strength'} component={IndustrySpaceUMapEdgesThresholdWithTableStrength} />
            <Route exact path={'/u-map-clusters'} component={IndustrySpaceClusters} />
            <Route exact path={'/u-map-edges-threshold-table-strength-no-sizing'} component={IndustrySpaceUMapEdgesThresholdWithTableStrengthNoSizing} />
            <Route exact path={'/u-map-clusters-no-sizing'} component={IndustrySpaceClustersNoSizing} />
            <Route exact path={'/u-map-clusters-rings'} component={IndustrySpaceClustersRings} />
            <Route exact path={'/u-map-clusters-rings-lines'} component={IndustrySpaceClustersRingsEdgesLines} />
            <Route exact path={'/u-map-clusters-rings-opacity'} component={IndustrySpaceClustersRingsEdgesOpacity} />
            <Route exact path={'/u-map-clusters-rings-opacity-lines'} component={IndustrySpaceClustersRingsEdgesOpacityLines} />
            <Route exact path={'/product-space'} component={ProductSpace} />
            <Route exact path={'/product-space-saudi'} component={ProductSpaceSaudi} />
            <Route exact path={'/product-space-custom'} component={ProductSpaceCustom} />
            <Route exact path={'/chemical-space'} component={ChemicalSpace} />
            <Route exact path={'/chemical-space-custom'} component={ChemicalSpaceCustomHighlighting} />
            <Route component={Landing} />
          </Switch>
        </Router>
    </div>
  );
}

export default App

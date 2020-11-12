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
import IndustrySpaceClustersRingsEdgesOpacityLinesRCA from './pages/IndustrySpaceClustersRingsEdgesOpacityLinesRCA';
import IndustrySpaceClustersRingsEdgesOpacityLinesRCASizing from './pages/IndustrySpaceClustersRingsEdgesOpacityLinesRCASizing';
import IndustrySpaceClustersRingsClusterColoring from './pages/IndustrySpaceClustersRingsClusterColoring';
import IndustrySpaceClustersRingsRCA from './pages/IndustrySpaceClustersRingsRCA';
import IndustrySpaceClustersRingsRCASizing from './pages/IndustrySpaceClustersRingsRCASizing';
import IndustrySpaceClustersRingsClusterConvex from './pages/IndustrySpaceClustersRingsClusterConvex';
import IndustrySpaceClustersRingsClusterConvexLv2 from './pages/IndustrySpaceClustersRingsClusterConvexLv2';
import IndustrySpaceClustersRingsClusterConvexLv3 from './pages/IndustrySpaceClustersRingsClusterConvexLv3';
import IndustrySpaceClustersRingsClusterConvexLv1V2 from './pages/IndustrySpaceClustersRingsClusterConvexLv1V2';
import Landing from './pages/Landing';
import TestLanding from './pages/TestingLanding';
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
            <Route exact path={'/u-map-clusters-rings-opacity-lines-rca'} component={IndustrySpaceClustersRingsEdgesOpacityLinesRCA} />
            <Route exact path={'/product-space'} component={ProductSpace} />
            <Route exact path={'/product-space-saudi'} component={ProductSpaceSaudi} />
            <Route exact path={'/product-space-custom'} component={ProductSpaceCustom} />
            <Route exact path={'/chemical-space'} component={ChemicalSpace} />
            <Route exact path={'/chemical-space-custom'} component={ChemicalSpaceCustomHighlighting} />
            <Route exact path={'/u-map-clusters-rings-cluster-color'} component={IndustrySpaceClustersRingsClusterColoring} />
            <Route exact path={'/u-map-clusters-rings-cluster-hull'} component={IndustrySpaceClustersRingsClusterConvex} />
            <Route exact path={'/u-map-clusters-rings-cluster-hull-lv2'} component={IndustrySpaceClustersRingsClusterConvexLv2} />
            <Route exact path={'/u-map-clusters-rings-cluster-hull-lv3'} component={IndustrySpaceClustersRingsClusterConvexLv3} />
            <Route exact path={'/u-map-clusters-rings-cluster-hull-lv1-v2'} component={IndustrySpaceClustersRingsClusterConvexLv1V2} />

            <Route exact path={'/test'} component={TestLanding} />
            <Route exact path={'/u-map-clusters-rings-opacity-lines-rca-sizing'} component={IndustrySpaceClustersRingsEdgesOpacityLinesRCASizing} />
            <Route exact path={'/u-map-clusters-rings-rca'} component={IndustrySpaceClustersRingsRCA} />
            <Route exact path={'/u-map-clusters-rings-rca-sizing'} component={IndustrySpaceClustersRingsRCASizing} />


            <Route component={Landing} />
          </Switch>
        </Router>
    </div>
  );
}

export default App

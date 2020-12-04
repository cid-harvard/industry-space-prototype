import React from 'react'
import {
  HashRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import './fonts/fonts.css';
const IndustrySpaceNetwork = React.lazy(() => import('./pages/IndustrySpaceNetwork'));
const IndustrySpaceNetworkNoLines = React.lazy(() => import('./pages/IndustrySpaceNetworkNoLines'));
const IndustrySpaceUMap = React.lazy(() => import('./pages/IndustrySpaceUMap'));
const IndustrySpaceUMapWithLines = React.lazy(() => import('./pages/IndustrySpaceUMapWithLines'));
const IndustrySpaceUMapEdgesAbs = React.lazy(() => import('./pages/IndustrySpaceUMapEdgesAbs'));
const IndustrySpaceUMapEdgesThreshold = React.lazy(() => import('./pages/IndustrySpaceUMapEdgesThreshold'));
const IndustrySpaceUMapEdgesThresholdWithTable = React.lazy(() => import('./pages/IndustrySpaceUMapEdgesThresholdWithTable'));
const IndustrySpaceNetworkWithTable = React.lazy(() => import('./pages/IndustrySpaceNetworkWithTable'));
const IndustrySpaceNetworkNoEdgesWithTable = React.lazy(() => import('./pages/IndustrySpaceNetworkNoEdgesWithTable'));
const IndustrySpaceUMapEdgesThresholdWithTableStrength = React.lazy(() => import('./pages/IndustrySpaceUMapEdgesThresholdWithTableStrength'));
const IndustrySpaceUMapEdgesThresholdWithTableStrengthNoSizing = React.lazy(() => import('./pages/IndustrySpaceUMapEdgesThresholdWithTableStrengthNoSizing'));
const IndustrySpaceClusters = React.lazy(() => import('./pages/IndustrySpaceClusters'));
const IndustrySpaceClustersNoSizing = React.lazy(() => import('./pages/IndustrySpaceClustersNoSizing'));
const ChemicalSpace = React.lazy(() => import('./pages/ChemicalSpace'));
const ChemicalSpaceCustomHighlighting = React.lazy(() => import('./pages/ChemicalSpaceCustomHighlighting'));
const ProductSpace = React.lazy(() => import('./pages/ProductSpace'));
const ProductSpaceSaudi = React.lazy(() => import('./pages/ProductSpaceSaudi'));
const ProductSpaceCustom = React.lazy(() => import('./pages/ProductSpaceCustomHighlighting'));
const IndustrySpaceClustersRings = React.lazy(() => import('./pages/IndustrySpaceClustersRings'));
const IndustrySpaceClustersRingsEdgesLines = React.lazy(() => import('./pages/IndustrySpaceClustersRingsEdgesLines'));
const IndustrySpaceClustersRingsEdgesOpacity = React.lazy(() => import('./pages/IndustrySpaceClustersRingsEdgesOpacity'));
const IndustrySpaceClustersRingsEdgesOpacityLines = React.lazy(() => import('./pages/IndustrySpaceClustersRingsEdgesOpacityLines'));
const IndustrySpaceClustersRingsEdgesOpacityLinesRCA = React.lazy(() => import('./pages/IndustrySpaceClustersRingsEdgesOpacityLinesRCA'));
const IndustrySpaceClustersRingsEdgesOpacityLinesRCASizing = React.lazy(() => import('./pages/IndustrySpaceClustersRingsEdgesOpacityLinesRCASizing'));
const IndustrySpaceClustersRingsClusterColoring = React.lazy(() => import('./pages/IndustrySpaceClustersRingsClusterColoring'));
const IndustrySpaceClustersRingsRCA = React.lazy(() => import('./pages/IndustrySpaceClustersRingsRCA'));
const IndustrySpaceClustersRingsRCASizing = React.lazy(() => import('./pages/IndustrySpaceClustersRingsRCASizing'));
const IndustrySpaceClustersRingsClusterConvex = React.lazy(() => import('./pages/IndustrySpaceClustersRingsClusterConvex'));
const IndustrySpaceClustersRingsClusterConvexLv2 = React.lazy(() => import('./pages/IndustrySpaceClustersRingsClusterConvexLv2'));
const IndustrySpaceClustersRingsClusterConvexLv3 = React.lazy(() => import('./pages/IndustrySpaceClustersRingsClusterConvexLv3'));
const IndustrySpaceClustersRingsClusterConvexLv1V2 = React.lazy(() => import('./pages/IndustrySpaceClustersRingsClusterConvexLv1V2'));
const Landing = React.lazy(() => import('./pages/Landing'));
const TestLanding = React.lazy(() => import('./pages/TestingLanding'));
const IndustrySpaceMap = React.lazy(() => import('./pages/IndustrySpaceMap'));

const App = () => {

  return (
    <div>
      <Router>
          <React.Suspense fallback={<div>Loading...</div>}>
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
                <Route exact path={'/industry-space-map'} component={IndustrySpaceMap} />
                <Route component={Landing} />
              </Switch>
          </React.Suspense>
        </Router>
    </div>
  );
}

export default App

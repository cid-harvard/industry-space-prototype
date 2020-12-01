const fs = require('fs');
const { parse } = require('svgson');
const turf = require('turf');

const clusterMapping = JSON.parse(fs.readFileSync('./src/data/cluster_node_convex_mapping.json'));
const customClusterShapes = `
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1361 1016">
<g id="countries">
  <polygon class="countries" points="348.6,497.3 309.5,497.7 269.4,488.8 206.4,454.2 156.4,539.2 158.5,549.3 184.5,574.6 198.8,581.5 320.6,609.2 351.3,558 389.4,522.1     "/>
  <polygon class="countries" points="466,669.3 320.6,609.2 352.1,701.8 434.9,798.3 544.4,695.9 499.8,695.9     "/>
  <polygon class="countries" points="677.4,660.6 611.4,655.1 582.6,657.9 563.5,695.9 544.4,695.9 434.9,798.3 468.5,837.5 575.4,831.9 654.3,868.9 671.7,862.8 728.3,815.6 759.6,733.7 760.1,710.8     "/>
  <polygon class="countries" points="556.9,832.8 542.5,833.6 468.5,837.5 494.4,867.7 502.1,883.2 526,895.9 538.7,898.5 564.9,894.8     
    "/>
  <polygon class="countries" points="410.1,503.2 351.3,558 320.6,609.2 385.8,636.2 441.1,659 461.6,632.8 500.5,583.3     "/>
  <polygon class="countries" points="834.4,429.1 792.4,439.8 752.5,460.9 782.7,503.8 780.4,543.3 798.8,551.3 814.4,532.9 880.8,517.8 901,451.8     "/>
  <polygon class="countries" points="736.3,596.4 721.1,592.4 709.8,680.3 760.1,710.8 805.2,640.6 818.9,623.2     "/>
  <polygon class="countries" points="814.4,532.9 798.8,551.3 780.4,543.3 782.7,503.8 752.5,460.9 681.3,498.5 637.4,497.2 595.6,520.8 674.7,568.5 685.6,583.3 736.3,596.4 818.9,623.2 867.1,562.5 880.8,517.8     "/>
  <polygon class="countries" points="862.2,236.7 833.4,244.9 833.9,292.1 862.6,316.3 900.6,256.1     "/>
  <polygon class="countries" points="989.8,643.1 942.2,626.8 867.1,562.5 805.2,640.6 760.1,710.8 759.6,733.7 728.3,815.6 744.1,860.7 788.5,875.6 823.2,878.9 852.7,843.3 862.6,814.5 886.1,813.8 916.1,826.9 919.9,837.6 967.9,783 980.6,755.8 995.5,704.1     "/>
  <polygon class="countries" points="749.9,303.1 748.4,283.9 702.4,247.9 637.5,241.5 551.7,280 535,325.2 574.4,345 589.9,354.9 612.2,396.3 643.4,355.9 648.3,342 693.7,335.5 713.9,337.6 722.5,349.4 749.4,341.5     "/>
  <polygon class="countries" points="582.6,657.9 566.3,605.8 572,589.1 536.6,589.8 500.5,583.3 441.1,659 466,669.3 499.8,695.9 563.5,695.9     "/>
  <polygon class="countries" points="595.6,520.8 566.3,605.8 582.6,657.9 611.4,655.1 685.6,583.3 674.7,568.5     "/>
  <polygon class="countries" points="589.9,354.9 574.4,345 535,325.2 511.9,387.6 516.3,408.8 558.8,420.9 568.4,423.6 593.5,436.6 612.2,396.3     "/>
  <polygon class="countries" points="455,387.2 284.9,383.6 243.9,390.4 206.4,454.2 269.4,488.8 309.5,497.7 348.6,497.3 389.4,522.1 474.1,442.6     "/>
  <polygon class="countries" points="575.4,831.9 557.2,832.8 564.9,894.8 590.5,891.3 621.2,880.5 654.3,868.9     "/>
  <polygon class="countries" points="964.7,473.1 901,451.8 880.8,517.8 945.7,552.4 981.5,554.4 979.8,536.3     "/>
  <polygon class="countries" points="721.1,592.4 685.6,583.3 611.4,655.1 677.4,660.6 709.8,680.3     "/>
  <polygon class="countries" points="916.1,826.9 886.1,813.8 862.6,814.5 852.7,843.3 823.2,878.9 854.8,881.9 886.5,875.6 919.9,837.6 "/>
  <polygon class="countries" points="981.5,554.4 945.7,552.4 880.8,517.8 867.1,562.5 942.2,626.8 989.8,643.1     "/>
  <polygon class="countries" points="955.3,304.2 943.4,340.2 854.5,384.2 851.5,434.9 901,451.8 964.7,473.1 974,389.6     "/>
  <polygon class="countries" points="593.5,436.6 568.4,423.6 558.8,420.9 556.5,448.7 527,449.8 493.6,451 474.1,442.6 410.1,503.2 500.5,583.3 536.6,589.8 572,589.1 595.6,520.8 582.2,492.8     "/>
  <polygon class="countries" points="774.7,358 781.7,337.1 749.4,341.5 722.5,349.4 713.9,337.6 693.7,335.5 648.3,342 643.4,355.9 612.2,396.3 593.5,436.6 659.7,444.4 707.6,460.6 722.6,476.7 774.3,449.3 779.9,415.7     "/>
  <polygon class="countries" points="593.5,436.6 582.2,492.8 595.6,520.8 619.9,507.1 659.7,444.4 620.8,439.8     "/>
  <polygon class="countries" points="558.8,420.9 516.3,408.8 504.7,413.9 474.1,442.6 493.6,451 556.5,448.7     "/>
  <polygon class="countries" points="455,387.2 474.1,442.6 504.7,413.9 516.3,408.8 511.9,387.6     "/>
  <polygon class="countries" points="944.3,278.2 924.5,268.2 900.6,256.1 862.6,316.3 833.9,292.1 783.4,293.5 779.9,282 762.1,278.7 748.4,283.9 749.9,303.1 749.4,341.5 781.7,337.1 774.7,358 776.4,377.3 836,382.5 854.5,384.2 943.4,340.2 955.3,304.2     "/>
  <polygon class="countries" points="761.6,155.2 751.9,153.4 731.8,158.6 708.9,174.6 684,213.9 702.4,247.9 722.3,263.6 751.2,213.9 785.7,166.1     "/>
  <polygon class="countries" points="832.1,198.3 802.6,174.3 785.7,166.1 751.2,213.9 722.3,263.6 748.4,283.9 762.1,278.7 792.2,256.5 862.2,236.7     "/>
  <polygon class="countries" points="776.4,377.3 779.9,415.7 774.3,449.3 792.4,439.8 834.4,429.1 851.5,434.9 854.5,384.2     "/>
  <polygon class="countries" points="762.1,278.7 779.9,282 783.4,293.5 833.9,292.1 833.4,244.9 792.2,256.5     "/>
  <polygon class="countries" points="707.6,460.6 659.7,444.4 619.9,507.1 637.4,497.2 681.3,498.5 722.6,476.7     "/>
</g>
<g id="continents">
  <polygon class="continents" points="516.3,408.8 511.9,387.6 379.7,386.6 284.9,383.6 264.2,386.6 243.9,390.4 156.4,539.2 158.5,549.3 184.5,574.6 198.8,581.5 320.6,609.2 351.3,558 504.7,413.9     "/>
  <polygon class="continents" points="677.4,660.6 611.4,655.1 582.6,657.9 563.5,695.9 499.8,695.9 466,669.3 405.4,644.3 320.6,609.2 352.1,701.8 494.4,867.7 502.1,883.2 526,895.9 538.7,898.5 590.5,891.3 671.7,862.8 728.3,815.6 759.6,733.7 760.1,710.8     "/>
  <polygon class="continents" points="582.2,492.8 593.5,436.6 568.4,423.6 516.3,408.8 504.7,413.9 351.3,558 320.6,609.2 466,669.3 499.8,695.9 563.5,695.9 582.6,657.9 566.3,605.8 595.6,520.8     "/>
  <polygon class="continents" points="834.4,429.1 792.4,439.8 681.3,498.5 637.4,497.2 595.6,520.8 566.3,605.8 582.6,657.9 611.4,655.1 677.4,660.6 760.1,710.8 805.2,640.6 867.1,562.5 901,451.8     "/>
  <polygon class="continents" points="955.3,304.2 944.3,278.2 862.2,236.7 792.2,256.5 761.4,279.3 748.4,283.9 702.4,247.9 637.5,241.5 551.7,280 511.9,387.6 516.3,408.8 536.3,414.5 568.4,423.6 593.5,436.6 582.2,492.8 595.6,520.8 637.4,497.2 681.3,498.5 792.4,439.8 834.4,429.1 943.4,466.2 964.7,473.1 974,389.6     "/>
  <polygon class="continents" points="979.8,536.3 964.7,473.1 901,451.8 867.1,562.5 805.2,640.6 760.1,710.8 759.6,733.7 728.3,815.6 744.1,860.7 788.5,875.6 854.8,881.9 886.5,875.6 967.7,783.2 980.6,755.8 995.5,704.1     "/>
  <polygon class="continents" points="833.4,199.5 802.6,174.3 772.6,159.7 761.6,155.2 751.9,153.4 731.8,158.6 708.9,174.6 684,213.9 702.4,247.9 748.4,283.9 761.4,279.3 792.2,256.5 862.2,236.7     "/>
</g>
</svg>
`;

parse(customClusterShapes).then(json => {
  const countries = json.children[0].children.map(({attributes}, i) => {
    const points = attributes.points.trim().split(' ').map(point => point.split(',').map(coord => parseFloat(coord)));
    const geojsonPoints = points.map(p => turf.point(p));
    const geojsonFeatureCollection = turf.featureCollection([...geojsonPoints]);
    const center = turf.centerOfMass(geojsonFeatureCollection);
    return {...clusterMapping.countries[i], points, center: center.geometry.coordinates}
  });
  const continents = json.children[1].children.map(({attributes}, i) => {
    const points = attributes.points.trim().split(' ').map(point => point.split(',').map(coord => parseFloat(coord)));
    const geojsonPoints = points.map(p => turf.point(p));
    const geojsonFeatureCollection = turf.featureCollection([...geojsonPoints]);
    const center = turf.centerOfMass(geojsonFeatureCollection);
    return {...clusterMapping.continents[i], points, center: center.geometry.coordinates}
  });
  const viewBox = json.attributes.viewBox.trim().split(' ');
  const dimension = {
    left: parseInt(viewBox[0], 10),
    top: parseInt(viewBox[1], 10),
    width: parseInt(viewBox[2], 10),
    height: parseInt(viewBox[3], 10),
  }
  fs.writeFileSync('./src/data/custom_cluster_shapes.json', JSON.stringify({dimension, continents, countries}, null, 2))
});


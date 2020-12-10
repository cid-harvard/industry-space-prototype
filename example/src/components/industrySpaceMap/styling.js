import styled from 'styled-components';
import {
  outerRingRadius,
  innerRingRadius,
} from './chart';
import {
  sectorLegendClassName,
} from './Utils';

const fontFamily = "monospace";

export const Root = styled.div`
  position: relative;
  font-family: ${fontFamily};
`;

export const BackButton = styled.button`
  position: absolute;
  left: 0;
  top: 0;
  background-color: transparent;
  border: none;
  font-size: 1rem;
  font-family: ${fontFamily};
  cursor: pointer;
  padding: 1rem;
  display: none;
`;

export const ChartContainer = styled.div`
  svg {

    /* Node hover and active styling */
    .industry-node,
    .industry-edge-node {
      content-visibility: auto;

      &:hover,
      &.active {
        cursor: pointer;
        stroke: #333;
        stroke-width: 0.5;
      }
    }

    .industry-continents,
    .industry-countries {
      &:hover {
        cursor: pointer;
      }
    }

    /* Ring styling for when in ring mode */
    circle.outer-ring {
      fill: none;
      stroke: #bfbfbf;
      stroke-width: 0.5;
      r: ${outerRingRadius}px;
      opacity: 0;
    }

    circle.inner-ring {
      r: ${innerRingRadius}px;
      fill: none;
      stroke: #bfbfbf;
      stroke-width: 0.5;
      opacity: 0;
    }

    /* Remove pointer events from multiple layers */
    .industry-countries,
    circle.outer-ring,
    circle.inner-ring,
    .industry-cluster-hovered,
    .industry-node,
    .industry-node-hovered,
    .industry-nodes-label-group,
    .industry-continents-label,
    .industry-countries-label-group {
      pointer-events: none;
      will-change: transform, fill, opacity;
    }

    /* Label styling */
    .industry-continents-label,
    .industry-countries-label,
    .industry-nodes-label,
    .industry-ring-label {
      fill: #444;
      paint-order: stroke;
      text-anchor: middle;
      font-family: ${fontFamily};
      will-change: transform, fill, opacity;
    }

    .industry-continents-label {
      stroke: #efefef;
      stroke-width: 2.5px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .industry-countries-label {
      stroke: #efefef;
      stroke-width: 1px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .industry-nodes-label {
      stroke: #fff;
      stroke-width: 0.1px;
    }

    .industry-ring-label {
      stroke: #fff;
      stroke-width: 0.6px;
    }
  }
`;

export const LegendContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing:  border-box;
  padding-left: 2rem;
  padding-bottom: 2rem;

  .${sectorLegendClassName} {
    display: none;
  }
`;

export const LegendImage = styled.img`
  width: 100%;
  max-width: 800px;
`;

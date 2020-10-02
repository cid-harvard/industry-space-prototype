import React from 'react';
import styled from 'styled-components/macro';

const Root = styled.div`
  position: fixed;
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
`;

const Legend = styled.img`
  width: 100%;
  max-width: 800px;
`;

export default ({tableLayout}) => {
  return (
    <Root
      style={{paddingRight: tableLayout ? 550 : undefined}}
    >
      <Legend src={require('../sector-legend.png')} />
    </Root>
  );
}

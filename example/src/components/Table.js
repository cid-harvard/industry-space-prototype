import React from 'react';
import styled from 'styled-components';
import {rgba} from 'polished';

const Root = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: 450px;
  padding: 1rem;
  font-family: 'OfficeCodeProWeb', monospace;
`;

const Content = styled.div`
  padding: 1rem;
  box-sizing: border-box;
  box-shadow: 1px 2px 5px 0px rgba(0,0,0,0.45);
  display: grid;
  grid-template-rows: auto 1fr;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.55);
`;

const NodeList = styled.div`
  margin-top: 1rem;
  overflow: auto;
  position: relative;
`;

const NodeListItem = styled.div`
  display: grid;
  grid-template-columns: 180px 1fr 1fr;
  font-size: 0.8rem;

  &:hover {
    ${({$color}) => $color ? 'background-color:' + rgba($color, 0.4) + ';' : ''}
  }
`;

const TableTitle = styled(NodeListItem)`
  border-bottom: solid 1px black;
  position: sticky;
  top: 0;
  background-color: #fff;
`;

const Cell = styled.div`
  padding: 0.5rem;
  display: flex;
  align-items: center;
`;

const SectorCell = styled(Cell)`
  border-left: solid 1px #000;
`;
const ProximityCell = styled(Cell)`
  justify-content: flex-end;
`;

const Title = styled.h1`
  font-size: 1rem;
  font-weight: 400;
  margin: 0;
  display: flex;
  align-items: center;
`;

const Circle = styled.div`
  border: solid 3px black;
  border-radius: 400px;
  width: 0.75rem;
  height: 0.7rem;
  margin-right: 0.5rem;
  flex-shrink: 0;
`;

const Label = styled.span`
  text-transform: uppercase;
`;

const Table = (props) => {
  const {nodes, hovered} = props;
  console.log(nodes);
  console.log(hovered);
  if (nodes) {
    const {selected, connected} = nodes;
    const title = selected.label.replace(selected.id, '');
    const connectedNodes = connected.map(({id, label, proximity, color, parent}) => {
      console.log(parent.name)
      const highlight = hovered && hovered.id === id;
      return (
        <NodeListItem
          $color={color}
          style={{backgroundColor: highlight ? rgba(color, 0.4) : undefined}}
        >
          <Cell>{label.replace(id, '')}</Cell>
          <SectorCell>{parent.name}</SectorCell>
          <ProximityCell>{proximity}</ProximityCell>
        </NodeListItem>
      );
    })
    return (
      <Root>
        <Content>
        <Title>
            <Circle style={{backgroundColor: selected.color}} />
            <div><Label>Selected industry:</Label> {title}</div>
          </Title>
          <NodeList>
            <TableTitle>
              <Cell>Industry Name</Cell>
              <SectorCell style={{border: 'none'}}>Sector</SectorCell>
              <ProximityCell>Proximity</ProximityCell>
            </TableTitle>
            {connectedNodes}
          </NodeList>
        </Content>
      </Root>
    );
  } else {
    return null;
  }
}

export default Table;

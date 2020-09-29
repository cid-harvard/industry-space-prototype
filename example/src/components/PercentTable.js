import React, {useRef, useEffect} from 'react';
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

const BackButton = styled.button`
  position: fixed;
  left: 0;
  top: 0;
  background-color: transparent;
  border: none;
  font-size: 1rem;
  font-family: 'OfficeCodeProWeb', monospace;
  cursor: pointer;
  padding: 1rem;
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
    cursor: pointer;
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
const Rank = styled.strong`
  margin-right: 0.7rem;
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

const Empty = styled(Title)`
  height: 100%;
  width: 100%;
  background-color: rgba(0,0,0,0.04);
  text-align: center;
  grid-row: 1 / -1;
  justify-content: center;
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
  const {nodes, hovered, updateSimulation, proximityScale} = props;
  const highlightedRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (highlightedRef && highlightedRef.current && containerRef && containerRef.current && hovered !== undefined) {
      const highlightedNode = highlightedRef.current;
      const containerNode = containerRef.current;
      containerNode.scrollTop = highlightedNode.offsetTop - highlightedNode.offsetHeight;
    }
  }, [highlightedRef, containerRef, hovered])

  if (nodes) {
    const {selected, connected} = nodes;
    const title = selected.label.replace(selected.id, '');
    const connectedNodes = connected.map((node, i) => {
      const {id, label, color, parent, proximity} = node;
      const highlight = hovered && hovered.node && hovered.node.id === id;
      const onClick = () => updateSimulation ? updateSimulation.triggerSimulationUpdate(node) : null;
      const strength = parseFloat(proximityScale(proximity).toFixed(2));
      return (
        <NodeListItem
          $color={color}
          style={{backgroundColor: highlight ? rgba(color, 0.4) : undefined}}
          ref={highlight ? highlightedRef : undefined}
          onClick={onClick}
          key={id}
        >
          <Cell
            style={{borderLeft: `5px solid ${color}`}}
          >
            <Rank>{String.fromCharCode(64 + (i + 1))}</Rank>
            <div>{label.replace(id, '')}</div>
          </Cell>
          <SectorCell>{parent.name}</SectorCell>
          <ProximityCell>{strength}%</ProximityCell>
        </NodeListItem>
      );
    })
    const onClear = () => updateSimulation ? updateSimulation.clearSelections() : null;
    return (
      <Root>
        <BackButton onClick={onClear}>{'< Back to Industry Space'}</BackButton>
        <Content>
        <Title>
            <Circle style={{backgroundColor: selected.color}} />
            <div><Label>Selected industry:</Label> {title}</div>
          </Title>
          <NodeList ref={containerRef}>
            <TableTitle>
              <Cell>Industry Name</Cell>
              <SectorCell style={{border: 'none'}}>Sector</SectorCell>
              <ProximityCell>Relatedness</ProximityCell>
            </TableTitle>
            {connectedNodes}
          </NodeList>
        </Content>
      </Root>
    );
  } else {
    return (
      <Root>
        <Content>
          <Empty>Click a node for more details</Empty>
        </Content>
      </Root>
    );
  }
}

export default Table;

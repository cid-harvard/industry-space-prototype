import React, {useRef, useEffect, useState} from 'react';
import styled from 'styled-components';
import {rgba} from 'polished';
import PNGLegend1 from '../IS-Legends-01.png';
import PNGLegend2 from '../IS-Legends-02.png';
import HowToReadPNG from '../IS_how-to-read-04.png';

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

const HowToReadButton = styled.button`
  position: fixed;
  left: 1rem;
  top: 4rem;
  background-color: transparent;
  border: solid 1px #333;
  font-size: 1rem;
  font-family: 'OfficeCodeProWeb', monospace;
  cursor: pointer;
  padding: 0.5rem;
`;

const Content = styled.div`
  padding: 1rem;
  box-sizing: border-box;
  box-shadow: 1px 2px 5px 0px rgba(0,0,0,0.45);
  display: grid;
  grid-template-rows: auto 1fr auto;
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

const EmptyImage = styled.div`
  width: 100%;
  height: 100%;
  grid-row: 3;
  grid-column: 1 / -1;
  justify-content: center;
  align-items: center;
  display: flex;
  margin: 2rem 0;

  img {
    max-width: 100%;
    margin: auto;
  }
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
  box-sizing: border-box;
`;

const ModalBackdrop = styled.button`
  position: absolute;
  width: 100%;
  height: 100%;
  border: none;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 1rem;
  position: relative;
  background-color: #fff;

  img {
    max-width: 100%;
  }
`;


const CloseButton = styled.button`
  border: none;
  padding: 0.8rem;
  background-color: transparent;
  color: #999;
  position: absolute;
  top: 0;
  right: 0;
  cursor: pointer;
  font-size: 1.2rem
`;

const Table = (props) => {
  const {nodes, hovered, updateSimulation, proximityScale, showToggle} = props;
  const highlightedRef = useRef(null);
  const containerRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);

  const modal = modalOpen ? (
    <ModalContainer>
      <ModalBackdrop onClick={() => setModalOpen(false)} />
      <ModalContent>
        <img src={HowToReadPNG} alt={''} />
        <CloseButton onClick={() => setModalOpen(false)}>
          ×
        </CloseButton>
      </ModalContent>
    </ModalContainer>
  ) : null;

  useEffect(() => {
    if (highlightedRef && highlightedRef.current && containerRef && containerRef.current && hovered !== undefined) {
      const highlightedNode = highlightedRef.current;
      const containerNode = containerRef.current;
      containerNode.scrollTop = highlightedNode.offsetTop - highlightedNode.offsetHeight;
    }
  }, [highlightedRef, containerRef, hovered])

  const imgSrc = showToggle ? PNGLegend2 : PNGLegend1;
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
        <HowToReadButton onClick={() => setModalOpen(true)}>How to Read</HowToReadButton>
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
          <EmptyImage><img src={imgSrc} alt={''} /></EmptyImage>
        </Content>
        {modal}
      </Root>
    );
  } else {
    return (
      <Root>
        <HowToReadButton onClick={() => setModalOpen(true)}>How to Read</HowToReadButton>
        <Content>
          <Empty>
            <EmptyImage><img src={imgSrc} alt={''} /></EmptyImage>
          </Empty>
        </Content>
        {modal}
      </Root>
    );
  }
}

export default Table;

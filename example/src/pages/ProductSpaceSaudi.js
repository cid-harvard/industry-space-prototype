import React, {useState} from 'react'
import ProductSpace from '../components/ProductSpaceHighlighted';
import styled from 'styled-components';

const Select = styled.select`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
`;

export default () => {
  const [keyName, setKeyName] = useState('all');

  return (
    <div>
      <Select value={keyName} onChange={(e) => setKeyName(e.target.value)}>
        <option value='all'>All Nodes</option>
        <option value='atlas'>Atlas</option>
        <option value='adjacent'>Adjacent</option>
        <option value='strategic'>Strategic</option>
        <option value='overlapping_strategy'>Overlapping Strategy</option>
        <option value='combined'>Combined</option>
      </Select>
      <ProductSpace key={keyName} keyName={keyName === 'all' ? undefined : keyName} />
    </div>
  );
}

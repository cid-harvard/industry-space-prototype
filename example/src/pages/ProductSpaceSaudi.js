import React, {useState} from 'react'
import ProductSpace from '../components/ProductSpaceHighlighted';
import styled from 'styled-components';
import DownloadSVGURL from './download.svg';

const UtilityBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  margin: 1rem;
`;

const Select = styled.select`
  margin-right: 1rem;
  padding: 0.4rem;
  font-family: OfficeCodeProWeb, monospace;
  font-size: 1.1rem;
  cursor: pointer;
  border: solid 1px #6f6f6f;
  border-radius: 0;
  font-size: 0.75rem;
`;

const DownloadButton = styled.button`
  padding: 0.4rem;
  font-family: OfficeCodeProWeb, monospace;
  font-size: 1.1rem;
  cursor: pointer;
  border: solid 1px #6f6f6f;
  border-radius: 0;
  font-size: 0.75rem;
`;

const SvgIcon = styled.img`
  width: 0.9rem;
  margin-right: 0.3rem;
`;

const downloadImage = (keyName) => {
  var link = document.createElement('a');
  link.download = `Product-Space-${keyName}.png`;
  link.href = document.querySelector('canvas').toDataURL()
  link.click();
  link.remove();
};

export default () => {
  const [keyName, setKeyName] = useState('all');

  return (
    <div>
      <UtilityBar>
        <Select value={keyName} onChange={(e) => setKeyName(e.target.value)}>
          <option value='all'>All Nodes</option>
          <option value='atlas'>Atlas</option>
          <option value='adjacent'>Adjacent</option>
          <option value='strategic'>Strategic</option>
          <option value='overlapping_strategy'>Overlapping Strategy</option>
          <option value='combined'>Combined</option>
        </Select>
        <DownloadButton onClick={() => downloadImage(keyName)}>
          <SvgIcon src={DownloadSVGURL} alt={'Download PNG'} />
          Download Image
        </DownloadButton>
      </UtilityBar>
      <ProductSpace key={keyName} keyName={keyName === 'all' ? undefined : keyName} />
    </div>
  );
}

import React, {useState} from 'react'
import IndustrySpace from '../components/CanvasIndustrySpaceUMapCustomHighlighted';
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

const Modal = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 2000;
  display: flex;
  font-family: OfficeCodeProWeb, monospace;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  padding: 1rem 2rem;
  border: solid 1px #6f6f6f;
  border-radius: 8px;
  background-color: #fff;
  width: 400px;
  font-size: 0.85rem;
  position: relative;
  box-sizing: border-box;
`;

const Backdrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
`;

const CloseButton = styled.button`
  padding: 0.4rem;
  font-family: OfficeCodeProWeb, monospace;
  font-size: 1.1rem;
  cursor: pointer;
  border: none;
  background-color: transparent;
  border-radius: 0;
  position: absolute;
  top: 0;
  right: 0;
`;

const Textarea = styled.textarea`
  padding: 1rem;
  border: solid 1px #6f6f6f;
  border-radius: 8px;
  width: 100%;
  height: 500px;
  font-size: 0.85rem;
  box-sizing: border-box;
`;

const UpdateButton = styled(DownloadButton)`
  width: 100%;
  margin-top: 1rem;
`;

const downloadImage = () => {
  var link = document.createElement('a');
  link.download = `industry-space-custom.png`;
  link.href = document.querySelector('canvas').toDataURL()
  link.click();
  link.remove();
};

export default () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [codeList, setCodeList] = useState([]);
  const textAreaRef = React.useRef();

  const updateCodeList = () => {
    const node = textAreaRef.current;
    if (node && node.value.length) {
      const codes = node.value.split('\n');
      setCodeList(codes);
    } else {
      setCodeList([])
    }
    setModalOpen(false);
  }

  const modal = modalOpen ? (
    <Modal>
      <Backdrop onClick={() => setModalOpen(false)} />
      <ModalContent>
        <CloseButton onClick={() => setModalOpen(false)}>×</CloseButton>
        <p>
          Copy &amp; Paste a series of 6-Digit NAICS Codes into the text area below. Each one should be on a seperate line. Leave blank to highlight everything.
        </p>
        <Textarea
          placeholder={
            'e.g.\n922150\n922160\n922190\n923110\n923120\n923130\n923140\n924110\n924120\n925110\n925120\n622210\n622310\n623110\n623210\n623220\n623311\n623312'
          }
          ref={textAreaRef}
        />
        <UpdateButton onClick={updateCodeList}>
          Update
        </UpdateButton>
      </ModalContent>
    </Modal>
  ) : null;

  return (
    <div>
      <UtilityBar>
        <DownloadButton style={{marginRight: '1rem'}} onClick={() => setModalOpen(true)}>
          Set Custom Highlighting
        </DownloadButton>
        <DownloadButton onClick={downloadImage}>
          <SvgIcon src={DownloadSVGURL} alt={'Download PNG'} />
          Download Image
        </DownloadButton>
      </UtilityBar>
      <IndustrySpace key={codeList.join('-')} codeList={codeList} />
      {modal}
    </div>
  );
}

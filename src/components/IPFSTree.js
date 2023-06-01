import { useState, useEffect } from 'react';
import { List } from '@mui/material';
import useIPFS from '../hooks/useIPFS';
import IPFSFileRow from './IPFSFileRow';

const IPFSTree = ({ cid, onFileClick }) => {
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = (event) => {
    setScrollTop(event.target.scrollTop);
  };

  const { getDAGForCID } = useIPFS();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (cid) {
        setLoading(true);

        getDAGForCID(cid)
          .then((r) => setDocumentData(r))
          .catch(console.error)
          .finally(() => {
            setLoading(false);
          });
      }
    };

    if (!loading && !documentData) {
      fetchDocument();
    }
  }, [cid]);

  return (
    <List
      sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'auto',
        maxHeight: 300,
        '& ul': { padding: 0 },
      }}
    >
      {Object.values(documentData ?? {}).map((file) => {
        console.log(file);
        return <IPFSFileRow key={file?.name} file={file} onFileClick={onFileClick} />;
      })}
    </List>
  );
};

export default IPFSTree;

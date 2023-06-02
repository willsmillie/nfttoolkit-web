import { useState, useEffect } from 'react';
import { List } from '@mui/material';
import useIPFS from '../hooks/useIPFS';
import IPFSFileRow from './IPFSFileRow';

const IPFSTree = ({ cid, onFileClick }) => {
  const { getDAGForCID } = useIPFS();

  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      console.log('Fetching GAD for CID: ', cid);
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      {Object.values(documentData ?? {}).map((file) => (
        <IPFSFileRow key={file?.name} file={file} onFileClick={onFileClick} />
      ))}
    </List>
  );
};

export default IPFSTree;

import { useState, useEffect } from 'react';
import { List, Typography } from '@mui/material';
import { getDAGForCID, sanitizeCID } from '../utils/ipfs';
import IPFSFileRow from './IPFSFileRow';
import useDebounce from '../hooks/useDebounce';

const IPFSTree = ({ cid, onFileClick }) => {
  const customCid = sanitizeCID(cid);

  const [documentData, setDocumentData] = useState(null);
  // const [contentType, setContentType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      console.log('Fetching GAD for CID: ', customCid);
      if (customCid) {
        setLoading(true);

        getDAGForCID(customCid)
          .then((r) => setDocumentData(r))
          .catch(console.error)
          .finally(() => {
            setLoading(false);
          });
      }
    };

    if (!loading) {
      fetchDocument();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customCid]);

  // DeBounce Function
  useDebounce(
    () => {
      if (customCid.length === 0) {
        setDocumentData({});
        return;
      }

      setLoading(true);

      getDAGForCID(customCid)
        .then((r) => {
          console.log(r);
          setDocumentData(r);
        })
        .catch(async (error) => {
          console.error(error);
        })
        .finally(() => {
          setLoading(false);
          console.log('fetched doc data', documentData);
        });

      // fetch(ipfsToHttp(customCid))
      //   .then((response) =>
      //     response.blob().then((blob) => ({
      //       contentType: response.headers.get('Content-Type'),
      //       raw: blob,
      //     }))
      //   )
      //   .then((data) => setContentType(data.contentType));
    },
    [customCid],
    800
  );

  const dagValues = Object.values(documentData ?? {});
  const containsFiles = dagValues.length > 0;

  return (
    <>
      {!containsFiles ? (
        <Typography sx={{ p: 4 }} textAlign="center">
          No Results...
          <br />
          Ensure the above cid is a directory.
        </Typography>
      ) : (
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
          {dagValues.map((file) => (
            <IPFSFileRow key={file?.name} file={file} onFileClick={onFileClick} />
          ))}
        </List>
      )}
    </>
  );
};

export default IPFSTree;

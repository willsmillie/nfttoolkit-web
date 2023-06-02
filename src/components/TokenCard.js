import * as React from 'react';

import { Card, CardActionArea } from '@mui/material';
import IPFSView from './IPFSView';
import TokenDetail from './TokenDetail';
import { ipfsNftIDToCid } from '../utils/web3';

export default function MediaCard({ token, files }) {
  const [show, setShow] = React.useState(false);

  return (
    <>
      <Card>
        <CardActionArea
          onClick={() => {
            setShow(true);
          }}
        >
          <IPFSView cid={ipfsNftIDToCid(token.nftId)} {...token} files={files} />
        </CardActionArea>
      </Card>
      <TokenDetail
        token={token}
        show={show}
        handleClose={() => {
          setShow(false);
        }}
      />
    </>
  );
}

import fetch from 'node-fetch';

// react
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Grid,
  Stack,
  Button,
  Typography,
  Icon,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import Ratio from 'react-ratio';
import {
  MusicNote,
  Description,
  LiveTv,
  Folder,
  Image,
  ViewInAr,
  Code,
  FontDownload,
  HelpCenter,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';

// hooks
import useAuth from '../hooks/useAuth';
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import TokenInfo from '../components/TokenInfo';

// ----------------------------------------------------------------------

// Token page showing the thumbnail and contents
export default function Token() {
  const { user } = useAuth();
  const theme = useTheme();
  const { themeStretch } = useSettings();

  // get the url param for nftId
  const { nftId } = useParams();

  return (
    <Page title="Token: Detail">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <TokenContents nftId={nftId} />
      </Container>
    </Page>
  );
}

const getMetadata = (nftId) => {
  const endpoint = 'http://127.0.0.1:5001/fenneckitnft/us-central1/nfts-get';
  const url = `${endpoint}?nftId=${nftId}`;
  return fetch(url)
    .then((res) => res.json())
    .catch((error) => console.error);
};

const getIPFS = (cid) => {
  const endpoint = 'http://127.0.0.1:5001/fenneckitnft/us-central1/files-get';
  const url = `${endpoint}?cid=${cid.replace('ipfs://', '')}`;
  return fetch(url)
    .then((res) => res.json())
    .catch((error) => console.error(error.message));
};

// IPFS LIST
const TokenContents = ({ nftId }) => {
  const [metadata, setMetadata] = useState(null);
  const [files, setFiles] = useState(null);

  // API Endpoint utils

  useEffect(() => {
    const fetchData = async () => {
      try {
        const metadataJson = await getMetadata(nftId);
        setMetadata(metadataJson);

        if (metadataJson) {
          const ipfsJson = await getIPFS((metadataJson?.animation_url ?? metadataJson?.image)?.replace('ipfs://', ''));
          setFiles(Object.values(ipfsJson));
        }
      } catch (error) {
        console.log('error', error.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={6}>
          <Stack direction="column" justifyContent="flex-start" alignItems="stretch" spacing={2} sx={{ height: '50%' }}>
            <Typography level="h2" variant="h3" component="div">
              {metadata?.name ?? 'Token Name'}
            </Typography>
            <Ratio ratio={1}>
              <iframe
                alt={metadata?.name ?? ''}
                title={metadata?.name ?? ''}
                frameBorder="0"
                style={{ width: '100%', height: '100%', backgroundColor: '#FFFFFF00' }}
                src={`https://www.gstop-content.com/ipfs/${(metadata?.animation_url ?? '').replace('ipfs://', '')}`}
              />
            </Ratio>
            <TokenInfo token={metadata} />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6} lg={6}>
          <List>
            {(files ?? []).map((file) => {
              return <FileRow key={file?.name} file={file} />;
            })}
          </List>
        </Grid>
      </Grid>
    </div>
  );
};

const FileRow = ({ file }) => {
  const extForFile = (file) => {
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(file?.name)[1];
    return ext;
  };

  const isFolder = (file) => {
    if (extForFile(file) == null) return true;
  };

  const FileIcon = ({ file }) => {
    var ext = extForFile(file);

    // Folder
    if (!ext) return <Folder />;

    // music
    switch (ext.toLowerCase()) {
      // Images
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'webp':
      case 'ico':
      case 'pdf':
      case 'gif':
        return <Image />;

      // Audio
      case 'mp3':
      case 'aif':
      case 'wav':
        return <MusicNote />;

      // Video
      case 'm4a':
      case 'm4v':
      case 'mp4':
        return <LiveTv />;

      // 3D / AR
      case 'hdr':
      case 'glb':
      case 'gltf':
        return <ViewInAr />;

      // Developer
      case 'js':
      case 'html':
      case 'css':
      case 'php':
      case 'json':
        return <Code />;

      // Fonts
      case 'ttf':
        return <FontDownload />;

      case 'txt':
      case 'md':
      case 'docx':
        return <Description />;

      // File
      default:
        return <HelpCenter />;
    }
  };

  const IPFSFolder = ({ file }) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <ListItemButton
          key={`${file?.name}-row`}
          onClick={() => {
            setOpen(!open);
          }}
        >
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary={file?.name} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={open} timeout="auto" unmountOnExit key={`${file?.name}-children`}>
          <List component="div" disablePadding sx={{ paddingLeft: '32px' }}>
            {(file?.links ?? []).map((file) => (
              <FileRow indent={'32px'} file={file} key={`${file?.name}-row`} />
            ))}
          </List>
        </Collapse>
      </>
    );
  };

  const IPFSFile = ({ file, indent }) => {
    return (
      <ListItemButton>
        <ListItemIcon>
          <FileIcon file={file} />
        </ListItemIcon>
        <ListItemText primary={file.name} />
      </ListItemButton>
    );
  };

  return isFolder(file) ? <IPFSFolder file={file} /> : <IPFSFile file={file} />;
};

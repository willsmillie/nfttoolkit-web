/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable camelcase */
import React, { useState, useEffect } from 'react';

// @mui
import { Collapse, List, ListItem, ListItemIcon, ListItemText, ListItemButton, IconButton } from '@mui/material';
import Ratio from 'react-ratio';
import {
  MusicNote,
  Description,
  LiveTv,
  Folder,
  // Star,
  Image,
  ViewInAr,
  Code,
  FontDownload,
  HelpCenter,
  ExpandLess,
  FolderZip,
  ExpandMore,
  // MoreVert,
  Download,
} from '@mui/icons-material';
// import ConnectPopover from '../components/ConnectPopover';

// components
import useIPFS from '../hooks/useIPFS';

const FileRow = ({ file, onFileClick }) => {
  const { getDAGForCID } = useIPFS();

  const extForFile = (file) => {
    const re = /(?:\.([^.]+))?$/;
    const ext = re.exec(file?.name)[1];
    return ext;
  };

  const isFolder = (file) => extForFile(file) == null;

  const FileIcon = ({ file }) => {
    const ext = extForFile(file);

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
      case 'mov':
        return <LiveTv />;

      // Archive:
      case 'zip':
        return <FolderZip />;

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

  const IPFSFolder = ({ file, onFileClick }) => {
    const [open, setOpen] = useState(false);
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      function fetchData() {
        if (!metadata && !isLoading && open) {
          console.log('fetching children for ', file.name);
          setIsLoading(true);

          getDAGForCID(file?.id).then(setMetadata).then(setIsLoading(false));
        }
      }

      fetchData();
      return () => {};
    }, [file, open]);

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
            {(metadata ?? []).map((file) => (
              <FileRow file={file} key={`${file?.name}-row`} onFileClick={onFileClick} />
            ))}
          </List>
        </Collapse>
      </>
    );
  };

  const IPFSFile = ({ file, onFileClick }) => (
    <>
      <ListItem
        disablePadding
        secondaryAction={
          <>
            {file.downloadUrl && (
              <IconButton aria-label="more" href={file.downloadUrl ?? '#'}>
                <Download />
              </IconButton>
            )}
          </>
        }
      >
        <ListItemButton
          onClick={() => {
            onFileClick(file);
          }}
        >
          <ListItemIcon>
            <FileIcon file={file} />
          </ListItemIcon>
          <ListItemText primary={file.name} />
        </ListItemButton>
      </ListItem>
    </>
  );
  return isFolder(file) ? (
    <IPFSFolder file={file} onFileClick={onFileClick} />
  ) : (
    <IPFSFile file={file} onFileClick={onFileClick} />
  );
};

export default FileRow;

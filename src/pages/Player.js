import React, { useEffect, useState } from 'react';
// @mui
import {
  Grid,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  IconButton,
  ListItemText,
  Box,
} from '@mui/material';
// components
import Page from '../components/Page';
// sections
import { db } from '../utils/firebase';
import { useBalances } from '../hooks/useBalances';
import TokenCard from '../components/TokenCard';
import PlayerBar from '../components/PlayerBar';
import Iconify from '../components/Iconify';

// ----------------------------------------------------------------------

export default function Player() {
  const [files, setFiles] = useState({});
  const { active, balances } = useBalances();

  // eslint-disable-next-line no-unused-vars
  const [queue, setQueue] = useState(Object.values(files) || []); // Array to store the tracks in the queue
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState(null);
  const isSelected = (item) => activeTrack?.id === item.id;

  useEffect(() => {
    // Fetch the files from Firestore for this nft
    const fetchFiles = async () => {
      await db
        .collection('files')
        .get()
        .then((querySnapshot) => {
          const fileRefsByNftId = {};

          querySnapshot.forEach((doc) => {
            const fileId = doc.id;
            const fileData = doc.data();
            const { nftId } = fileData;

            if (!fileRefsByNftId[nftId]) {
              fileRefsByNftId[nftId] = [];
            }

            fileRefsByNftId[nftId].push({ id: fileId, ...fileData });
          });

          // Use setFiles to save the state
          setFiles(fileRefsByNftId);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchFiles();
  }, []);

  const onFileClick = (value) => {
    if (isPlaying) setIsPlaying(false);
    setActiveTrack(value);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prevIsPlaying) => !prevIsPlaying);
  };

  // Derive the currentTrackIndex based on the activeTrack
  const currentTrackIndex = queue.findIndex((track) => track.id === activeTrack?.id);

  // Function to handle playing the next track
  const handleNextTrack = () => {
    setIsPlaying(false);
    if (currentTrackIndex < queue.length - 1) {
      setActiveTrack(queue[currentTrackIndex + 1]);
    } else {
      // Handle when reached the end of the queue
      // For example, you can start playing from the beginning of the queue or stop playback
      const albumFiles = files[activeTrack.nftId];
      const activeTrackIndex = albumFiles.findIndex((file) => file.id === activeTrack.id);

      if (albumFiles && activeTrackIndex < albumFiles.length - 1) {
        setActiveTrack(albumFiles[activeTrackIndex + 1]);
      } else {
        const nftIds = Object.keys(files);
        const currentNftIndex = nftIds.indexOf(activeTrack.nftId);

        if (currentNftIndex < nftIds.length - 1) {
          const nextNftId = nftIds[currentNftIndex + 1];
          setActiveTrack(nextNftId[0]);
        } else {
          // Handle when reached the end of the nftIds
          // For example, you can stop playback or go back to the first nftId's first file
        }
      }
    }
  };

  // Function to handle playing the previous track
  const handleLastTrack = () => {
    setIsPlaying(false);
    if (currentTrackIndex > 0) {
      setActiveTrack(queue[currentTrackIndex - 1]);
    } else {
      const albumFiles = files[activeTrack.nftId];
      const activeTrackIndex = albumFiles.findIndex((file) => file.id === activeTrack.id);

      if (albumFiles && activeTrackIndex > 0) {
        setActiveTrack(albumFiles[activeTrackIndex - 1]);
      } else {
        const nftIds = Object.keys(files);
        const currentNftIndex = nftIds.indexOf(activeTrack.nftId);

        if (currentNftIndex > 0) {
          const prevNftId = nftIds[currentNftIndex - 1];
          const prevNftFiles = files[prevNftId];
          setActiveTrack(prevNftFiles[prevNftFiles.length - 1]);
        } else {
          // Handle when reached the beginning of the nftIds
          // For example, you can stop playback or go to the last file of the last nftId
        }
      }
    }
  };

  // // Function to add a track to the queue
  // const addToQueue = (track) => {
  //   setQueue([...queue, track]);
  // };

  // // Function to remove a track from the queue
  // const removeFromQueue = (trackIndex) => {
  //   const updatedQueue = [...queue];
  //   updatedQueue.splice(trackIndex, 1);
  //   setQueue(updatedQueue);
  // };

  return (
    <Page title="Player">
      <Stack>
        {!active ? (
          <Typography variant="h5" align="center">
            Connect your wallet to view your assets!
          </Typography>
        ) : (
          <Grid container spacing={2}>
            {Object.keys(files).map((tokenId) => (
              <Grid
                item
                key={tokenId}
                sx={{ bgcolor: 'background.paper', margin: 2, padding: 2, borderRadius: 1 }}
                xs={12}
              >
                {(balances ?? []).find((e) => e.nftId === tokenId) && (
                  <Stack direction="row" spacing={2} alignItems="start" justifyContent="stretch">
                    <Box style={{ width: '250px' }}>
                      <TokenCard
                        token={(balances ?? []).find((e) => e.nftId === tokenId)}
                        files={[...new Set(files[tokenId])]}
                      />
                    </Box>
                    <Stack spacing={1} sx={{ overflow: 'clip', width: '100%' }}>
                      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                        {(files[tokenId] ?? []).map((value, index) => (
                          <ListItem
                            key={index}
                            sx={{ bgcolor: 'background.default', width: '100%' }}
                            margin={1}
                            selected={isSelected(value)}
                            disableGutters
                            secondaryAction={
                              <IconButton aria-label="more">
                                <Iconify icon="ic:more-vert" />
                              </IconButton>
                            }
                          >
                            <ListItemButton role={undefined} onClick={() => onFileClick(value, index)}>
                              <ListItemIcon>{index + 1}</ListItemIcon>
                              <ListItemText primary={value.name} />
                            </ListItemButton>
                          </ListItem>
                        ))}
                      </List>
                    </Stack>
                  </Stack>
                )}
              </Grid>
            ))}
          </Grid>
        )}
        <div style={{ position: 'fixed', zIndex: 9999, bottom: 0, left: 0, width: '100%' }}>
          <PlayerBar
            track={activeTrack}
            onToggle={handleTogglePlay}
            setIsPlaying={setIsPlaying}
            isPlaying={isPlaying}
            onNext={handleNextTrack}
            onLast={handleLastTrack}
          />
        </div>
      </Stack>
    </Page>
  );
}

// const NAV_ITEMS = [
//   {
//     subheader: 'Explore',
//     items: [
//       {
//         title: 'Listen Now',
//         path: '#',
//         icon: <Iconify icon="ic:play-circle-outline" />,
//       },
//       {
//         title: 'Browse',
//         path: '#',
//         icon: <Iconify icon="ic:language" />,
//       },
//     ],
//   },
//   {
//     subheader: 'Library',
//     items: [
//       {
//         title: 'Recently Added',
//         path: '#',
//         icon: <Iconify icon="ic:access-time" />,
//       },
//       {
//         title: 'Artists',
//         path: '#',
//         icon: <Iconify icon="ic:people" />,
//       },
//       {
//         title: 'Albums',
//         path: '#',
//         icon: <Iconify icon="ic:album" />,
//       },
//       {
//         title: 'Videos',
//         path: '#',
//         icon: <Iconify icon="ic:movie" />,
//       },
//     ],
//   },
//   {
//     subheader: 'Playlists',
//     items: [
//       {
//         title: 'Add Playlist',
//         path: '#',
//         icon: <Iconify icon="ic:add-circle" />,
//       },
//     ],
//   },
// ];

import { useState, useEffect } from 'react';
// @mui
import {
  Container,
  Grid,
  Stack,
  Typography,
  Table,
  Tooltip,
  TableBody,
  IconButton,
  TableContainer,
  Box,
} from '@mui/material';
// hooks
import useSettings from '../hooks/useSettings';
// components
import Page from '../components/Page';
import {
  emptyRows,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../components/table';
// sections
import { db } from '../utils/firebase';
import { useBalances } from '../hooks/useBalances';
import { NavSectionVertical } from '../components/nav-section';
import MyTokensList from '../components/MyTokenList';
import TokenCard from '../components/TokenCard';
import FileRow from '../components/FileRow';
import Iconify from '../components/Iconify';

// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'name', label: 'Name', align: 'left' },
  { id: 'size', label: 'Size', align: 'left', width: 120 },
  { id: 'type', label: 'Type', align: 'center', width: 120 },
  { id: 'dateModified', label: 'Modified', align: 'left', width: 160 },
  { id: 'shared', label: 'Shared', align: 'right', width: 100 },
  { id: '' },
];
const NAV_ITEMS = [
  {
    subheader: 'Explore',
    items: [
      {
        title: 'Listen Now',
        path: '#',
        icon: <Iconify icon="ic:play-circle-outline" />,
      },
      {
        title: 'Browse',
        path: '#',
        icon: <Iconify icon="ic:language" />,
      },
    ],
  },
  {
    subheader: 'Library',
    items: [
      {
        title: 'Recently Added',
        path: '#',
        icon: <Iconify icon="ic:access-time" />,
      },
      {
        title: 'Artists',
        path: '#',
        icon: <Iconify icon="ic:people" />,
      },
      {
        title: 'Albums',
        path: '#',
        icon: <Iconify icon="ic:album" />,
      },
      {
        title: 'Videos',
        path: '#',
        icon: <Iconify icon="ic:movie" />,
      },
    ],
  },
  {
    subheader: 'Playlists',
    items: [
      {
        title: 'Add Playlist',
        path: '#',
        icon: <Iconify icon="ic:add-circle" />,
      },
    ],
  },
];

export default function GeneralApp() {
  const { themeStretch } = useSettings();
  const [tab, setTab] = useState('listen');
  const [files, setFiles] = useState({});

  const { active, balances } = useBalances();
  // const ownedTokenIds = balances.map((e) => e.nftId);
  // const nftsHeldByUser = ownedTokenIds
  //   .filter((nft) => files[nft.nftId])
  //   .map((id) => balances.find((e) => e.nftId.toLowerCase() === id.toLowerCase()));
  // console.log(nftsHeldByUser);

  // const flattenedData = Object.values(
  //   balances.reduce((acc, currentItem) => {
  //     acc[currentItem.nftId] = currentItem;
  //     return acc;
  //   }, {})
  // );

  // const { account } = useBalances();
  // const canUpload = account?.toLowerCase() === minter;

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

          // 'fileRefsByNftId' will contain the dictionary mapping nftId to an array of file references
          console.log(fileRefsByNftId);
          // Use setFiles to save the state
          setFiles(fileRefsByNftId);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    fetchFiles();
  }, [tab]);

  return (
    <Page title="Player">
      {!active ? (
        <Typography variant="h5" align="center">
          Connect your wallet to view your assets!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {Object.keys(files).map((tokenId) => (
            <Grid item key={tokenId} xs={6} sm={4} md={3}>
              {(balances ?? []).find((e) => e.nftId === tokenId) && (
                <TokenCard
                  token={(balances ?? []).find((e) => e.nftId === tokenId)}
                  files={[...new Set(files[tokenId])]}
                />
              )}
            </Grid>
          ))}
        </Grid>
      )}
    </Page>
  );
}

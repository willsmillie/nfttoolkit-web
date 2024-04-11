import { useState } from 'react';
// @mui
import { Container, Grid, Tooltip, Tabs, Tab, Card, Typography, CardActionArea } from '@mui/material';

// hooks
import useSettings from '../hooks/useSettings';
import useTabs from '../hooks/useTabs';
import useLoopring from '../hooks/useLoopring';
import { ipfsToHttp } from '../utils/ipfs';

// components
import Iconify from '../components/Iconify';
import Page from '../components/Page';
import Label from '../components/Label';
import TablePagination from '../components/TablePagination';
import LightBox from '../components/LightBox';
import TokenGrid from '../components/token/TokenGrid';
import Image from '../components/Image';

import { isYouTubeLink } from '../utils/youtube';

// ----------------------------------------------------------------------

export default function GeneralApp() {
  const { themeStretch } = useSettings();
  const { nfts, mints, files } = useLoopring();
  // Filter tabs
  const STATUS_OPTIONS = ['collected', 'created', 'files'];
  const { currentTab: filterStatus, onChangeTab: onChangeFilterStatus } = useTabs(STATUS_OPTIONS[0]);

  // easy accessors for determining state
  const showCollected = filterStatus === 'collected';
  const showCreated = filterStatus === 'created';
  const showFiles = filterStatus === 'files';

  // pagination config
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const filteredTotal = showCollected ? nfts?.length : showCreated ? mints?.length ?? 0 : files?.length ?? 0;
  const rows = (showCollected ? nfts : showCreated ? mints : files) ?? [];

  // Calculate the start and end indexes for the current page
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const filteredRows = rows?.slice(startIndex, endIndex);
  const filesForPage = files?.slice(startIndex, endIndex);

  const [lightBoxContent, setLightBoxContent] = useState(null);

  return (
    <>
      <Page title="My Tokens">
        <Container maxWidth={themeStretch ? false : 'xl'}>
          <Typography variant="h3" component="h1" paragraph>
            Assets
          </Typography>
          <Card>
            <Tabs
              allowScrollButtonsMobile
              variant="scrollable"
              scrollButtons="auto"
              value={filterStatus}
              onChange={onChangeFilterStatus}
              sx={{ px: 2, bgcolor: 'background.neutral' }}
            >
              {STATUS_OPTIONS.map((tab) => (
                <Tab
                  disableRipple
                  key={tab}
                  label={tab}
                  value={tab}
                  icon={
                    <Label variant={'ghost'} color={'success'}>
                      {tab === 'collected' && (nfts?.length ?? 0)}
                      {tab === 'created' && (mints?.length ?? 0)}
                      {tab === 'files' && (files?.length ?? 0)}
                    </Label>
                  }
                />
              ))}
            </Tabs>

            {!showFiles && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TokenGrid title="Tokens" rows={filteredRows} />
                </Grid>
              </Grid>
            )}

            {showFiles && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <GatedFilesList files={filesForPage} onFileClick={(file) => setLightBoxContent(file)} />
                </Grid>
              </Grid>
            )}
            <TablePagination
              count={filteredTotal}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(e, page) => setPage(page)}
              onRowsPerPageChange={(e) => setRowsPerPage(e.target.value)}
            />
          </Card>
        </Container>
      </Page>
      <LightBox open={!!lightBoxContent} file={lightBoxContent} onClose={() => setLightBoxContent(null)} />
    </>
  );
}

const GatedFilesList = ({ files, onFileClick }) => (
  <Grid container spacing={3} padding={2}>
    {files.map((file, index) => (
      <Grid item xs={2} key={file.id}>
        <GatedFilePreview file={file} onClick={() => onFileClick(file, index)} />
      </Grid>
    ))}
  </Grid>
);

const GatedFilePreview = ({ file, onClick }) => {
  const thumbnail = ipfsToHttp(file.thumbnail ?? file.url);
  const isPlayable = isYouTubeLink(file.url) || file.type.includes('audio');

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  return (
    <Tooltip title={file.name} placement="bottom">
      <Card sx={{ position: 'relative', cursor: 'pointer', borderRadius: 1 }} tabIndex={0}>
        <CardActionArea onClick={onClick} onKeyPress={handleKeyPress}>
          <Image key={thumbnail} alt={thumbnail} src={thumbnail} ratio="1/1" />
          {isPlayable && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <Iconify icon="carbon:play-filled" style={{ fontSize: '2rem', color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
          )}
        </CardActionArea>
      </Card>
    </Tooltip>
  );
};

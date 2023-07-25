import * as React from 'react';
import { Close } from '@mui/icons-material';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Stack,
} from '@mui/material';
import Label from './Label';

export default function ToolCard({ tool }) {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    if (tool.url) {
      window.open(tool.url, '_blank');
    } else {
      setOpen(true);
    }
  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Grid item xs={4}>
        <Card>
          <CardActionArea onClick={handleClickOpen}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">{tool.name}</Typography>
                {tool.label && <Label color="primary">{tool.label}</Label>}
              </Stack>
              <Typography>{tool.description}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
      <Dialog fullScreen open={open} onClose={handleClose}>
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <Close />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {tool.name}
            </Typography>
          </Toolbar>
        </AppBar>
        <Container>{tool.content()}</Container>
      </Dialog>
    </>
  );
}

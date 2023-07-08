/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/jsx-key */
import { useState } from 'react';
import { Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';

// @web3-react
import useLoopring from '../hooks/useLoopring';

export default function ConnectPopover() {
  const { active, account, connect, disconnect } = useLoopring();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <Button
        variant="contained"
        onClick={handleClick}
        sx={{
          whiteSpace: 'nowrap',
          minWidth: 'auto',
        }}
      >
        <Typography
          sx={{
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textAlign: 'left',
            display: 'block',
            maxWidth: '200px',
          }}
        >
          {!active ? 'Connect Wallet' : account}
        </Typography>
      </Button>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {active && <MenuItem onClick={disconnect}>Disconnect</MenuItem>}
        {!active && (
          <MenuItem onClick={connect}>
            <ListItemIcon>
              <img src="https://static.loopring.io/assets/svg/gs.svg" alt="GameStop" height="36" />
            </ListItemIcon>
            <ListItemText>GameStop</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
}

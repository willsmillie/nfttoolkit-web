/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/jsx-key */
import React, { useContext } from 'react';
import { Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';

// @web3-react
import { useWeb3React } from '@web3-react/core';
import { AuthContext } from '../contexts/L2Context';

export default function ConnectPopover() {
  const { connect, disconnect } = useContext(AuthContext);
  const { active, account } = useWeb3React();

  const [anchorEl, setAnchorEl] = React.useState(null);
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
          nowrap
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
        {active && account && <MenuItem onClick={disconnect}>Disconnect</MenuItem>}
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

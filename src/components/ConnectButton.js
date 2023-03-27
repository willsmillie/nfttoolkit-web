/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/jsx-key */
import React from 'react';
import { Typography, Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';

// @web3-react
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { isAdmin } from '../utils/web3';

export default function ConnectPopover() {
  const { activate, deactivate, active, account } = useWeb3React();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const Injected = new InjectedConnector({
    supportedChainIds: [1, 3, 4, 5, 42],
  });

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const MenuItems = () => {
    let results = [];

    if (active && account) {
      results = [
        // <MenuItem onClick={metaMask}>
        //   <ListItemIcon>
        //     <img src="https://static.loopring.io/assets/svg/meta-mask.svg" alt="MetaMask" height="36" />
        //   </ListItemIcon>
        //   <ListItemText>Metamask</ListItemText>
        // </MenuItem>,
        // <MenuItem onClick={walletConnect}>
        //   <ListItemIcon>
        //     <img src="https://static.loopring.io/assets/svg/wallet-connect.svg" alt="WalletConnect" height="36" />
        //   </ListItemIcon>
        //   <ListItemText>WalletConnect</ListItemText>
        // </MenuItem>,
        //     <ListItemIcon>
        //       <img src="https://static.loopring.io/assets/svg/coinbase-wallet.svg" alt="Coinbase" height="36" />
        //     </ListItemIcon>
        //     <ListItemText>Coinbase</ListItemText>
        //   </MenuItem>,
        <MenuItem onClick={() => deactivate()}>Disconnect</MenuItem>,
      ];

      if (isAdmin(account)) results = [...results, <MenuItem onClick={handleClose}>Profile</MenuItem>];
    } else {
      results = [
        <MenuItem onClick={() => activate(Injected)}>
          <ListItemIcon>
            <img src="https://static.loopring.io/assets/svg/gs.svg" alt="GameStop" height="36" />
          </ListItemIcon>
          <ListItemText>GameStop</ListItemText>
        </MenuItem>,
      ];
    }

    return results;
  };

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
        <MenuItems />
      </Menu>
    </div>
  );
}

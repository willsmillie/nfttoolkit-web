/* eslint-disable react/jsx-no-undef */
/* eslint-disable react/jsx-key */
import { useState } from 'react';
import { Button, Menu, MenuItem, Divider } from '@mui/material';

import PlugIcon from '@mui/icons-material/PowerSettingsNewRounded';
import PowerIcon from '@mui/icons-material/Power';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';

import { useUnlockContext } from '../contexts/unlock-context';

export default function ConnectPopover() {
  const { disconnect } = useDisconnect();

  const { isUnlocked, unlock } = useUnlockContext();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleDisconnect = () => disconnect();

  return (
    <div>
      <ConnectButton.Custom>
        {({ account, chain, openChainModal, openConnectModal, authenticationStatus, mounted }) => {
          // Note: If your app doesn't use authentication, you
          // can remove all 'authenticationStatus' checks
          const ready = mounted && authenticationStatus !== 'loading';
          const connected =
            ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');
          return (
            <div
              {...(!ready && {
                'aria-hidden': true,
                style: {
                  opacity: 0,
                  pointerEvents: 'none',
                  userSelect: 'none',
                },
              })}
            >
              {(() => {
                if (!connected) {
                  return (
                    <Button endIcon={<PowerIcon />} onClick={openConnectModal} variant="contained" color="primary">
                      Connect Wallet
                    </Button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <Button onClick={openChainModal} variant="contained" color="primary">
                      Wrong network
                    </Button>
                  );
                }
                return (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button
                      onClick={handleClick}
                      variant="contained"
                      color="primary"
                      startIcon={
                        <img
                          alt={account?.display ?? 'account icon'}
                          src={account?.ensAvatar}
                          style={{ width: 24, height: 24, borderRadius: '100%' }}
                        />
                      }
                      endIcon={<PowerIcon />}
                    >
                      {account.displayName}
                    </Button>
                    <Menu
                      anchorEl={anchorEl}
                      open={open}
                      onClose={handleClose}
                      onClick={handleClose}
                      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                      <MenuItem onClick={unlock} disabled={!connected}>
                        {isUnlocked ? <LockOpenIcon fontSize="small" /> : <LockIcon fontSize="small" />}
                        {isUnlocked ? 'Lock' : 'Unlock'} Account{!connected && ' (disabled)'}
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleDisconnect}>
                        <PlugIcon fontSize="small" />
                        Disconnect
                      </MenuItem>
                    </Menu>
                  </div>
                );
              })()}
            </div>
          );
        }}
      </ConnectButton.Custom>
    </div>
  );
}

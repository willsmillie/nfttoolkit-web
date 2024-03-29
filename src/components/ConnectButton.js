import { useState } from 'react';

import { Stack, Button, Menu, MenuItem, Divider } from '@mui/material';
import PowerIcon from '@mui/icons-material/PowerSettingsNewRounded';
import PlugIcon from '@mui/icons-material/Power';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi';

import { useUnlockContext } from '../contexts/unlock-context';
import Iconify from './Iconify';

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
                    <Button endIcon={<PlugIcon />} onClick={openConnectModal} variant="contained" color="primary">
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
                        account?.ensAvatar && (
                          <img
                            alt={account?.display ?? 'account icon'}
                            src={account?.ensAvatar}
                            style={{ width: 24, height: 24, borderRadius: '100%' }}
                          />
                        )
                      }
                      endIcon={<PlugIcon />}
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
                        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                          {isUnlocked ? (
                            <Iconify sx={{ pr: '10px', width: '24px' }} icon="fa:lock-alt" />
                          ) : (
                            <Iconify sx={{ pr: '10px', width: '24px' }} icon="fa:unlock-alt" />
                          )}
                          {isUnlocked ? 'Lock' : 'Unlock'} Account{!connected && ' (disabled)'}
                        </Stack>
                      </MenuItem>
                      <Divider />
                      <MenuItem onClick={handleDisconnect}>
                        <PowerIcon sx={{ pr: '10px' }} fontSize="large" />
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

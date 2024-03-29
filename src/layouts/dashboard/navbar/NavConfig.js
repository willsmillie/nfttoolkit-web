// components
import { GitHub, PlayArrowRounded, Wallet, PaletteRounded } from '@mui/icons-material';

import SvgIconStyle from '../../../components/SvgIconStyle';

// ----------------------------------------------------------------------

const getIcon = (name) => <SvgIconStyle src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const ICONS = {
  user: getIcon('ic_user'),
  assets: <Wallet />,
  github: <GitHub />,
  player: <PlayArrowRounded />,
  ecommerce: getIcon('ic_ecommerce'),
  analytics: getIcon('ic_analytics'),
  dashboard: getIcon('ic_dashboard'),
  palette: <PaletteRounded />,
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'NFT Tool Kit',
    items: [
      { title: 'Assets', path: '/assets', icon: ICONS.assets },
      { title: 'Tools', path: '/tools', icon: ICONS.dashboard },
      { title: 'Github', path: 'http://github.com/willsmillie/nfttoolkit-web', icon: ICONS.github },
    ],
  },
  {
    subheader: '🪴 Ecosystem',
    items: [
      {
        title: 'Make A Mint',
        path: 'https://makeamint.io',
        caption: 'No-Code Interactive NFTs',
        icon: ICONS.palette,
        accessory: ICONS.external,
      },
      {
        title: 'MintStream.Art',
        path: 'https://mintstream.art',
        caption: 'Stream Web3 Music/Video',
        icon: ICONS.audio,
        accessory: ICONS.external,
      },
    ],
  },
];

export default navConfig;

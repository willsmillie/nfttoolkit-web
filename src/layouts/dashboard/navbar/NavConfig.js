// components
import { GitHub, PlayArrowRounded, Wallet } from '@mui/icons-material';
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
};

const navConfig = [
  // GENERAL
  // ----------------------------------------------------------------------
  {
    subheader: 'NFT Tool Kit',
    items: [
      { title: 'Assets', path: '/assets', icon: ICONS.assets },
      { title: 'Player', path: '/player', icon: ICONS.player },
      { title: 'Tools', path: '/tools', icon: ICONS.dashboard },
      { title: 'Github', path: 'http://github.com/willsmillie/nfttoolkit-web', icon: ICONS.github },
    ],
  },
];

export default navConfig;

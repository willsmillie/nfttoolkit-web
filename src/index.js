// scroll bar
import 'simplebar/src/simplebar.css';

// lazy image
import 'react-lazy-load-image-component/src/effects/blur.css';
import 'react-lazy-load-image-component/src/effects/opacity.css';
import 'react-lazy-load-image-component/src/effects/black-and-white.css';

import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
// contexts
import { LoopringAccountProvider } from 'src/contexts/account-context';
import { LoopringUnlockProvider } from 'src/contexts/unlock-context';
import Web3 from 'src/components/web3';

import { SettingsProvider } from './contexts/SettingsContext';
import { CollapseDrawerProvider } from './contexts/CollapseDrawerContext';
import AuthContextProvider from './contexts/L2Context';

import App from './App';

// ----------------------------------------------------------------------

ReactDOM.render(
  <HelmetProvider>
    <Web3>
      <LoopringAccountProvider>
        <LoopringUnlockProvider>
          <AuthContextProvider>
            <SettingsProvider>
              <CollapseDrawerProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </CollapseDrawerProvider>
            </SettingsProvider>
          </AuthContextProvider>
        </LoopringUnlockProvider>
      </LoopringAccountProvider>
    </Web3>
  </HelmetProvider>,
  document.getElementById('root')
);

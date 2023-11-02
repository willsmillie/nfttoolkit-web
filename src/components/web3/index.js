import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;
// const infuraId = process.env.REACT_APP_INFURA_PROJECT_ID;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain === mainnet) {
          return {
            http: 'https://mainneteth.loopring.io',
          };
        }

        return {
          http: '',
        };
      },
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'NFTToolKit',
  projectId,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors,
});

export default function MyApp({ children }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>{children}</RainbowKitProvider>
    </WagmiConfig>
  );
}

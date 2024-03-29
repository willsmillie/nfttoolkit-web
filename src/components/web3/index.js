import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { mainnet, sepolia, goerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID;
// const infuraId = process.env.REACT_APP_INFURA_PROJECT_ID;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, sepolia, goerli],
  [
    jsonRpcProvider({
      rpc: (chain) => {
        switch (chain) {
          case mainnet:
            return {
              http: 'https://mainneteth.loopring.io',
            };
          case goerli:
            return {
              http: 'https://goerlieth.loopring.io',
            };
          default:
            return {
              http: 'https://sepoliaeth.loopring.io',
            };
        }
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

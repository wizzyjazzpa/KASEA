import { createApp, ref, onMounted } from "vue";
import { Web3Modal } from "@web3modal/html";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import { SolanaClient } from "@web3modal/solana";
import { configureChains, createConfig } from "@wagmi/core";

const projectId = "e3676da4dc97606136a6c7a43aa902f8"; // get from https://cloud.walletconnect.com
const chains = [
  {
    id: 1,
    name: "Ethereum Mainnet",
    rpcUrls: { default: { http: ["https://rpc.ankr.com/eth"] } }
  }
];

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 2, chains }),
  publicClient
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);
const solanaClient = new SolanaClient({ projectId }); // Phantom support

const web3modal = new Web3Modal({ projectId }, ethereumClient, solanaClient);

const App = {
  setup() {
    const address = ref(null);
    const chain = ref(null);

    onMounted(() => {
      // Listen for events
      web3modal.subscribeEvents((event) => {
        if (event.name === "ACCOUNT_CONNECTED") {
          address.value = event.data.address;
          chain.value = event.data.chainId || "solana";

          // send to Node server
          fetch("/save-wallet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              address: address.value,
              chain: chain.value
            })
          });
        }
        if (event.name === "ACCOUNT_DISCONNECTED") {
          address.value = null;
          chain.value = null;
        }
      });
    });

    return { address, chain };
  },
  template: `
    <div>
      <h2>Wallet Connect Demo</h2>
      <w3m-button></w3m-button>
      <div v-if="address">
        <p>Connected: {{ address }}</p>
        <p>Chain: {{ chain }}</p>
      </div>
    </div>
  `
};

createApp(App).mount("#app");
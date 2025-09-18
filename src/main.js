import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';

// Injected wallets (MetaMask, etc.)
const injected = injectedModule();

// WalletConnect v2
const wc = walletConnectModule({
  projectId: "c8d7dcaec6bd94bddb76b57445502b27", // get from https://cloud.walletconnect.com
  version: 2,
  
  
});

// Initialize Onboard
const onboard = Onboard({
  wallets: [injected, wc],
  chains: [
    { id: 1, token: 'ETH', label: 'Ethereum Mainnet', rpcUrl: 'https://eth.llamarpc.com' },
    { id: 137, token: 'MATIC', label: 'Polygon', rpcUrl: 'https://polygon-rpc.com' }
  ],
   appMetadata: {
    name: 'My dApp',
    icon: 'http://localhost:5000/images/KASEA LOGO (W)_060326.svg', // HTTPS required
    description: 'Fully mobile-compatible dApp'
    // No recommendedInjectedWallets: all wallets shown
  }
});

const connectBtn = document.getElementById('connectBtn');
const walletAddress = document.getElementById('walletAddress');

connectBtn.addEventListener('click', async () => {
  const wallets = await onboard.connectWallet();
  if (wallets.length > 0) {
    walletAddress.innerText = `Connected: ${wallets[0].accounts[0].address}`;
    // ✅ Send wallet address to server via jQuery
    $.ajax({
      url: '/api/savewallet',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ address }),
      success: function(response) {
        console.log('Server response:', response);
      },
      error: function(err) {
        console.error('Failed to send wallet to server:', err);
      }
    });
  } else {
    walletAddress.innerText = "No wallet connected";
  }
});

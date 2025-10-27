import Onboard from '@web3-onboard/core';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import $ from 'jquery';

// Injected wallets (MetaMask, etc.)
const injected = injectedModule();

// WalletConnect v2
const wc = walletConnectModule({
  projectId: "b3bf50cd2df942acb03dc358dce23200", // get from https://cloud.walletconnect.com
  version: 2
 
  
});

// Initialize Onboard
const onboard = Onboard({
  wallets: [injected, wc],
  chains: [
    { id: '0x1', token: 'ETH', label: 'Ethereum Mainnet', rpcUrl: 'https://eth.llamarpc.com' },
    { id: '0x89', token: 'MATIC', label: 'Polygon', rpcUrl: 'https://polygon-rpc.com' }
  ],
   appMetadata: {
    name: 'KASEA Presale',
    icon: 'https://kaseacoin.up.railway.app/images/KASEA_LOGO.svg', // HTTPS required
    description: 'Secure your tokens before exchange listing',
     
    // No recommendedInjectedWallets: all wallets shown
  }
});

const connectBtn = document.getElementById('connectBtn');
const walletAddress = document.getElementById('walletAddress');


connectBtn.addEventListener('click', async () => {
  const wallets = await onboard.connectWallet();
  if (wallets.length > 0) {
    let  walletAddress = wallets[0].accounts[0].address ;
     document.getElementById('walletAddress_txt').innerHTML= walletAddress;
     document.getElementById('walletAddress').innerHTML=walletAddress;
      document.getElementById('walletInfo').classList.remove('hidden');
    $.ajax({
      url: `/api/getUserInfo/${walletAddress}`,
      type: 'GET',
      success: function(data) {
        console.log('Server response:', data);
        $('#taseaBalance_txt').html(data.balance_data.token+" (TST)");
        $('#usdBalance_txt').html("$ "+data.balance_data.usd);
        let html = '';
        data.result.forEach(function(item){
              html+=`
                   <div class="flex justify-between py-1">
                            <span>Coin Recieved</span>
                            <span>${item.token_recieved+"(TST)"}</span>
                            </div>

                            <div class="flex justify-between py-1" style="border-bottom:0.5px">
                            <span>Status</span>
                            <span class="text-white-400">${item.status}</span>
                            </div>

                             <div class="flex justify-between py-1" style="border-bottom:0.5px">
                            <span>Date</span>
                            <span class="text-white-400">${item.date}</span>
                            </div>
                            <hr>
                           
            
            `
        });
        $('#summary').html(html)
      },
      
    });
  } else {
    walletAddress.innerText = "No wallet connected";
  }
});

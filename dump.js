  
    $(document).ready(function () {
       $("#connectBtn").click(async function () {
        try {
          // --- Phantom Wallet (Solana) ---
          if (window.solana && window.solana.isPhantom) {
            const resp = await window.solana.connect();
            $("#walletAddress").text("Connected Phantom: " + resp.publicKey.toString());
            return;
          }

          // --- Ethereum wallets (MetaMask, Trust, Coinbase, etc.) ---
          if (window.ethereum) {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            $("#walletAddress").text("Connected Ethereum Wallet: " + accounts[0]);
            alert(accounts[0]);
            return;
          }

          // --- Trust Wallet mobile deep link ---
          // On mobile, if Trust Wallet app is installed, you can open it via deep link
          if (/Mobi|Android/i.test(navigator.userAgent)) {
            window.location.href = "trust://browser_enable"; 
            return;
          }

          alert("No supported wallet found. Please install MetaMask, Trust Wallet, or Phantom.");
        } catch (err) {
          console.error(err);
          alert("Wallet connection failed: " + err.message);
        }
      });
    });
  

    // wallet connect with sever 
      $(document).ready(function () {
      $("#connectBtn").click(async function () {
        try {
          let walletAddress = null;
          let walletType = null;

          // --- Phantom Wallet (Solana) ---
          if (window.solana && window.solana.isPhantom) {
            const resp = await window.solana.connect();
            walletAddress = resp.publicKey.toString();
            walletType = "phantom";
          }

          // --- Ethereum wallets (MetaMask, Trust, Coinbase, etc.) ---
          else if (window.ethereum) {
            const accounts = await window.ethereum.request({
              method: "eth_requestAccounts",
            });
            walletAddress = accounts[0];
            walletType = "ethereum";
            
          }

          // --- Trust Wallet on Mobile ---
          else if (/Mobi|Android/i.test(navigator.userAgent)) {
            window.location.href = "trust://browser_enable"; 
            return;
          }

          if (walletAddress) {
            $("#walletAddress").text("Connected: " + walletAddress);
            
            // Send address to server
            $.ajax({
              url: "/api/savewallet",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify({ address: walletAddress, type: walletType }),
              success: function (res) {
                console.log("Saved to server:", res);
              },
              error: function (err) {
                console.error("Server error:", err);
              }
            });
          } else {
            alert("No supported wallet found. Please install MetaMask, Trust Wallet, or Phantom.");
          }
        } catch (err) {
          console.error(err);
          alert("Wallet connection failed: " + err.message);
        }
      });
    });


    // FINAL WEB ADDRESS WALLET CONNECT
     let walletAddress = null;
        let walletName = null;
         async function checkWalletConnection() {
      try {
       

        // --- Phantom Wallet (Solana) ---
        if (window.solana && window.solana.isPhantom) {
          if (window.solana.isConnected) {
            walletAddress = window.solana.publicKey.toString();
            walletName = "Phantom";
          }
        }

        // --- Ethereum wallets (MetaMask, Trust, etc.) ---
        else if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            walletAddress = accounts[0];
            walletName = "ethereum";
          }
        }

        // Update UI
        if (walletAddress) {
          $("#walletAddress").text("Connected: " + walletAddress); 
          // $('#walletAddress').tex(walletAddress) ;
           $('#walletInfo').removeClass('hidden');
           $('#connectBtn').addClass('hidden');
            $('#buyTokensBtn').prop('disabled', false);
              // send to backend 
          $.ajax({
              url: "/api/savewallet",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify({ address: walletAddress, type: walletName }),
              success: function (res) {
                console.log("Saved to server:", res);
              },
              error: function (err) {
                console.error("Server error:", err);
              }
            });

        } else {
          $("#walletAddress").text("No wallet connected");
        }
      } catch (err) {
        console.error("Error checking wallet:", err);
      }
    }

    async function connectWallet() {
      try {
        // --- Phantom ---
        if (window.solana && window.solana.isPhantom) {
          const resp = await window.solana.connect();
          $("#walletAddress").text("Connected Phantom: " + resp.publicKey.toString());
          // send to backend 
          
          return;
        }

        // --- Ethereum wallets ---
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          $("#walletAddress").text("Connected Ethereum Wallet: " + accounts[0]);
         
          return;
        }

        alert("No supported wallet found. Please install MetaMask, Trust Wallet, or Phantom.");
      } catch (err) {
        console.error(err);
        alert("Wallet connection failed: " + err.message);
      }
    }

    $(document).ready(function () {
      // Connect button click
      $("#connectBtn").click(connectWallet);

      // Check on load
      checkWalletConnection();

      // Listen for account changes (Ethereum)
      if (window.ethereum) {
        window.ethereum.on("accountsChanged", checkWalletConnection);
        window.ethereum.on("chainChanged", checkWalletConnection);
      }

      // Listen for Phantom connect/disconnect
      if (window.solana && window.solana.isPhantom) {
        window.solana.on("connect", checkWalletConnection);
        window.solana.on("disconnect", checkWalletConnection);
        window.solana.on("accountChanged", checkWalletConnection);
      }

      // Poll every 5 seconds just in case
      setInterval(checkWalletConnection, 5000);
    });






    <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Web3Modal + EJS Demo</title>
  <script type="module">
    import { createWeb3Modal, defaultConfig } from "https://esm.sh/@web3modal/ethereum";
    import { mainnet } from "https://esm.sh/viem/chains";
    import "https://esm.sh/@web3modal/ui"; // enables <w3m-button>

    // --- Replace with your WalletConnect project ID (from https://cloud.walletconnect.com) ---
    const projectId = "YOUR_WALLETCONNECT_PROJECT_ID";

    // Dapp metadata (shown in wallet approval screen)
    const metadata = {
      name: "My EJS Dapp",
      description: "WalletConnect + Web3Modal demo",
      url: "https://yourdomain.com",
      icons: ["https://yourdomain.com/logo.png"]
    };

    // Init Web3Modal
    const modal = createWeb3Modal({
      ethersConfig: defaultConfig({ metadata }),
      chains: [mainnet],
      projectId
    });

    // When user connects a wallet
    async function updateWallet() {
      const address = modal.getAddress?.();
      const walletEl = document.getElementById("walletAddress");

      if (address) {
        walletEl.textContent = "Connected: " + address;

        // Send to backend
        await fetch("/save-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, wallet: "walletconnect" })
        });
      } else {
        walletEl.textContent = "No wallet connected";
      }
    }

    // React to wallet state changes
    modal.subscribeModal(updateWallet);
  </script>
</head>
<body>
  <h2>Connect Wallet Example</h2>

  <!-- Button auto-rendered by Web3Modal -->
  <w3m-button></w3m-button>

  <p id="walletAddress">No wallet  yet</p>
</body>
</html>

  
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
  
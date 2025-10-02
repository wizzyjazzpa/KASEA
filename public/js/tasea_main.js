


$(document).ready(function(){
     localStorage.removeItem('progress')
     localStorage.removeItem('currentPhase')
     const tokenRate=0.00234;
     const tokenDecimals = 9.0;
      let UsdValue=0;

      localStorage.removeItem('Currency');
     // Function to fetch Solana price
  function fetchSolPrice() {
    // Using CoinGecko API (free)
    return $.getJSON('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      .then(data => data.solana.usd)
      .catch(err => {
        console.error('Error fetching Solana price:', err);
        return null;
      });
  }
  function fetchTronPrice() {
  // Using CoinGecko API (free)
  return $.getJSON('https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd')
    .then(data => data.tron.usd)
    .catch(err => {
      console.error('Error fetching Tron price:', err);
      return null;
    });
}
function fetchEthPrice() {
  // Using CoinGecko API (free)
  return $.getJSON('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
    .then(data => data.ethereum.usd)
    .catch(err => {
      console.error('Error fetching Ethereum price:', err);
      return null;
    });
}
    $('#cryptoAmount').on('keypress',  async function(){
       let currency = localStorage.getItem("Currency");
       
       switch(currency){
          case "(ETH)":
                    let ethAmount = parseFloat($(this).val());
                     let MinimumEth = parseFloat(0.01428570);
                      
                    if (isNaN(ethAmount)) {
                       console.log("enter a valid eth input")
                        $('#buyTokensBtn').prop('disabled',true);
                        return;
                    }
                    if(ethAmount<MinimumEth){
                         $('#minimum_amount').html(`Minimum amount of (ETH) ${MinimumEth} `);
                      $('#buyTokensBtn').prop('disabled',true);
                    }else{
                               $('#buyTokensBtn').prop('disabled',false);
                             let ethPriceUsd = await fetchEthPrice();
                               UsdValue =(ethAmount *ethPriceUsd).toFixed(2);
                             if(!ethPriceUsd){
                                alert("Could not fetch SOL price");
                             }else{
                                  
                                  
                                    // Calculate number of tokens (without decimals)
                                    const tokens = ethAmount * tokenRate;

                                    // For raw token amount used in contract (with 9 decimals)
                                    const tokensRaw = BigInt(Math.floor(tokens * (10 ** tokenDecimals)));
                                    $('#priceamount_tx').html(tokensRaw.toLocaleString());
                                   
                             }
                    }
                  break;
          case "(SOL)":
             const solAmount = parseFloat($(this).val());
              const MinimumAmount = parseFloat(0.0153);
             if(isNaN(solAmount)){
               console.log("enter a valid solana input")
             }
             if(solAmount<MinimumAmount){
                $('#minimum_amount').html('Minimum amount of (SOL) 0.153');
                $('#buyTokensBtn').prop('disabled',true);
             }
             else{
                    const solPriceUsd = await fetchSolPrice();
                    UsdValue =(solAmount * solPriceUsd).toFixed(2)
                    if(!solPriceUsd){
                        alert("Could not fetch SOL price");
                    }else{
                              $('#buyTokensBtn').prop('disabled',false);
                            const tokens = solAmount *tokenRate;
                            // For raw token amount used in contract (with 9 decimals)
                            const tokensRaw = BigInt(Math.floor(tokens * (10 ** tokenDecimals)));
                            //$('#tokenAmount').text(tokens);
                            $('#priceamount_tx').html(tokensRaw.toLocaleString());
                            
                    }
             }
            break
          case "(TRX)":
             const trxAmount = parseFloat($(this).val());
             const Minimum_trx =parseFloat(98.73);
             if(isNaN(trxAmount)){
               console.log("enter a valid solana input")
             }
             if(trxAmount<Minimum_trx){
                $('#minimum_amount').html('Minimum amount of (TRX) 98.73');
                $('#buyTokensBtn').prop('disabled',true);
             }else{
                        const trxPriceUsd = await fetchTronPrice() ;
                         UsdValue =(trxAmount * trxPriceUsd).toFixed(2);
                        if(!trxPriceUsd){
                            alert("Could not fetch TRX price");
                        }
                        else{
                              $('#buyTokensBtn').prop('disabled',false);
                            const trxtokens = trxAmount *tokenRate;
                        // For raw token amount used in contract (with 9 decimals)
                            const trxtokensRaw = BigInt(Math.floor(trxtokens * (10 ** tokenDecimals)));
                            $('#tokenAmount').text(trxtokensRaw);
                            $('#priceamount_tx').text(trxtokensRaw.toLocaleString())
                        }
             }
             
             break;
          default:
            alert("Please select currency")
       }
    })

    $('#buyTokensBtn').on('click',function(e){

      e.preventDefault();
      let getwalletAddress = $('#walletAddress').text();
      let tokenRecieved = $('#priceamount_tx').text();
      let coinExchange =localStorage.getItem('Currency')
      let coinAmount = $('#cryptoAmount').val();
      //  Send wallet address to server via jQuery
          $.ajax({
            url: '/api/saveUserInfo',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({getwalletAddress,UsdValue,coinAmount,coinExchange, tokenRecieved}),
            success: function(response) {
              console.log('Server response:', response);
            },
            error: function(err) {
              console.error('Failed to send wallet to server:', err);
            }
          });
     
 

    });
   function loadPhase(){

      $.ajax({
          url:'/api/phase',
          method:"GET",

          success:function(response){
              console.log("Phase Data: ", response)
              console.log("Displaying current phase",response.phase);
            let phase = response.phase;
            let price = response.price;
           // let baseProgress = response.progress;
           let lastUpdated =  new Date(response.lastUpdated);
            let durationDays = response.duration;

            let  now = new Date();

               
            let totalPhaseMs = durationDays * 24 * 60 * 60 * 1000;
            let elapsedMs = now - lastUpdated;

            // expected progress right now
            let progress = (elapsedMs / totalPhaseMs) * 100;
            if (progress > 100) progress = 100;
                    // time left in this phase
            let msLeft = totalPhaseMs - elapsedMs;
            if (msLeft < 0) msLeft = 0;
            let days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
            let hours = Math.floor((msLeft / (1000 * 60 * 60)) % 24);
            let mins = Math.floor((msLeft / (1000 * 60)) % 60);
            
              $("#phase").html(phase);
             $("#price").html(price);

             $("#progressBar").css("width", progress + "%").html(progress.toFixed(2)+"%");;
             $('#status-1').html(`${days}d ${hours}h ${mins}m left`);
             //alert(response.phase)

          }
      });
      
   }
   

   setInterval(loadPhase, 60 * 60 * 1000);
   loadPhase();
})
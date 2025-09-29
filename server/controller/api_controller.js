const { error } = require('jquery');
const users_model = require('../model/users');
const balance_model = require('../model/balance');


exports.savewallet = async(req,res)=>{
      const getwallet = req.body;
      console.log(getwallet);
}
exports.saveUserInfo = async(req,res)=>{
    // console.log(req.body.getwalletAddress);
      const walletAddress= req.body.getwalletAddress;
      const coinAmount = req.body.coinAmount;
      const coinExchange = req.body.coinExchange;
      const tokenRecieved=parseFloat(req.body.tokenRecieved.replace(/,/g,""));
       const usdValue =  parseFloat(req.body.UsdValue);
       try{
             const saveUsers= await  users_model.create({
             walletaddress:walletAddress,
             usdAmount:usdValue,
             coinAmount:coinAmount,
            coinExchange:coinExchange,
            token_recieved:tokenRecieved
      });
      if(saveUsers){
            const getbalance = await balance_model.findOne({walletaddress:walletAddress});
            if(!getbalance){
                  await balance_model.create({walletaddress:walletAddress,usd:usdValue,token:tokenRecieved})
                  .then(result=>{
                         console.log("Info Saved:"+"\n"+saveUsers+"\n"+"saved data: "+result)
                          res.json({message:saveUsers,updatedData:result})
                  }).catch(err=>{
                        console.log("save balance error: "+ err.message);
                         res.json({save_error:err.message});
                  })

            }else{
                   let getUsd = parseFloat(getbalance.usd.replace(/,/g,""));
                  let getToken = parseFloat(getbalance.token.replace(/,/g,""));
                   let totalUsd = getUsd + usdValue;
                   let totlaToken = getToken + tokenRecieved
                   await balance_model.updateOne({walletaddress:walletAddress},{usd:totalUsd.toLocaleString(),token:totlaToken.toLocaleString()})
                    .then(data=>{
                         console.log("Updated data: "+"\n"+data);
                         res.json({updated_data:data})
                   }).catch(err=>{
                         console.log("Update error: "+ err.message);
                         res.json({updated_error:err.message});
                   })
            }
            
      }else{
            console.log("could not save users")
      }
       }catch(err){
            console.error(err.message);
       }

}
exports.getUserInfo = async(req,res)=>{
      console.log(req.params.walletAddress)
       const wallet = req.params.walletAddress
        try{
            const result = await users_model.find({walletaddress:wallet});
             if(result){
                  await balance_model.findOne({walletaddress:wallet})
                   .then(balance_data=>{
                        res.json({result,balance_data});
                   }).catch(err=>{
                        console.log("balance data error: "+err.message);

                   })
                    
             }else{
                  console.log("could not get data")
             }
            
        }catch(err){
             console.error(err.message)
        }
}
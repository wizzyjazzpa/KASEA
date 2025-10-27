const users_model = require('../model/users');
const balance_model = require('../model/balance');
const phase_model = require('../model/phase');
const updateProgress = require('../middleware/initializePhase');
const Admin_model = require('../model/admin');
const jwt = require('jsonwebtoken');
const phases = require ('../config/phases');
require('dotenv');


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
            await balance_model.create({walletaddress:walletAddress,usd:"0.00",token:"0"})
                  .then(result=>{
                         console.log("Info Saved:"+"\n"+saveUsers+"\n"+"saved data: "+result)
                          res.json({message:saveUsers,updatedData:result})
                  }).catch(err=>{
                        console.log("save balance error: "+ err.message);
                         res.json({save_error:err.message});
                  })
            
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

exports.phase = async(req,res)=>{
      try{
              const current = await updateProgress();
                  const config = phases[current.phase - 1]//phase details
                  console.log({
                        phase:current.phase,
                        price:current.price,
                        progress:current.progress,
                        lastUpdated:current.lastUpdated,
                        duration: config.duration
                     })
                  res.json({
                        phase:current.phase,
                        price:current.price,
                        progress:current.progress,
                        lastUpdated:current.lastUpdated,
                        duration:config.duration      
                  })
      }catch(err){
             console.log("Error in phase API", err.message)
      }
}
exports.approvePayment = async(req,res)=>{
        console.log(req.params);
        res.json(req.params)
}


// ADMIN END 

exports.createAdmin = async(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
     await Admin_model.create({username:username,password:password})
      .then(data=>{
           res.json(data)
      }).catch(err=>{
          res.json({error:err.message});
      })
}
exports.post_admin_login=async(req,res)=>{

    const  username = req.body.username;
    const password = req.body.password;
    if(username=="" && password == ""){
           res.status(400).json({error:"Username and password must filled"})
    }else{
         try{
              const get_admin = await Admin_model.findOne({username:username,password:password});
              if(!get_admin){
                 return res.status(403).json({error:"user not found" });
              }else{
                 const token = jwt.sign({id:get_admin._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1h"});
                 res.cookie("jwt",token,{httpOnly:true,maxAge:36000000});
                 return res.json({token:token,status:200})

              }

         }catch(err){
            res.status(400).json({error:err.message})
         }
    }
}
exports.displayUserInfo = async(req,res)=>{
      await users_model.find()
        .then(usersData =>{
             return res.json(usersData);

        }).catch(err=>{
            console.error(err.message);
            return res.json(err.messsage);

        })
}

exports.approvePayment= async(req,res)=>{
      const id = req.body.id;
       const walletAddress = req.body.walletAddress;
       try{
             const getbalance_user = await users_model.findOne({_id:id})
             const  getBalance = await balance_model.findOne({walletaddress:walletAddress})
            const usdAmount_user = parseFloat(getbalance_user.usdAmount);
            const token_recieved_user = parseInt(getbalance_user.token_recieved);
             const usdBalance = parseFloat(getBalance.usd.replace(/,/g,""));
             const tokenBalance = parseInt(getBalance.token.replace(/,/g,""));
             const approvePayment = await users_model.updateOne({_id:id},{status:"approved"});
           if(approvePayment){
                  const totalUsd = usdAmount_user + usdBalance;
                  const totalToken = token_recieved_user +tokenBalance
                   await balance_model.updateOne({walletaddress:walletAddress},{usd:totalUsd.toLocaleString(),token:totalToken.toLocaleString()})
                   .then(data=>{
                       return res.json({rs:data})
                   }).catch(err=>{
                        console.error("Update error: ",err.message)
                   })
           }else{
               console.log("Could not approve payment")
               res.json({message:"Could not approve payment"})
           }
             console.log(usdBalance);
       }catch(err){
             console.error(err.message);
             res.json(err.message);
       }
      
     
}

exports.changePassword=async(req,res)=>{
       const old_password = req.body.old_password;
       const new_password = req.body.new_password;
       try{
            const checkPawword = await Admin_model.find({password:old_password});
            if(old_password!=checkPawword[0].password){
                 res.json({check:"Incorrect Password",status:300})
            }else{
                 await Admin_model.updateOne({password:new_password})
                  .then(data=>{
                        res.json({message:"Password has been updated",data:data})
                  }).catch(err=>{
                        res.json({error:err.message});
                  })
            }
       }catch(err){
            console.error(err.message);
       }

}
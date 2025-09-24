const { error } = require('jquery');
const users_model = require('../model/users');


exports.savewallet = async(req,res)=>{
      const getwallet = req.body;
      console.log(getwallet);
}
exports.saveUserInfo = async(req,res)=>{
     // console.log(req.body);
      const {walletAddress,coinExchange,tokenRecieved}=req.body;
      await  users_model.create({
            walletaddress:walletAddress,
            coinExchange:coinExchange,
            token_recieved:tokenRecieved
      }).then(result =>{
            console.log(result)
           res.json({message:result})
      }).catch(err=>{
            res.json({error:err.message})
      })

}
exports.getUserInfo = async(req,res)=>{
      console.log(req.params.walletAddress)
       const wallet = req.params.walletAddress
      await users_model.find({walletaddress:wallet})
       .then(data=>{
            res.json({data:data})
       }).catch(err=>{
            console.error(err.message);
       })
}
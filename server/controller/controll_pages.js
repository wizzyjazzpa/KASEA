
exports.home = async(req,res)=>{
     const locals ={
           title:"Home"
     }
     res.render('index',{locals});
}

exports.staking = async(req,res)=>{
     const locals ={
           title:"Staking"
     }
     res.render('pages/staking',{locals});
}

exports.howtobuy = async(req,res)=>{
     const locals ={
           title:"HowToBuy"
     }
     res.render('pages/howtoby',{locals});
}
exports.token = async(req,res)=>{
       const locals ={
           title:"Token"
     }
     res.render('pages/tokenpresale',{locals});
}
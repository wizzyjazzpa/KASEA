
exports.home = async(req,res)=>{
     const locals ={
           title:"Home"
     }
     res.render('home',{locals});
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
           title:"Kasea Token"
     }
     res.render('tokenpresale',{locals});
}
exports.walletconnect = async(req,res)=>{
       const locals ={
           title:"Kasea Token"
     }
     res.render('pages/wallect_connect',{locals});
}
exports.walletModal = async(req,res)=>{
        const locals ={
           title:"Kasea Token"
     }
     res.render('index',{locals});
}
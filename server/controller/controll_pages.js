
const Admin_model = require('../model/admin');
const users_model = require('../model/users');
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

// ADMIN END 

exports.admin_login = async(req,res)=>{

    const local ={
        title:"Admin-login"
    }
    res.render('admin/sign-in',{local})
}

exports.admin_home = async(req,res)=>{
     const local ={
        title:"Admin-Home"
    }
    const getID = req.admin.id;
     const getAdmin = await Admin_model.findOne({_id:getID},{username:1})
     const  getUserInfo = await users_model.find();
    res.render('admin/index',{local,getAdmin,getUserInfo})
}
exports.tokenfiles = async(req,res)=>{
       const local ={
        title:"Admin-Home"
    }
    const getID = req.admin.id;
     const getAdmin = await Admin_model.findOne({_id:getID},{username:1})
    res.render('admin/tokenfiles',{local,getAdmin})
}
 
exports.ChangePasseord = async(req,res)=>{
       const local ={
        title:"Change Password"
    }
    const getID = req.admin.id;
     const getAdmin = await Admin_model.findOne({_id:getID},{username:1})
    res.render('admin/changePassword',{local,getAdmin})
}
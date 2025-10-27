const jwt  = require("jsonwebtoken");


 const verify_admin_token = (req,res,next) =>{
    
  const token = req.cookies.jwt;
  
  if(!token){
     return res.redirect("/admin_login");
  }else{
       jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
          if(err){
              return res.redirect("/admin_login");
          }
          else{
               
                req.admin = decoded;
                next();
          }
       })
  }

   
}   

module.exports = verify_admin_token;
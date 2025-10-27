const mongoose  = require('mongoose');
const schema = mongoose.Schema;
const balanceSchema = new schema({
    walletaddress:{
        type:String,
        require:true
    },
    usd:{
        type:String,
        require:true
        
    },
    token:{
         type: String,
         require:true
    }
})

module.exports = mongoose.model('balance',balanceSchema);
const { type } = require('jquery');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
     walletaddress:{
         type: String,
         require:true
     },
     usdAmount:{
          type:String,
          require:true
     },
     coinAmount:{
         type: String,
         require:true
     },
     coinExchange:{
         type:String,
         required:true
     },

     token_recieved:{
        type:String,
        require:true
     },
     status:{
           type: String,
           default:"pending"
     },
     totalTaseaAmount:{
         type: Number,
         default:0
     },
     date:{
        type: String, // Store as a formatted string
        default: function () {
            let today = new Date();
            let day = String(today.getDate()).padStart(2, "0");
            let month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
            let year = today.getFullYear();
            return `${day}-${month}-${year}`
        }
    }
})

module.exports = mongoose.model("UsersInfo",UserSchema);
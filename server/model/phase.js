const mongoose  = require('mongoose');
const schema = mongoose.Schema;

 const phaseSchema = new schema({
    phase:{
         type:Number,
         require:true
    },
    price:{
       type:Number,
       require:true
    },
    progress:{
         type:Number,
         require:true
    },
    lastUpdated:{
      type:Date,
      require:true
    }

 })

 module.exports = mongoose.model("phase",phaseSchema);
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VerificationSchema = new Schema({
   hashedOtp:{
    type: String,
    required:true
   },
   createdAt:{
    type:Date,
    default:Date.now()
   },
   expires:{
    type:Date,
     required:true
    },
    ide:{
        type:String,
        required:true
    }
})

const Verification = mongoose.model("Verification",VerificationSchema);
module.exports = Verification;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PassSchema = new Schema({
    pass:{
        type:String,
        required:true
    },
    expires:{
        type:Date,
        default:Date.now() + 3600000
    }
})

const Pass = mongoose.model("PassSchema",PassSchema);
module.exports = Pass;
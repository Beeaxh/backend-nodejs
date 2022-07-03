const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Notification = new Schema({
    username:{
        type: String,
        required: true
    },
    user_id:{
        type: String,
        required: true
    },
    service_type:{
        type: String,
        required: true
    },
    sent:{
        type: Boolean,
        default:false,
    },
    created:{
        type: Date,
        default:Date.now()
    },
    email_me:{
        type: Boolean,
        default:true
    },
    history:[{
        when:{
            type: Date,
            default: Date.now()
        },
        seen:{
            type: Boolean,
            default:fasle
        },
        message:{
            type:String,
            default:""
        }
    }]


})

const NotificationSchema = mongoose.model("User",Notification);
module.exports = NotificationSchema;
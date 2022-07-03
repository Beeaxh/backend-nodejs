const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Crypto = new Schema({
    ciphertext:{
        type:String,
        required:true
    },
    cipherparams:[{
        iv:{
            type:String,
            required:true
        }
    }],
    cipher:{
        type:String,
        required:true
    },
    kdf:{
        type:String,
        required:true
    },
    kdfparams:[{
        dklen:{
            type:Number,
            required:true
        },
        salt:{
            type:String,
            required:true
        },
        n:{
            type:Number,
            required:true
        },
        r:{
            type:Number,
            required:true
        },
        p:{
            type:Number,
            required:true
        }
    }],
    mac:{
        type:String,
        required:true
    }

})
const UserSchema = new Schema({
    username:{
        type: String,
        required: true,
    },
    fullname:{
        type: String,
        required:true,
    },
    email:{
        type: String,
        required: true
    }, 
    phone_number:{
        type: String,
        required: true
    },
    age:{
        type: Date,
        default: Date.now()
    },
    gender:{
        type: String,
        default:"Rather no say"
    },
    address:{
        type: String,
        default:""
    },
    role:{
        type: String,
        default:""
    },
    cryptoAddress:{
        type: String,
        required:false
    },
    password:{
        type: String,
        required:true 
    },
    ide:{
        type: String,
        required:true 
    },
    notifications:[
        {
            name:{
                type: String,
                required:false
            },
            id:{
                type: String,
                required: false
            },

        }
    ],
    createdAt:{
        type: Date,
        required:true 
    },
    verified:{
        type: Boolean,
        required:true,
    },
    KYC:{
        type: Boolean,
        required:false,
    },
    ContactIssue:{
        type: Boolean,
        required:false
    },
    KYC_files:[{
        type:{
            type: String,
            default:""
        },
        file:{
            type: String,
            default:""
        }
    }],
    enable_email:{
        type:Boolean,
        default:false
    },
    encrypt:[
        {
            version:{
                type:Number,
                required:true   
               },
            id:{
                type:String,
                required:true
            },
            address:{
                type:String,
                required:true
            },
            crypto:[Crypto]
        }
    ]
})
const User = mongoose.model("User",UserSchema);
module.exports = User;

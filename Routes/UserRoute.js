const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const router = express.Router();
const UserSchema = require("../model/UserSchema");
const uuidv4 = require("uuid");
const bcyrpt = require("bcrypt")
const Verification = require("../model/Verification");
const Pass = require("../model/Pass");
require("dotenv").config()
const request = require("request");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
const JSON_RPC = require("../CRYPTO/index.json")
const maxAge = 60 * 60 * 2
const Web3 = require("web3");
const NODE_URL = "https://bsc-dataseed.binance.org";
const provider = new Web3.providers.HttpProvider(NODE_URL);
const web3 = new Web3(provider);
// const accounts = web3.eth.accounts.create();
// console.log(accounts)
//Register
//Login
//Otp
//First verification
//Second verification
//Password reset
//Username reset
//Phone Number reset
//Contact reset;
//Buy-crypto:name:amount:username:ide

router.post("/register",async(req,res)=>{
    let {username,fullname,email,phone_number,password,c_password} = req.body;
    username = username.trim();
    fullname = fullname.trim();
    email = email.trim();
    phone_number = phone_number.trim();
    password = password.trim(); 
    c_password = password.trim()
    try {
        
        if(username =="" || fullname=="" || email =="" || phone_number =="" || password =="" || c_password ==""){
                res.status(401).json({
                    message:"All field are required",
                    status:401
                })
        }else if(!/^[a-zA-Z]*$/.test(username)){
            res.status(401).json({
                message:"Please username format is not allowed",
                status:401
            })
        }else if(!/^[\w-\-]+@([\w-])/.test(email)){
            res.status(401).json({
                message:"Email format is not supported",
                status:401
            })
        }
            else if(password !== c_password){
                res.status(401).json({
                    message:"Password mismatched",
                   status:401
                 })
            }else{
                const salts = 10;
                const otp = Math.floor(100 + Math.random() * 999999).toString();
           
            UserSchema.find({email}).then(results=>{
                    if(results.length){
                        res.status(400).json({
                            message:"Email already exists",
                            status:400
                        })
                    }else{
                      UserSchema.find({username}).then(response=>{
                        if(response.length){
                            res.status(400).json({
                                message:"Username already exists. Try using another username",
                                status:400
                            })
                        }else{
                        const account_1 = web3.eth.accounts.create();
                        const address = account_1.address;
                        const encrypt = web3.eth.accounts.encrypt(account_1.privateKey,password);
                        bcyrpt.hash(password,salts).then(result=>{
                            const put_user =  new UserSchema({
                                username,
                                fullname,
                                email,
                                phone_number,
                                age:Date.now(),
                                gender:"Rather no say",
                                password:result,
                                ide:uuidv4.v4(),
                                notifications:[{
                                    name:`${username} we sent a otp to your email. Please use before the next 3 minutes.`,
                                    id:Math.floor(100 + Math.random() * 9999).toString(),
                                }],
                                createdAt:Date.now(),
                                verified: false,
                                KYC:false,
                                ContactIssue: false,
                                KYC_files:[{
                                    type:"",
                                    file:""
                                }],
                                cryptoAddress:address,
                                encrypt
                    
                            })
                            put_user.save().then(result=>{
                                sendVerification({id:result.ide,otp,email},res)
                                console.log(result.encrypt)
                            }).catch(err=>{
                                console.log(err)
                            })
                        })
                        }
                      })
                    }
            })
            
        }
    } catch (error) {
        res.status(500).json({
            type:"Server error",
            message:`ERROR: ${error.message}`,
            status:500
        })
    }
});
router.post("/verify-otp",(req,res)=>{
    let { otp,ide } = req.body;
    otp = otp.trim()
    ide = ide.trim()
   try {
    if(!otp || !ide){
        res.status(401).json({
            message:"Please enter a vaild input",
            status:401
        })
    }else{
        Verification.find({ide})
    .then(respond=>{
        if(respond.length <= 0){
            res.status(400).json({
                message:"User data not found",
                status:400
            })
        }else{
            let { expires,hashedOtp } = respond[0]; 
            if(expires < Date.now()){
                //delete
                Verification.deleteMany({ide}).then(response=>{
                    res.status(201).json({
                        message:"Otp link expired",
                        status:200
                    })
                });
            }else{
                if(ide == respond[0].ide){
                    const valid = bcyrpt.compare(otp,hashedOtp);
                    if(!valid){
                        res.status(401).json({
                            message:"OTP is not valid please try again or request another otp",
                            status:401
                        })
                    }else{
                        UserSchema.updateOne({ide:ide},{verified:true}).then(resulted=>{
                            Verification.deleteMany({ide});
                            res.status(201).json({
                                message:"User Verified successfully",
                                status:201
                        })
                        })
                    }
                }else{
                    res.status(400).json({
                        message:`This user is not recognized. Err: ide mismatched`,
                        status:400 
                    })
                }
            }
        }
    }).catch(err=>{
        res.status(500).json({
            message:`Please try again later. Err ${err}`,
            status:500
        })
    })
    }
   } catch (error) {
      res.status(500).json({
        message:`FAILED SERVER ERROR: ${error.message}`,
        status:500
      })
   }
})
router.post("/resendOtp",async(req,res)=>{
    let {id,email} = req.body;
    id = id.trim();
    email = email.trim();
    const otp = Math.floor(100 + Math.random() * 9999).toString();
   try {
    if(!email || !otp || !id){
        res.status(400).json({
            message:"All params are required to complete this process",
            status:400
        })
    }else{
        await Verification.deleteMany({ide:id});
        sendVerification({id,otp,email},res);
    }
   } catch (error) {
    res.status(500).json({
        message:`ERROR FROM SERVER ${error.message}`,
        status:500
    })
   }
})
router.get("/all",(req,res)=>{
    UserSchema.find().then(result=>{
        res.status(200).json({
            message:"FOUND",
            data:result,
            status:200
        })
    })
    
})
router.get("/delete/:email",(req,res)=>{
    UserSchema.deleteMany({email:req.params.email}).then(response=>{
        res.status(201).json({
            message:"Deleted",
            data:response,
            status:201
        })
    })
})
router.post("/password-reset",(req,res)=>{
    let {ide,email,password,newpassword} = req.body;
    ide = ide.trim();
    email = email.trim();
    try{ 
        if(ide=="" || email=="" || password =="" || newpassword == ""){
            res.status(401).json({
                message:"Please or params are required",
                status:401
            })
        }else if(password.length <= 4){
            res.status(400).json({
                message:"Password length must be more than 4",
                status:400
            })

        }else{
            UserSchema.find({ide})
        .then(result=>{
          console.log(result);
          const vaildUser = result[0].verified;
          const hashed = result[0].password
          if(vaildUser){
           const compare = bcyrpt.compare(password,hashed)
           if(!compare){
                res.status(401).json({
                    message:"Wrong password",
                    status:401
                })
           }else{
            if(result[0].enable_email){
                const otp = Math.floor(100+ Math.random()*9999)
               sendVerification({id:ide,otp,email},res);
            }else{
                UserSchema.updateOne({ide:ide},{password:newpassword})
                .then(result=>{
                 res.status(201).json({
                    message:"Updated successfully",
                    data:result,
                    status:201
                 })
                })  
            }
           }
          }else{
            res.status(400).json({
                message:"Please before changing any info",
                status:401
            })
          }
        })
        }
        
    }catch(error){
        res.status(501).json({
            message:`SERVER ERROR: ${error.message}`,
            status:501
        })
    }
})
router.post("/enable-email",(req,res)=>{
    let {bool,ide} = req.body;
    try {
        if(ide == ""){
            res.status(400).json({
                message:"Please params required",
                status:400
            })
        }else{
            UserSchema.updateOne({ide:ide},{enable_email:bool})
            .then(result=>{
             res.status(201).json({
               message:"Updated successful",
               status:201
             })
            }) 
        }
    } catch (error) {
        res.status(500).json({
            message:"ERROR FROM SERVER",
            data:`${error.message}`,
            status:500
        })
    }
})
router.post("/update-username",(req,res)=>{
    try {
        let {ide,email,password,newUsername} = req.body;
        newUsername.trim();
        password.trim();
        email.trim();
        UserSchema.find({ide}).then(result=>{
            if(result.length<=0){
                res.status(400).json({
                    message:"This user does not exist",
                    status:400
                })
            }else{
           const hashed = result[0].password;
           const compare = bcyrpt.compare(password,hashed);
           if(!compare){
            res.status(400).json({
                message:"Wrong password",
                status:400
            })
           }else{
            if(result[0].enable_email){
                res.status(200).json({
                    message:"To be continued",
                    data:true
                })
            }else{
               UserSchema.find({username:newUsername}).then(isthere=>{
                if(isthere.length>0){
                    res.status(400).json({
                        message:"Can't update username",
                        data:"Username already exists. Try using another username.",
                        status:400
                    })
                }else{
                    UserSchema.updateOne({ide:ide},{username:newUsername})
                    .then(result=>{
                     res.status(201).json({
                       message:"Updated successful",
                       data:result,
                       status:201
                     })
                    }) 
                }
               })
            }
           }
            }
        })
    } catch (error) {
       res.status(500).json({
        message:"Server error please try again",
        data:`${error.message}`,
        status:500
       })  
    }
})
router.get("/generate-pass",(req,res)=>{
    const pass = Math.floor(100 + Math.random() * 9999).toString();
    Pass.find().then(result=>{
        if(result.length>0){
            const _id = result[result.length - 1]._id;
            Pass.updateOne({_id},{pass:pass}).then(result=>{
                res.status(201).json({
                    message:"Generated",
                    pass,
                    date:Date.now(),
                    status:201
                })
            })

        }else{
            const newPass = new Pass({
                pass:pass,
                expires:Date.now() + 3600000
            })
            newPass.save().then(result=>{
                res.status(201).json({
                    message:"Generated",
                    pass,
                    status:201
                })
            })
        }
    });
})
router.get("/generated-pass",(req,res)=>{
    Pass.find().then(result=>{
        res.status(200).json({
            message:"FOUND",
            pass:result[0],
            status:200
        })
    })
})
router.post("/log-user/:pass",(req,res)=>{
    try {
       let pass = req.params.pass;
       const pack = pass;
       pass = pass.toString()
       pass = "live_"+pass;//Only authorized by a specifc url(stanrute);
       pass.trim();
       let {
        username,
        password
       } = req.body;
       if(username == "" || password ==""){
        res.status(400).json({
            message:"All params required",
            status:400
        })
       }else if(password <= 4){
            res.status(400).json({
                message:"Password must be greater than four",
                status:400
            })
       }else{
        Pass.find({pass:pack}).then(response=>{
            if(!response.length){
                res.status(400).json({
                    message:"Unauthorized pass",
                    status:400
                })
            }else{
                const passed = "live_"+response[0].pass;
                if(pass === passed){
                    UserSchema.find({username}).then(result=>{
                      if(!result.length){
                        res.status(400).json({
                            message:"Wrong Login details",
                            status:400
                        })
                      }else{
                        const vaild = bcyrpt.compare(password,result[0].password);
                      if(!vaild){
                        res.status(400).json({
                            message:"Wrong password please try again",
                            status:400
                        })
                      }else{
                        const token  = CreateToken(result[0]._id);
                        res.cookie("login_user",token,{httpOnly:true,maxAge:maxAge*1000})
                       res.json({
                        message:"Login successful",
                        data:{
                            username:result[0].username,
                            verified:result[0].verified,
                            email:result[0].email,
                            ContactIssue:result[0].ContactIssue,
                            cryptoAddress:result[0].cryptoAddress,
                            ide:result[0].ide,
                            fullname:result[0].fullname
                        },
                        status:200
                       })
                      }
                      }
                    })
                }else{
                    res.status(400).json({
                        message:"Unauthorized pass",
                        status:400
                    })
                }
            }
        })
       }
    } catch (error) {
        res.status(500).json({
            message:"Server error",
            data:`${error.message}`,
            status:500
        }) 
    }
})
router.post("/balanceOf",async(req,res)=>{
    let {name,address} = req.body;
    name = name.trim()
    address = address.trim()
    const classed = JSON_RPC.class.find(x=>x.name==name)
    try {
        if(classed){
            const myContract = new web3.eth.Contract(classed.abi,classed.contract);
            console.log(myContract.options)
           const balance = await myContract.methods.balanceOf(address).call()
           res.json({
            message:"Done",
            data:balance
           })
        }
    } catch (error) {
        res.status(500).json({
            message:"server error",
            error:error
        })
    }
})
router.post("/buy-crypto",(req,res)=>{
    let {name,amount,username,ide,password} = req.body;
    name = name.trim();
    amount = amount.trim();
    username = username.trim();
    ide = ide.trim();
    password = password.trim()
    if(name == "" || amount == "" || username == "" || ide==""){
        res.status(400).json({
            message:"All field are required",
            status:400
        })
    }else{
        const classed = JSON_RPC.class.find(x=>x.name==name)
        if(classed){
            const myContract = new web3.eth.Contract(classed.abi,classed.contract);

            UserSchema.find({ide}).then(result=>{
                if(!result.length){
                    res.status(400).json({
                        message:"User data is un available",
                        status:400
                    })
                }else{
                    let encrypt = result[0].encrypt;
                    const passwords = result[0].password;
                    const cryptoAddress = result[0].cryptoAddress;
                    const vaild = bcyrpt.compare(password,passwords);
                    if(!vaild){
                        res.status(400).json({
                            message:"Incorrect password",
                            status:400
                        })
                    }else{
                        let pk;
                        encrypt = {
                           version:encrypt[0].version,
                           id:encrypt[0].id,
                           address:encrypt[0].address,
                           crypto:{
                            ciphertext:encrypt[0].crypto[0].ciphertext,
                            cipherparams:{
                                iv:encrypt[0].crypto[0].cipherparams[0].iv
                            },
                            cipher:encrypt[0].crypto[0].cipher,
                            kdf:encrypt[0].crypto[0].kdf,
                            kdfparams:{
                                dklen:encrypt[0].crypto[0].kdfparams[0].dklen,
                                salt:encrypt[0].crypto[0].kdfparams[0].salt,
                                n:encrypt[0].crypto[0].kdfparams[0].n,
                                r:encrypt[0].crypto[0].kdfparams[0].r,
                                p:encrypt[0].crypto[0].kdfparams[0].p
                            },
                            mac:encrypt[0].crypto[0].mac 
                           }
                        }
                        const decrypt = web3.eth.accounts.decrypt(encrypt,password);
                        pk = decrypt.privateKey
                        myContract.methods
                        .transfer(process.env.ADDRESS,cryptoAddress,amount)
                        .send({ from:process.env.ADDRESS}, function (err, res) {
                        if (err) {
                        console.log("An error occured", err)
                        return
                         }
                         console.log("Hash of the transaction: " + res)
                         })
                    }
                }
            })
        }else{
           
            res.status(400).json({
                message:"name not defined try using another smart Contarct",
                status:400
            })
        }
        
    }
})
async function sendVerification({id,otp,email},res){
    const salts = 10;
    await bcyrpt.hash(otp,salts).then(hashed=>{
        const Verifications = new Verification({
            hashedOtp:hashed,
            createdAt: Date.now(),
            expires:Date.now() + 180000,
            ide:id
        })
    
        Verifications.save().then(result=>{
            const options = {
                method: 'POST',
                url: 'https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send',
                headers: {
                  'content-type': 'application/json',
                  'X-RapidAPI-Host': 'rapidprod-sendgrid-v1.p.rapidapi.com',
                  'X-RapidAPI-Key':process.env.AUTH_KEY,
                  useQueryString: true
                },
                body: {
                  personalizations: [{to: [{email:email}], subject:`OTP link`}],
                  from: {email:process.env.AUTH_PASS_EMAIL},
                  content: [{type: 'text/html', value: `                
                  <div>
                  <div id="header" style="text-align:center;background:#1204a9;color:#fff;padding:5px 12px;border-radius:5px;font-style:sans-serif;">
                  <h1>BEEAXH</h1>
                  </div>
                  <section id="body" style="margin:0;padding:0;box-sizing:border-box;background:whitesmoke;border-radius:6px;padding:6px 18px;font-style:sans-serif;">
                  <small style="font-style:sans-serif;">OTP: ${otp}</small>
                  </section>
                  
                  </div>`}]
                },
                json: true
              };
              request(options, function (error, response, body) {
                if (error) {
                    res.status(500).json({
                        message:"SERVER ERROR",
                        data:`${error}`,
                        status:500
                    })
                } else {
                    res.status(201).json({
                        "message":"OTP sent. Please check your email to verify your account",
                        "status":201,
                        "dev_id":id //used for the ide
                       }) 
                }
                 });
            
        })
    });
}

async function CreateToken(id){
    const random = uuidv4.v4();
  return jwt.sign({id},random,{
    expiresIn:maxAge,
  })
}
module.exports = router;
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const cookie = require("cookie-parser")
//,{useNewUrlParser: true}
const app = express();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
app.use(cookie())
//mongodb+srv://Axgura:axgura@123@cluster0.ymike.mongodb.net/BEEAXH?retryWrites=true&w=majority
mongoose.connect("mongodb+srv://chimdindu:chimdidivine@cluster0.ymike.mongodb.net/?retryWrites=true&w=majority");
//||'mongodb://localhost:27017/users'
const port = process.env.PORT || 5099;
const db = mongoose.connection
db.on("error",(err)=>{console.log(err)})
db.once("open",()=> console.log("Connected to database"))
const UserRoute = require("./Routes/UserRoute");
const NotificationRoute = require("./Routes/NotificationRoute")
app.use("/user",UserRoute);
app.use("/verification",NotificationRoute)

app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Hey leave",
        status:200
    })
})
app.listen(port, () => {
    console.log(`My Server is running on http://localhost:${port}`);
   }) 
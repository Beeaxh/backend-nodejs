const express = require("express");
require("dotenv");
const cors = require("cors");
const cookie = require("cookie-parser")
//,{useNewUrlParser: true}
const app = express();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
const mongoose = require("mongoose");
app.use(cookie())
mongoose.connect(process.env.AUTH_URI ||'mongodb://localhost:27017/users');
const port = process.env.PORT || 5099;
require("./Database/db");
const UserRoute = require("./Routes/UserRoute");
const NotificationRoute = require("./Routes/NotificationRoute")
app.use("/user",UserRoute);
app.use("/verification",NotificationRoute)


app.listen(port, () => {
    console.log(`My Server is running on http://localhost:${port}`);
   }) 
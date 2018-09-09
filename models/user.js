const mongoose = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose");


const userSchema = mongoose.Schema({
    userName:String,
    password:String
    
});
userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User",userSchema );
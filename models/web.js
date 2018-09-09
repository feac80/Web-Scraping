const mongoose = require("mongoose");



var webSchema = mongoose.Schema({
    name:String,
    category:String,
    url:String
});//declaring the schema.



module.exports = mongoose.model("Web", webSchema);
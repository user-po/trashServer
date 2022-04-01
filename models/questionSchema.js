const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")

const questionSchema = mongoose.Schema({
   title:String,
   content:String,
   "create_time": {
    type: String,
    default: utils.getNowFormatDate()
},
    
})
questionSchema.plugin(autoIncrement,'question')
module.exports = mongoose.model("question", questionSchema)
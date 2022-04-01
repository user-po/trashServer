const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")

const protocolSchema = mongoose.Schema({
   title:String,
   content:String,
   used:Boolean,
   "create_time": {
    type: String,
    default: utils.getNowFormatDate()
},
    
})
protocolSchema.plugin(autoIncrement,'protocol')
module.exports = mongoose.model("protocol", protocolSchema)
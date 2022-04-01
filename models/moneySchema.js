const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")
const moneySchema = mongoose.Schema({
    openid:String,
    count:Number,
    "create_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
    "update_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
    
})
moneySchema.plugin(autoIncrement,'money')
module.exports = mongoose.model("money", moneySchema)
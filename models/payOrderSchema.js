const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")
const payOrderSchema = mongoose.Schema({
    openid:String,
    order_no:String,
    action:String,
    count:Number,
	order_id:Number,
    "create_time": {
        type: String,
        default: utils.getNowFormatDateWithSeconds()
    },
    "update_time": {
        type: String,
        default: utils.getNowFormatDateWithSeconds()
    },
    
})
payOrderSchema.plugin(autoIncrement,'payOrder')
module.exports = mongoose.model("payOrder", payOrderSchema)
const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")
const priceSchema = mongoose.Schema({
    price:Number,
	used:Boolean,
    "create_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
    "update_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
    
})
priceSchema.plugin(autoIncrement,'price')
module.exports = mongoose.model("price", priceSchema)
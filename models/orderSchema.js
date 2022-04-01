const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")

const orderSchema = mongoose.Schema({
    order_no:String,
    price:String,
	mission_id:Number,
    mission_snap:Object,
    address_snap:Object,
    status:Number,
	isPayScore:Boolean,
    to:Object,
    "create_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
    publisher:Object,
    publisherId:Number,
    //服务者(回收员)
    consumer:Object,
    consumerId:Number,
    
})
orderSchema.plugin(autoIncrement,'order')
module.exports = mongoose.model("order", orderSchema)
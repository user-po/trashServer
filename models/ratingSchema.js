const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")

const ratingSchema = mongoose.Schema({
    order_id:String,  
    mission_id:String,
    score:Number,
    content:String,
    author:Object,
    illustration:Array,
    "create_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
    
})
ratingSchema.plugin(autoIncrement,'rating')
module.exports = mongoose.model("rating", ratingSchema)

const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")


const servicerRegisteSchema = mongoose.Schema({
    serial_number:String,  
    user_id:Number,
    registe_snap:Object,
    status:Number,
    applicant:Object,
    message:String,
    "create_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
    
})
servicerRegisteSchema.plugin(autoIncrement,'servicerRegiste')
module.exports = mongoose.model("servicerRegiste", servicerRegisteSchema)

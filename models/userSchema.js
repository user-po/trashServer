const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")
const UserSchema = mongoose.Schema({
    account:String,
    password:String,
    role:Number,
    "create_time": {
        type: String,
        default: utils.getNowFormatDate()
    },

})
UserSchema.plugin(autoIncrement,'user')
module.exports = mongoose.model("user", UserSchema)
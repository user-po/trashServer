const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")

const roleSchema = mongoose.Schema({
    title:String,
    "create_time": {
        type: String,
        default: utils.getNowFormatDate()
    },
})
roleSchema.plugin(autoIncrement,'role')
module.exports = mongoose.model("role", roleSchema)
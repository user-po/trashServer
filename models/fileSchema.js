const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')

const fileShema = mongoose.Schema({
    key:String,
    path:String,
    "createTime": {
        type: Date,
        default: Date.now()
    },//创建时间
    "updateTime": {
        type: Date,
        default: Date.now()
    },//更新时间
})
fileShema.plugin(autoIncrement,'file')
module.exports = mongoose.model("file", fileShema)
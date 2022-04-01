const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const miniuserSchema = mongoose.Schema({
      "openid":String,//小程序用户唯一标识
      "nickname":{
          type:String,
          default:""
      },//小程序用户昵称
      "avatar":{
          type:String,
          default:""
      },//小程序用户头像
      "realname":{
          type:String,
          default:""
      },//小程序用户真实姓名
      "gender":{
          type:Number,
          default:0
      },//小程序用户性别
      "tel":{
          type:String,
          default:""
      },//小程序用户电话
      "isServicer":{
          type:Boolean,
          default:false
      },//是否是回收员
      "createTime": {
        type: Date,
        default: Date.now()
    },//创建时间
    "updateTime": {
        type: Date,
        default: Date.now()
    },//更新时间
})
miniuserSchema.plugin(autoIncrement,'miniUser')
module.exports = mongoose.model("miniUser", miniuserSchema)
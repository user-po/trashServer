const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const categorySchema = mongoose.Schema({
      name:String,//分类名
      imageId:{
          type:Number,
          value:0
      },
      price:{
          type:Number,
          value:0
      },
      "createTime": {
        type: Date,
        default: Date.now()
    },//创建时间
    "updateTime": {
        type: Date,
        default: Date.now()
    },//更新时间
})
categorySchema.plugin(autoIncrement,'category')
module.exports = mongoose.model("category", categorySchema)
const mongoose = require('mongoose')
const {autoIncrement } = require('mongoose-plugin-autoinc')
const utils = require("../utils/util")
// 	待审核	0	1.在小程序中创建任意类型的任务之后会进入此状态；2.修改了一个已经发布的任务会重新进入此状态
// 	待发布	1	1.新增的任务在后台审核之后会进入此状态；2.主动暂停发布已经发布的任务会进入此状态。
// 	已发布	2	用户点击发布后会进入此状态
// 	已下架	3	因违规强制被强制下架后会进入此状态
// 	已取消	4	用户主动点击取消任务后会进入此状态
// 	审核不通过	5	新增的任务审核不通过会进入此状态
const missionSchema = mongoose.Schema({
    openid:String,//任务发起者的小程序唯一标识
    type:Number,//任务类型 1: 提供任务 2: 寻找任务
    designated_place:{
        type:Boolean,
        default:1
    },//是否指定地点 0：否 1:是
    title:String,//任务标题,
    description:String,//任务描述
    price:String,//任务价格
    address:String,//任务地址 用户提供任务
    from:Object,
    weight:{ //用户提供任务
        type:String,
        default:""
    },
    phone:String,//任务联系人联系方式,

    score:Number,//任务评分
    sales_volume:Number,//任务销量
    category_id:Number,//任务分类id
    category:Object,//任务分类
    cover_image_id:Number,//任务封面图的文件id
    cover_image:Object,//任务封面图,
    publisher:Object,//任务发布者
    status:{
        type:Number,
        default:0
    },//任务状态
    service_date:String,//任务开始时间
    //任务创建时间
    "create_time": {
      type: String,
      default: utils.getNowFormatDate()
  },
  //任务完成时间
   "updateTime": {
      type: String,
      default: utils.getNowFormatDate()
  },
})
missionSchema.plugin(autoIncrement,'mission')
module.exports = mongoose.model("mission", missionSchema)
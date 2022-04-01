const multer = require('@koa/multer');
const util = require('../utils/util')

let storage = multer.diskStorage({
  //文件保存路径 这个路由是以项目文件夹 也就是和入口文件（如app.js同一个层级的）
  destination: function (req, file, cb) {
     util.checkDirExist(`storage/${util.getdate(Date.now())}/`)
      cb(null, `storage/${util.getdate(Date.now())}/`)
  },
  //修改文件名称
  filename: function (req, file, cb) {
    let type = file.originalname.split('.')[1]
    

    cb(null, `${file.fieldname}-${Date.now().toString(16)}.${type}`)
  }
})
let upload = multer({
    
    storage: storage,
    limits: {
      fileSize: 5*1024*1024,
      fields: 10,//非文件字段的数量
    }
  });

module.exports =  upload;
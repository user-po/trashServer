/**
 * 接口管理模块
 */
 const router = require("koa-router")();
 const uuid = require("./../models/uuidSchema")
 const { v4: uuidv4 } = require('uuid')
 const util = require("./../utils/util");

 router.get('/uuid',async (ctx)=>{
     try {
         const key = uuidv4();
         const res = await uuid.create({
             key
         })
         
         ctx.body = util.success(res._doc.key,"密钥创建成功")
     } catch (error) {
        ctx.body = util.fail(error.stack);
     }
 })
 module.exports = router;
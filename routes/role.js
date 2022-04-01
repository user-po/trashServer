const router = require("koa-router")();
const role = require("../models/roleSchema")
const util = require("../utils/util");

router.post('/role',async (ctx)=>{

    const {title} = ctx.request.body;
    if(!title){
        ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
        return;
    }
   try {
    const res =  await role.create({title})
    ctx.body = util.success(res,"ok",util.CODE.SUCCESS)
   } catch (error) {
       ctx.body = util.fail(error.stack)
   }
})
router.get('/role',async (ctx)=>{
    const {title} = ctx.request.query;
    const params = {}
    if(title) params.title = title;

    try {
        const list = await role.find(params)
        ctx.body = util.success(list,"ok",util.CODE.SUCCESS)
    } catch (error) {
        ctx.body = util.fail(error.stack)
    }
})

module.exports = router;
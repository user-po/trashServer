const router = require("koa-router")();
const util = require("./../utils/util");
const protocol = require("../models/protocolSchema")

router.post('/protocol',async (ctx)=>{
    const {title,content,used} = ctx.request.body;

    if(!title || !content){
        ctx.status = 400;
        ctx.body = util.fail({}, "参数错误", util.CODE.BUSINESS_ERROR);
        return;
    }
    if(used){
        const res = await protocol.updateMany({used:true},{used:false})
    }
    try {
       const res =  await protocol.create({
           title:title,
           content:content,
           used:used
       })   
       ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail(error.stack);
    }
})
router.get('/protocol',async (ctx)=>{
    const {_id,title} = ctx.request.query;
    const params = {}
    if(typeof _id !== 'undefined') params._id = _id;
    if(typeof title !== 'undefined') params.title = title;
    try {
      const list =  await protocol.find(params)
      ctx.body = util.success(list,'ok',util.CODE.SUCCESS)
    } catch (error) {
     ctx.status = 400;
     ctx.body = util.fail(error.stack);
    }
})
router.put('/protocol',async (ctx)=>{
    const {_id,title,content,used} = ctx.request.query;
    const params = {}

    if(typeof _id === 'undefined'){
        ctx.status = 400;
        ctx.body = util.fail({}, "参数错误", util.CODE.BUSINESS_ERROR);
        return;
    }

    if(title) params.title = title;
    if(content) params.content = content;
    if(typeof used !=='undefined') params.used = used; 
    if(used){
        const res = await protocol.updateMany({used:true},{used:false})
    }
    try {
        const res = await protocol.findOneAndUpdate({_id:_id},params,{new:true})
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail(error.stack);
    }
})
router.delete('/protocol',async (ctx)=>{
    const {_id} = ctx.request.query;
    if(typeof _id !== 'undefined'){
        ctx.status = 400;
        ctx.body = util.fail({}, "参数错误", util.CODE.BUSINESS_ERROR);
        return;
    }
    try {
        const res = await protocol.findOneAndRemove({_id:_id})
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail(error.stack);
    }
})
module.exports = router;
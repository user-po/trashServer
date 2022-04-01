const router = require("koa-router")();
const util = require("./../utils/util");
const question = require("../models/questionSchema")

router.post('/question',async (ctx)=>{
    const {title,content} = ctx.request.body;

    if(!title || !content){
        ctx.status = 400;
        ctx.body = util.fail({}, "参数错误", util.CODE.BUSINESS_ERROR);
        return;
    }

    try {
       const res =  await question.create({
           title:title,
           content:content
       })   
       ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail(error.stack);
    }
})
router.get('/question',async (ctx)=>{
   const {_id,title} = ctx.request.query;
   const params = {}
   if(typeof _id !== 'undefined') params._id = _id;
   if(title) params.title = title;

   try {
     const list =  await question.find(params)
     ctx.body = util.success(list,'ok',util.CODE.SUCCESS)
   } catch (error) {
    ctx.status = 400;
    ctx.body = util.fail(error.stack);
   }
})
router.put('/question',async (ctx)=>{
    const {_id,title,content} = ctx.request.body;
    const params = {}

    if(typeof _id === 'undefined'){
        ctx.status = 400;
        ctx.body = util.fail({}, "参数错误", util.CODE.BUSINESS_ERROR);
        return;
    }

    if(title) params.title = title;
    if(content) params.content = content;
     
    try {
        const res = await question.findOneAndUpdate({_id:_id},params,{new:true})
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail(error.stack);
    }
})

router.delete('/question',async (ctx)=>{
    const {id} = ctx.request.query;
    if(typeof id === 'undefined'){
        ctx.status = 400;
        ctx.body = util.fail({}, "参数错误", util.CODE.BUSINESS_ERROR);
        return;
    }
    try {
        const res = await question.findOneAndRemove({_id:id})
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail(error.stack);
    }
})
module.exports = router;
const router = require("koa-router")();
const util = require("../utils/util");
const price = require("../models/priceSchema")
const role = require("../models/roleSchema")
const roleEnum = require("../enum/role")
router.get('/price',async (ctx)=>{
   const { _id } = ctx.request.query;
   const { page, skipIndex } = util.pager(ctx.request.query);
   let params = {};
  
   if(typeof _id!=='undefined') params._id = _id;

 
  
 
   try {
    
     const query = price.find(params);
     const data = await query.skip(skipIndex).sort({_id:-1}).limit(page.count);
     
     const total = await price.countDocuments(); //查询结果的总记录数
     const per_page = await price.countDocuments(params); //查询记录数
     const current_page = page.page; //当前页码
     const last_page = Math.ceil(per_page / page.count); //最大页码
     ctx.body = util.success({total,per_page,current_page,last_page,data}, "查询成功");
   } catch (error) {
     ctx.body = util.fail(error.stack);
   }
})
router.post('/price',async (ctx)=>{
     const tokenObj = util.decoded(ctx);
     const {prices,used=false} = ctx.request.body;

     if(!prices){
        ctx.status = 400;
        ctx.body = util.fail({},'参数错误',util.CODE.PARAM_ERROR)
        return;
     }
     if(!tokenObj){
        ctx.status= 401;
        ctx.body = util.fail({},'认证错误',util.CODE.AUTH_ERROR)
        return;
     }
     const findRole = await role.findOne({_id:tokenObj.find.role})
    
     if(!(findRole.title === roleEnum[0])){
        ctx.status= 400;
        ctx.body = util.fail({},'权限不足',util.CODE.POWER_NOT_ENOUGH)
        return;
     }
	 const list = await price.find({used:true})
     for(let i in list){
        await price.findOneAndUpdate({_id:list[i]._id},{used:false})
     }

     try {
            const res = await price.create({
                price:prices,
				used:used
            })
            ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
     } catch (error) {
        ctx.body = util.fail(error.stack)
     }
     
})
router.put('/price',async (ctx)=>{
    const {_id,prices,used=false} = ctx.request.query;
    const tokenObj = util.decoded(ctx);
    const params = {}
    if(typeof _id === 'undefined'){
        ctx.status = 400;
        ctx.body = util.fail({},'参数错误',util.CODE.PARAM_ERROR)
        return;
     }
     if(prices)params.price = prices
        if(used) {
        await price.updateMany({used:true},{used:false})
       
    }
	 params.used = used;
     if(!tokenObj){
        ctx.status= 401;
        ctx.body = util.fail({},'认证错误',util.CODE.AUTH_ERROR)
        return;
     }
     const findRole = await role.findOne({_id:tokenObj.find.role})

     if(!(findRole.title === roleEnum[0])){
        ctx.status= 400;
        ctx.body = util.fail({},'权限不足',util.CODE.POWER_NOT_ENOUGH)
        return;
     }
  if(used){
      const list = await price.find({used:true})
      for(let i in list){
         await price.findOneAndUpdate({_id:list[i]._id},{used:false})
      }
    }
     try {
         const res = await price.findByIdAndUpdate({_id:_id},params,{new:true})
         ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
     } catch (error) {
         ctx.body = util.fail(error.stack)
     }
})
router.delete('/price',async (ctx)=>{
   const {_id} = ctx.request.query;

   if(typeof _id === 'undefined'){
      ctx.status = 400;
      ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
      return;
   }

   try {
      const res = await price.findOneAndRemove({_id:_id});
      ctx.body = util.success(res,'删除成功',util.CODE.SUCCESS)
   } catch (error) {
      ctx.body = util.fail(error.stack)
   }
})
module.exports = router;
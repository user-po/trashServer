const router = require("koa-router")();
const Order = require("../models/orderSchema")
const Rating = require("../models/ratingSchema")
const miniUser = require("./../models/miniUserSchema");
const util = require("../utils/util");

//订单评价接口
router.post('/rating',async (ctx)=>{
    let {order_id,score,content,illustration,mission_id} = ctx.request.body;
    order_id = Number(order_id)
    mission_id = Number(mission_id)
    const tokenObj = util.decoded(ctx);
    const user = await miniUser.findOne({openid:tokenObj.data.openid})
    if(!user){
        ctx.status = 401;
        ctx.body = util.fail({},'token认证失败',util.CODE.AUTH_ERROR)
        return;
    }

    if((!order_id&&!order_id===0)||!score||!content){
        ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
        return;
    }
    try {
        const res = await Rating.create({
            order_id,
            score,
            content,
            illustration,
            author:user,
            mission_id
       })
       ctx.body = util.success(res,"ok",util.CODE.SUCCESS)    
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
    }

})
//根据订单id查询评论
router.get('/rating/order',async (ctx)=>{
   let   {order_id} = ctx.request.query;
   order_id = Number(order_id)
   if(!order_id&&!order_id===0){
        ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
        return;
   }
   try {
       const res = await Rating.findOne({order_id})
        if(!res){
            ctx.status=400;
            ctx.body = util.fail({},'未找到该评论',util.CODE.BUSINESS_ERROR)
            return;
        }
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
   } catch (error) {
    ctx.status = 400;
    ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
   }
})
router.get('/rating/servicer',async (ctx)=>{
   let   {servicer_id} = ctx.request.query;
   servicer_id = Number(servicer_id)
   const { page, skipIndex } = util.pager(ctx.request.query);
   if(!servicer_id&&!servicer_id===0){
        ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
        return;
   }
   try {
	      const query = Rating.find({servicer_id});
    const data = await query.skip(skipIndex).limit(page.count);
    
    const total = await Rating.countDocuments({servicer_id}); //查询结果的总记录数
    const per_page = await Rating.countDocuments(); //查询记录数
    const current_page = page.page; //当前页码
    const last_page = Math.ceil(per_page / page.count); //最大页码
    ctx.body = util.success({total,per_page,current_page,last_page,data}, "查询成功");
   } catch (error) {
    ctx.status = 400;
    ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
   }
})
//根据任务id查询评价列表
router.get('/rating/mission',async (ctx)=>{
    let {mission_id,servicer_id} = ctx.request.query;
    const { page, skipIndex } = util.pager(ctx.request.query)
    const params = {}
	if(mission_id) params.mission_id = Number(mission_id)
	if(servicer_id)params.servicer_id = Number(servicer_id)
 
    try {
        const query = Rating.find(params)
        const data = await query.skip(skipIndex).limit(page.count);
        const total = await Rating.countDocuments();//查询结果的总记录数
        const per_page = await Rating.countDocuments(params);//查询记录数
        const current_page = page.page;//当前页码
        const last_page = Math.ceil(per_page/page.count)//最大页码
        
        ctx.body = util.success({total,per_page,current_page,last_page,data},"查询成功")
    } catch (error) {
        ctx.status = 400;
        ctx.body = util.fail(error.stack)
    }

})
module.exports = router;
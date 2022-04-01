const router = require("koa-router")();
const util = require("../utils/util");
const payOrder = require("../models/payOrderSchema")

const payConfig = require("../config/pay")
const tenpay = require('tenpay')
const payApi = new tenpay(payConfig);
const LIMIT = 20;
router.post('/payOrder',async (ctx)=>{
    //openid:openid,order_no:order_no,action:action,count:count
    const {openid,order_no,action,count} = ctx.request.body;
	console.log(action)
    if(!openid || !order_no || !action || !count){
        ctx.status = 400;
        ctx.body = util.fail({},'参数错误',util.CODE.PARAM_ERROR)
        return;
    }

    try {
       const res =  await payOrder.create({openid:openid,order_no:order_no,action:action,count:count})
       ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
        ctx.body = util.fail(error.stack)
    }

})
router.get('/payOrder/list',async (ctx)=>{
    const tokenobj = util.decoded(ctx)
    if(!tokenobj){
        ctx.status = 401;
        util.fail({},'token错误',util.CODE.AUTH_ERROR)
        return;
    }
    const openid = tokenobj.data.openid;

    //限制查找最新20条
   try {
    const list =  await payOrder.find({openid:openid}).sort({create_time:-1}).limit(LIMIT)
    ctx.body = util.success(list,'ok',util.CODE.SUCCESS)
   } catch (error) {
       ctx.body = util.fail(error.stack)
   }


})
router.get('/payOrder/list/all',async (ctx)=>{
    const { openid, order_no,action } = ctx.request.query;
   const { page, skipIndex } = util.pager(ctx.request.query);
   let params = {};
  
   if(openid)params.openid = openid;
   if(order_no)params.order_no =order_no
   if(action)params.action =action
 

 
   try {
    
     const query = payOrder.find(params);
     const data = await query.skip(skipIndex).limit(page.count);
     
     const total = await payOrder.countDocuments(); //查询结果的总记录数
     const per_page = await payOrder.countDocuments(params); //查询记录数
     const current_page = page.page; //当前页码
     const last_page = Math.ceil(per_page / page.count); //最大页码
     ctx.body = util.success({total,per_page,current_page,last_page,data}, "查询成功");
   } catch (error) {
     ctx.body = util.fail(error.stack);
   }
})
router.get('/payOrder/query',async (ctx)=>{
    const {order_no} = ctx.request.query;
    let result = await payApi.orderQuery({
        // transaction_id, out_trade_no 二选一
        // transaction_id: '微信的订单号',
        out_trade_no: order_no
      });
      ctx.body = util.success(result,'ok',util.CODE.SUCCESS)
})
module.exports = router;
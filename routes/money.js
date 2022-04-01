const router = require("koa-router")();
const util = require("../utils/util");
const price = require("../models/priceSchema")
const money = require("../models/moneySchema")
const order = require("../models/orderSchema")
const payOrder = require("../models/payOrderSchema")
const miniUser = require("../models/miniUserSchema")
const payAction = require("../enum/pay-action")
const payConfig = require("../config/pay")
const tenpay = require('tenpay')
const payApi = new tenpay(payConfig);
router.post('/charge',async (ctx)=>{
    const tokenObj = util.decoded(ctx)
    const {count} = ctx.request.body;
    const order_no = util.generateOrderCode(10)
    const openid = tokenObj.data.openid;
    const action = payAction.charge;
    const moneyAccount = await money.findOne({openid:openid})
    if(!count){
        ctx.status = 400;
        ctx.body = util.fail({},'参数错误',util.CODE.PARAM_ERROR)
        return;
    }
    const mini = await miniUser.findOne({openid:openid})
    if(!miniUser){
		 ctx.status =401;
        ctx.body = util.fail({},'token错误',util.CODE.AUTH_ERROR)
        return;
	}
	if(!mini.isServicer){
        ctx.status =400;
        ctx.body = util.fail({},'暂时只对回收员开放此业务',util.CODE.BUSINESS_ERROR)
        return;
    }

    // 创建支付订单
    //await payOrder.create({openid:openid,order_no:order_no,action:action,count:count})
	   if(!moneyAccount){
        await money.create({openid:openid,count:newCount})
    }
    // 微信统一下单
    let unifiedResult = await payApi.unifiedOrder({
        out_trade_no: order_no,
        body: payConfig.desc,
        total_fee: Number(count)*Number(payConfig.unit),
        openid:openid
      });
 
    //获取微信JSSDK支付参数
    let result = await payApi.getPayParamsByPrepay({
        prepay_id: unifiedResult.prepay_id
      });
	  
	  
	  result.openid = openid;
	  result.order_no = order_no;
	  
	  result.count = count;
        ctx.body = util.success(result,'ok',util.CODE.SUCCESS);

})
router.get('/money',async (ctx)=>{
    const tokenObj = util.decoded(ctx)
    if(!tokenObj){
        ctx.status = 401;
        util.fail({},'token错误',util.CODE.AUTH_ERROR)
        return;
    }
    const openid = tokenObj.data.openid;
	

    try {
        const res =  await money.findOne({openid:openid})
		
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {   
        ctx.body = util.fail(error.stack)
    }
})
router.put('/updateMoneyCount',async (ctx)=>{
	let {count} = ctx.request.body;
	 const tokenObj = util.decoded(ctx)
	 const openid = tokenObj.data.openid;
	const moneyAccount = await money.findOne({openid:openid})
    const oldCount = moneyAccount?Number(moneyAccount.count):0; 
	
    const newCount = util.addNum(oldCount,Number(count))
	
	console.log(newCount)
	
    if(!tokenObj){
        ctx.status = 401;
        util.fail({},'token错误',util.CODE.AUTH_ERROR)
        return;
    }
	if(typeof count ==='undefined'){
		  ctx.status = 400;
        util.fail({},'参数错误',util.CODE.PARAM_ERROR)
        return;
	}

	
	   try {
        const res =  await money.findOneAndUpdate({openid:openid},{count:Number(newCount)},{new:true})
		
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {   
        ctx.body = util.fail(error.stack)
    }
})
router.post('/pay',async (ctx)=>{
    const tokenObj = util.decoded(ctx)
	const order_no = util.generateOrderCode(10)
    const {order_id} = ctx.request.body;
    const payPrice = await price.findOne({used:true});
    const moneyFind = await money.findOne({openid:tokenObj.data.openid})
	
    const oldCount = moneyFind.count;
    const newCount = util.minusNum(oldCount,payPrice.price)
    if(!order_id){
        ctx.status = 400;
        ctx.body = util.fail({},'参数错误',util.CODE.PARAM_ERROR)
        return;
    }
    if(Number(newCount)<=0){
		ctx.status = 400;
        ctx.body = util.fail({},'余额不足',util.CODE.BUSINESS_ERROR)
        return;
    }
    
    try {
        const res = await money.findOneAndUpdate({openid:tokenObj.data.openid},{count:newCount},{new:true})
		 await payOrder.create({openid:tokenObj.data.openid,order_no:order_no,action:'minus',count:payPrice.price,order_id:order_id})
        ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
    } catch (error) {
		ctx.status = 400;
        ctx.body = util.fail(error.stack)
    }
})
router.all('/notify',async (ctx)=>{
})
module.exports = router;
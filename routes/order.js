const router = require("koa-router")();
const Order = require("../models/orderSchema")
const Mission = require("../models/missionShema");
const missionStatus = require("../enum/mission-status")
const miniUser = require("./../models/miniUserSchema");
const util = require("../utils/util");
const orderStatus = require("../enum/order-status")
const roleType  = require("../enum/role-type")
const orderDict = require("../enum/order-status-dict")
//创建订单
router.post('/order',async (ctx)=>{
  const {service_id:mission_id,address:address_snap,to} = ctx.request.body;
  const tokenObj = util.decoded(ctx);
  const order_no = util.generateOrderCode();
  const mission_snap = await Mission.findOne({_id:mission_id})
  const price = mission_snap.price;
  const status = orderStatus.UNPAID;
  const publisher = mission_snap.publisher;
  const publisherId = publisher._id;
  const consumer =  await miniUser.findOne({openid:tokenObj.data.openid})
  const consumerId = consumer._id;
  if(!mission_id||!address_snap){
     ctx.status = 400;
     ctx.body = util.fail({},'参数错误',util.CODE.PARAM_ERROR)
     return;
  }
   await Mission.findOneAndUpdate({_id:mission_id},{status:missionStatus.OFF_SHELVES},{new:true})
    const res = await Order.create({
        order_no,
        mission_snap,
        address_snap,
        price,
        status,
        publisher,
        consumer,
        consumerId,
        publisherId,
		to,
		mission_id
      })
	
    ctx.body = util.success({order_id:res._doc._id},'ok',util.CODE.SUCCESS)
   
})
//查询我的订单数

router.get('/order/count',async (ctx)=>{
  let {role=roleType.CONSUMER} = ctx.request.query;
  const tokenObj = util.decoded(ctx);
  const params = {}
  role*=1;
 
  if(role&&role===roleType.PUBLISHER) params.publisherId = Number(tokenObj.data.id);
  if(role&&role===roleType.CONSUMER) params.consumerId = Number(tokenObj.data.id);
  let count = {
    unapproved: 0,
    unpaid: 0,
    unconfirmed: 0,
    unrated: 0
  }
 
   try {
      const list = await Order.find(params)
      for(let item of list){
        count[orderDict[item.status]]++;
      }
      ctx.body = util.success(count, "ok", util.CODE.SUCCESS);
   } catch (error) {
       ctx.body = util.fail(error.stack)
   }
})

//查询我的订单
router.get('/order/my',async (ctx)=>{
    const tokenObj = util.decoded(ctx);
    let {role,status} = ctx.request.query;
    const { page, skipIndex } = util.pager(ctx.request.query);
    const params = {};
    if(!Number(role)){
        ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.PARAM_ERROR)
        return;
    }

 if(role&&role===roleType.PUBLISHER) params.publisherId = Number(tokenObj.data.id);
  if(role&&role===roleType.CONSUMER) params.consumerId = Number(tokenObj.data.id);
    if(typeof status !== 'undefined'&&status!=='') params.status = Number(status);

	
    try {
        const query =  Order.find(params)
        const data = await query.skip(skipIndex).limit(page.count).sort({'_id':-1});
        const total = await Order.countDocuments(); //查询结果的总记录数
        const per_page = await Order.countDocuments(params); //查询记录数
        const current_page = page.page; //当前页码
        const last_page = Math.ceil(per_page / page.count); //最大页码
        ctx.body = util.success({total,per_page,current_page,last_page,data}, "查询成功");
    } catch (error) {
        ctx.body = util.fail(error.stack)
    }
})
//更新指定id订单的状态
router.post('/order/:id',async (ctx)=>{
  let {action} = ctx.request.body;
  const {id} = ctx.params;

  if(!orderDict[action]||typeof id === 'undefined'){
    ctx.status = 400;
    ctx.body = util.fail({},"参数错误",util.CODE.PARAM_ERROR)
    return;
  }
  action*=1;
  
 
  try {
      const res = await Order.findOneAndUpdate({_id:id},{status:action}, { new: true })
      ctx.body = util.success({result:true},"ok",util.CODE.SUCCESS)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})
router.get('/order/check',async (ctx)=>{
let {mission_id,servicerId} = ctx.request.query;
	
	if(typeof mission_id === 'undefined'||typeof servicerId === 'undefined'){
			ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.PARAM_ERROR)
        return;
	}
  mission_id*=1;
  servicerId*=1;
	
	    const res=await Order.findOne({'mission_snap._id':mission_id,consumerId:servicerId})
        ctx.body = util.success(res,"ok",util.CODE.SUCCESS)
})
router.get('/order',async (ctx)=>{
  const { publisherId, order_no,status } = ctx.request.query;
   const { page, skipIndex } = util.pager(ctx.request.query);
   const params = {};
  
   if(Number(publisherId))params.publisherId = Number(publisherId);
       if(typeof status !== 'undefined'&&status!=='') params.status = Number(status);
   if(order_no)params.order_no = order_no

 
   try {
   
     const query = Order.find(params);
     const data = await query.skip(skipIndex).limit(page.count);
     
     const total = await Order.countDocuments(); //查询结果的总记录数
     const per_page = await Order.countDocuments(params); //查询记录数
     const current_page = page.page; //当前页码
     const last_page = Math.ceil(per_page / page.count); //最大页码
     ctx.body = util.success({total,per_page,current_page,last_page,data}, "查询成功");
   } catch (error) {
     ctx.body = util.fail(error.stack);
   }
})
//查询指定id的订单
router.get('/order/:id',async (ctx)=>{
    const {id} = ctx.params;

    if(!id&&!id===0){
        ctx.status = 400;
        ctx.body = util.fail({},"参数错误",util.CODE.PARAM_ERROR)
        return;
    }
    try {
 
        ctx.body = util.success(await Order.findOne({_id:id}),"ok",util.CODE.SUCCESS)
    } catch (error) {
        ctx.body = util.fail(error.stack)
    }
})

module.exports = router;
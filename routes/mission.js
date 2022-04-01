/**
 * 服务管理模块
 */
const router = require("koa-router")();
const Mission = require("../models/missionShema");
const File = require("../models/fileSchema");
const Category = require("../models/categoryShema");
const miniUser = require("./../models/miniUserSchema");
const util = require("../utils/util");
const missionStatus = require("../enum/mission-status");
const missionDict = require("../enum/mission-status-dict");
const missionType = require("../enum/mission-type");
//查询所有已发布的任务
router.get("/mission/list", async (ctx) => {
  const { category_id, type } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  let params = {};
 
  if(Number(category_id))params.category_id = Number(category_id);
  if(Number(type))params.type = Number(type)

  params.status = missionStatus.PUBLISHED;
  //console.log(params)

  try {
   
    const query = Mission.find(params);
    const data = await query.skip(skipIndex).limit(page.count).sort({"_id":-1});
    
    const total = await Mission.countDocuments(); //查询结果的总记录数
    const per_page = await Mission.countDocuments(params); //查询记录数
    const current_page = page.page; //当前页码
    const last_page = Math.ceil(per_page / page.count); //最大页码
    ctx.body = util.success({total,per_page,current_page,last_page,data}, "查询成功");
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//all mission
router.get("/mission", async (ctx) => {
  const { category_id, type,status } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  let params = {};
 
  if(Number(category_id))params.category_id = Number(category_id);
  if(Number(type))params.type = Number(type)
  if(Number(status))params.status = status;
 

  try {
   
    const query = Mission.find(params);
    const data = await query.skip(skipIndex).limit(page.count);
    
    const total = await Mission.countDocuments(params); //查询结果的总记录数
    const per_page = await Mission.countDocuments(); //查询记录数
    const current_page = page.page; //当前页码
    const last_page = Math.ceil(per_page / page.count); //最大页码
    ctx.body = util.success({total,per_page,current_page,last_page,data}, "查询成功");
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
 //增加任务
 router.post("/mission", async (ctx) => {
   // 	type	integer	是	服务所属类型。1、在提供；2、正在找
   // 	title	string	是	服务标题
   // 	category_id	integer	是	服务所属分类的 id
   // 	cover_image_id	integer	是	封面图 id
   // 	designated_place	integer	是	是否要求预约人指定服务地点，1：是；0：否
   // 	description	string	是	服务详情描述
   // 	begin_date	string	是	服务有效期开始时间。格式：2021-01-01
   // 	end_date	string	是	服务有效期结束时间。格式：2021-01-01
   // 	price	string	是	服务价格。最多两位小数
   const { type = 1, ...params } = ctx.request.body;
   const tokenObj = util.decoded(ctx);
  if(! params.cover_image_id) params.cover_image_id = 149
   const publisher = await miniUser.findOne({ openid: tokenObj.data.openid });
   const category = await Category.findOne({ _id: params.category_id });
   const cover_image = await File.findOne({ _id: params.cover_image_id });
   if (
     !type ||
     !params.title ||
	 !params.cover_image_id||
     !params.category_id ||
     !params.phone ||
     !publisher ||
     !category ||
     !cover_image||
     !params.service_date  ||!params.weight||!params.address 
     ||!params.latitude||!params.longitude||!params.price||!params.name
   ) {
     ctx.status = 400;
     ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
     return;
   }
	publisher.realname = params.name
   //是用户提供
   //创建任务
     try {
       const res = await Mission.create({
         type:type,
         title: params.title,
         address: params.address,
         cover_image_id: params.cover_image_id,
         phone: params.phone,
         weight: params.weight,
         openid: tokenObj.data.openid,
         category_id: params.category_id,
         publisher: publisher._doc,
         category: category._doc,
         cover_image: cover_image._doc,
         service_date: params.service_date,
         price: params.price,
		 status:missionStatus.PUBLISHED,
        from:{
       latitude:params.latitude,
         longitude:params.longitude
      }
       });
       ctx.body = util.success(res, "ok", util.CODE.SUCCESS);
     } catch (error) {
       ctx.body = util.fail(error.stack);
     }
   
 });
//查询我的任务
router.get("/mission/my", async (ctx) => {
  const { type, ...params } = ctx.request.query;
  const param = {};
  
  if (!type || !params.page || !params.count) {
    ctx.status =400;
    ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
    return;
  }

  const publisherId = util.decoded(ctx).data.openid;
  const { page, skipIndex } = util.pager(ctx.request.query);

  if (missionDict[Number(params.status)]) param.status = Number(params.status);
  if (publisherId) param.openid = publisherId;
  if(Number(type)) param.type = Number(type)
  //查询一下用户
  const miniuser = await miniUser.findOne({ openid: publisherId });
  const isServicer = miniuser._doc.isServicer;
  if (!isServicer && type === missionType.SEEK) {
    ctx.body = util.fail({}, "类型参数错误", util.CODE.PARAM_ERROR);
  }
  //列表查询
  try {
    
    const query = Mission.find(param);
   
    const data = await query.skip(skipIndex).limit(page.count);

    const total = await Mission.countDocuments(param); //查询结果的总记录数
    const per_page = await Mission.countDocuments(); //查询记录数
    const current_page = page.page; //当前页码
    const last_page = Math.ceil(per_page / page.count); //最大页码
  
    ctx.body = util.success({ total, per_page, current_page, last_page, data }, "查询成功");
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//查询我的任务状态统计
router.get("/mission/count", async (ctx) => {
  const { type = null } = ctx.request.query;

  const params = {};


  const publisherId = util.decoded(ctx).data.openid;
  if(Number(type))params.type = Number(type);
  params.openid = publisherId;
  let count = {
    // 待审核
    pending: 0,
    // 待发布
    unpublished: 0,
    // 已发布
    published: 0,
    // 已下架 OFF_SHELVES
    off_shelves: 0,
    // 已取消CANCELED
    canceled: 0,
    //审核不通过
    deny: 0,
  };
  try {
    const list = await Mission.find(params);

    for (let item of list) {
      count[missionDict[item.status]]++;
    }
    ctx.body = util.success(count, "ok", util.CODE.SUCCESS);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//查询指定id的任务
router.get("/mission/:id", async (ctx) => {
  const { id = null } = ctx.params;
  console.log(id)
  //避免id为0报错的情况
  if (typeof id === 'undefined') {
    ctx.status =400;
    ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
    return;
  }
  try {
    const mission = await Mission.findOne({ _id: id });
    ctx.body = util.success(mission, "ok", util.CODE.SUCCESS);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//更新指定服务的状态
router.post("/mission/:id", async (ctx) => {
  const { id = null } = ctx.params;
  const { action } = ctx.request.body;

  //避免id为0报错的情况
  if (typeof id === 'undefined' || !action || !missionDict[action]) {
    ctx.status =400;
    ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
    return;
  }
  try {
   
 
    const res = await Mission.findOneAndUpdate({_id:id},{status:action}, { new: true });
    ctx.body = util.success({ result: true }, "ok", util.CODE.SUCCESS);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
 //编辑任务
 router.put("/mission/:id", async (ctx) => {
   const { id = null } = ctx.params;
   const { type = 1, ...param } = ctx.request.body;
   const tokenObj = util.decoded(ctx);
   const publisher = await miniUser.findOne({ openid: tokenObj.data.openid });
   const category = await Category.findOne({ _id: param.category_id });
   const cover_image = await File.findOne({ _id: param.cover_image_id });
 
 
   if (
     typeof id === 'undefined'||
     !type ||
     !param.title ||
     !param.cover_image_id ||
     !param.category_id ||
     !param.phone ||
     !publisher ||
     !category ||
     !cover_image||
     !param.service_date  ||!param.weight||!param.address 
     ||!param.latitude||!param.longitude||!param.price
	 ||!param.name
   ) {
	   ctx.status = 400;
     ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
     return;
   }
 publisher.realname=param.name;
   //是用户提供
  
     //创建任务
     try {
       const res = await Mission.findOneAndUpdate(
         { _id: id },
         {
          type:type,
          title: param.title,
          address: param.address,
          cover_image_id: param.cover_image_id,
          phone: param.phone,
          weight: param.weight,
          openid: tokenObj.data.openid,
          category_id: param.category_id,
          publisher: publisher._doc,
          category: category._doc,
          cover_image: cover_image._doc,
          service_date: param.service_date,
          price: param.price,
		  
         from:{
        latitude:param.latitude,
          longitude:param.longitude
       }
         },
         { new: true }
       );
       ctx.body = util.success(res, "ok", util.CODE.SUCCESS);
     } catch (error) {
       ctx.body = util.fail(error.stack);
     }
   
 });
module.exports = router;

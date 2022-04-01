/**
 * 小程序用户管理模块
 */
const router = require("koa-router")();
const miniUser = require("./../models/miniUserSchema");
const servicerRegiste = require("../models/servicerRegisteSchema");
const servicerRegisteDict=require("../enum/servicer-registe-status-dict")
const util = require("./../utils/util");
const config = require("../config/index");
const servicerRegisteStatus = require("../enum/servicerRegiste-status");
//查询当前用户信息
router.get("/miniUser", async (ctx) => {
  const res = util.decoded(ctx);
  const res_user = await miniUser.findOne({ openid: res.data.openid });
  if (!res_user) {
    ctx.status = 401;
    ctx.body = util.fail({}, "未找到该用户", util.CODE.AUTH_ERROR);
    return;
  }
  ctx.body = util.success(res_user, "ok", util.CODE.SUCCESS);
});
//查询当前用户信息
router.get("/miniUser/remote", async (ctx) => {
  const {openid} = ctx.request.query;
  const res_user = await miniUser.findOne({ openid: openid });
  if (!res_user) {
    ctx.status = 401;
    ctx.body = util.fail({}, "未找到该用户", util.CODE.AUTH_ERROR);
    return;
  }
  ctx.body = util.success(res_user, "ok", util.CODE.SUCCESS);
});
router.get("/miniUser/servicer", async (ctx) => {
  const { status } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  const params = {};
  if(typeof status !=='undefined')params.status = Number(status);

  try {
    const query = servicerRegiste.find(params);
    const data = await query.skip(skipIndex).limit(page.count);
    const total = await servicerRegiste.countDocuments(); //查询结果的总记录数
    const per_page = await servicerRegiste.countDocuments(params); //查询记录数
    const current_page = page.page; //当前页码
    const last_page = Math.ceil(per_page / page.count); //最大页码

    ctx.body = util.success(
      { total, per_page, current_page, last_page, data },
      "查询成功"
    );
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//获取用户列表
router.get("/miniUser/list", async (ctx) => {
  const { _id, openid, nickname } = ctx.request.query;

  const { page, skipIndex } = util.pager(ctx.request.query);
  const params = {};
  if (_id) params._id = _id;
  if (openid) params.openid = openid;
  if (nickname) params.nickname = nickname;
  try {
    const query = miniUser.find(
      params,
      "_id openid nickname avatar realname gender tel isServicer"
    );
    const data = await query.skip(skipIndex).limit(page.count);
    const total = await miniUser.countDocuments(params); //查询结果的总记录数
    const per_page = await miniUser.countDocuments(); //查询记录数
    const current_page = page.page; //当前页码
    const last_page = Math.ceil(per_page / page.count); //最大页码

    ctx.body = util.success(
      { total, per_page, current_page, last_page, data },
      "查询成功"
    );
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
router.put("/miniUser", async (ctx) => {
  const { ...params } = ctx.request.body;
  try {
    const res = util.decoded(ctx);

    if (!res) {
      ctx.status = 401;
      util.fail({}, "未携带token", util.CODE.AUTH_ERROR);
      return;
    }
    const res_user = await miniUser.findOneAndUpdate(
      { openid: res.data.openid },
      { nickname: params.nickname, avatar: params.avatar },
      { new: true }
    );
    const data = {
      _id: res_user._id,
      openid: res_user.openid,
      nickname: res_user.nickname,
      avatar: res_user.avatar,
      realname: res_user.realname,
      gender: res_user.gender,
      tel: res_user.tel,
      isServicer: res_user.isServicer,
    };
    ctx.body = util.success(data, "用户修改成功");
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
router.post("/miniUser", async (ctx) => {
  const {id, ...params } = ctx.request.body;
   if (typeof id === 'undefined') {
    ctx.status = 400;
    ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
    return;
  }
  try {
    

    const res_user = await miniUser.findOneAndUpdate(
      { _id: id },
       params,
      { new: true }
    );
    const data = {
      _id: res_user._id,
      openid: res_user.openid,
      nickname: res_user.nickname,
      avatar: res_user.avatar,
      realname: res_user.realname,
      gender: res_user.gender,
      tel: res_user.tel,
      isServicer: res_user.isServicer,
    };
    ctx.body = util.success(data, "用户修改成功");
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
router.delete("/miniUser/:id", async (ctx) => {
  const { id = null } = ctx.params;
  if (typeof id === 'undefined') {
    ctx.status = 400;
    ctx.body = util.fail({}, "参数错误", util.CODE.PARAM_ERROR);
    return;
  }
  try {
    const res = await miniUser.findOneAndRemove({_id:id});
    ctx.body = util.success(res, "ok", util.CODE.SUCCESS);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//注册回收员
router.post("/miniUser/servicer", async (ctx) => {
  const { ...params } = ctx.request.body;
  const tokenObj = util.decoded(ctx);

  if (
    !params.idNum ||
    !params.address ||
    params.idCardImgs.length < 2 ||
    !params.realname
  ) {
    ctx.status = 400;
    ctx.body = util.fail({}, "参数错误", util.CODE.BUSINESS_ERROR);
    return;
  }
  try {
    const user = await miniUser.findOne({ openid: tokenObj.data.openid });
    const registeList = await servicerRegiste.find({user_id:tokenObj.data.id})
	for(let i in registeList){
		if(registeList[i].status === servicerRegisteStatus.PENDING){
		  ctx.status = 400;
		  ctx.body = util.fail({}, "有正在审核的请求，申请重复", util.CODE.BUSINESS_ERROR);
		  return;
		}
	}
    
    if (!user) {
      ctx.status = 401;
      ctx.body = util.fail({}, "tokenError", util.CODE.AUTH_ERROR);
      return;
    }
    await servicerRegiste.create({
      serial_number: util.generateOrderCode(8),
      user_id: user._id,
      registe_snap: params,
      status: servicerRegisteStatus.PENDING,
      applicant: user,
    });
    ctx.body = util.success({ result: true }, "ok", util.CODE.SUCCESS);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//获取回收员注册列表中某个状态或全部的数据
router.get("/miniUser/servicer/:id", async (ctx) => {
  const { id } = ctx.params;
  const { status } = ctx.request.query;
  const { page, skipIndex } = util.pager(ctx.request.query);
  const params = {};
  if (typeof id === 'undefined') {
    ctx.status = 400;
    util.fail({}, "参数不全", util.CODE.PARAM_ERROR);
    return;
  }
  params.user_id = id;
   if(Number(status))params.status = Number(status);

  try {
    const query = servicerRegiste.find(params);
    const data = await query.skip(skipIndex).limit(page.count);
    const total = await servicerRegiste.countDocuments(params); //查询结果的总记录数
    const per_page = await servicerRegiste.countDocuments(); //查询记录数
    const current_page = page.page; //当前页码
    const last_page = Math.ceil(per_page / page.count); //最大页码

    ctx.body = util.success(
      { total, per_page, current_page, last_page, data },
      "查询成功"
    );
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
//修改回收员申请的状态
router.put("/miniUser/servicer", async (ctx) => {
  let { id, ...params } = ctx.request.body;
  id = Number(id);
  if (typeof id === 'undefined') {
    ctx.status = 400;
    util.fail({}, "参数不全", util.CODE.PARAM_ERROR);
    return;
  }
  try {
    const res = await servicerRegiste.findOneAndUpdate({user_id:id},params,{new:true});
    ctx.body = util.success(res, "状态改变成功",util.CODE.SUCCESS);
  } catch (error) {
    ctx.body = util.fail(error.stack);
  }
});
router.get("/miniUser/servicer/list/count",async (ctx)=>{
  const tokenObj = util.decoded(ctx);
  const { status = null } = ctx.request.query;
  const params = {}
  if(Number(status))params.status = Number(status);
  params.user_id=Number(tokenObj.data.id)
  
  let count = {
    pending: 0,
    resolve: 0,
    reject: 0,
  }
  
    const list = await servicerRegiste.find(params)
	console.log(list)
    for(let item of list){
      count[servicerRegisteDict[item.status]]++;
    }
    ctx.body = util.success(count, "ok", util.CODE.SUCCESS);

})
module.exports = router;

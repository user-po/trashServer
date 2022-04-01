const router = require("koa-router")();
const user = require("../models/userSchema")
const uuid = require("../models/uuidSchema")
const role = require("../models/roleSchema")
const util = require("../utils/util");
const roleEnum = require("../enum/role")
const config = require("../config/index")
const jwt = require("jsonwebtoken")

router.post('/user/registe',async (ctx)=>{
  const {account,password,inviteCode} = ctx.request.body;
  if(!account||!password||!inviteCode){
    ctx.status = 400;
    ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
    return;
  }
  const invite_code = await uuid.findOne({key:inviteCode})
  if(!invite_code){
    ctx.status = 400;
    ctx.body = util.fail({},"邀请码错误",util.CODE.BUSINESS_ERROR)
    return;
  }
    if(invite_code.used){
    ctx.status = 400;
    ctx.body = util.fail({},"邀请码重复",util.CODE.BUSINESS_ERROR)
    return;
  }
  const roles = await role.findOne({title:roleEnum[1]})
  if(!roles){
    ctx.status = 400;
    ctx.body = util.fail({},"错误",util.CODE.BUSINESS_ERROR)
    return;
  }
  try {
     const res = await user.create({
        account,
        password,
        role:roles._id
     })
	      await uuid.findOneAndUpdate({_id:invite_code._id},{used:true})
     ctx.body = util.success(res,'ok',util.CODE.SUCCESS)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
  
})
router.post('/user/login',async (ctx)=>{
  const {account,password} = ctx.request.body;
  
  if(!account||!password){
    ctx.status = 400;
    ctx.body = util.fail({},"参数错误",util.CODE.BUSINESS_ERROR)
    return;
  }
  const find = await user.findOne({account,password},"account _id role create_time")
  if(!find){
    ctx.status = 400;
    ctx.body = util.fail({},"登录失败，可能是用户名或密码错误",util.CODE.BUSINESS_ERROR)
    return;
  } 
 
  //创建令牌
  const token =  jwt.sign(
    {
      find
    },
    config.TOKEN,
    { expiresIn: config.TOKEN_EXPIRE_IN }
  )
  ctx.body = util.success({token,user:find},'登录成功',util.CODE.SUCCESS)
})
router.get('/user/my',async (ctx)=>{
  const tokenObj = util.decoded(ctx);
  if(!tokenObj.find){
	ctx.status = 401;
	util.fail({},'认证错误',util.CODE.AUTH_ERROR)
	return;
  }
   try {
      const res = await user.findOne({_id:tokenObj.find._id},'_id account create_time')
   ctx.body = util.success(res,'查询成功',util.CODE.SUCCESS)
 } catch (error) {
  ctx.body = util.fail(error.stack)
 }

})
router.get('/user',async (ctx)=>{
  const {account,password,_id} = ctx.request.query;
  const params = {}
  if(account) params.account = account;
  if(password) params.password = password;
  if(typeof _id !=='undefined') params._id = _id;

  try {
     const res =  await user.findOne(params)
     ctx.body = util.success(res,'查询成功',util.CODE.SUCCESS)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})
router.put('/user',async (ctx)=>{
  const {_id,...params} = ctx.request.body;

  if(typeof _id === 'undefined'){
    ctx.status = 400;
    ctx.body = util.fail({},"参数错误",util.CODE.PARAM_ERROR)
    return;
  }

  try {
    const res = await user.findOneAndUpdate({_id:_id},params,{new:true})
    ctx.body = util.success(res,'修改成功',util.CODE.SUCCESS)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})
router.get('/user/role',async (ctx)=>{
  const tokenObj = util.decoded(ctx)
  const userRole = {}
  try {
    const res = await role.findOne({_id:tokenObj.find.role})
	userRole.title = res.title
    ctx.body = util.success(userRole,'查找成功',util.CODE.SUCCESS)
  } catch (error) {
    ctx.body = util.fail(error.stack)
  }
})
module.exports = router;

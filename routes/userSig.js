 const router = require("koa-router")();
 const config = require('../config/index')
 const Api = require("../utils/userSig.js");
 const util = require('../utils/util')
const api  = new Api(config.SDKAPPID,config.SECRETKEY)
 router.get('/userSig',async (ctx)=>{
	 const {userId} = ctx.request.query;
	 if(typeof userId==='undefined'){
		ctx.status = 400;
		ctx.body = util.fail({},'fail',util.CODE.PARAM_ERROR)
		RETURN;
	 }
	const userSig = api.genUserSig(userId)
	 ctx.body = util.success({userSig},'ok',util.CODE.SUCCESS)
 })
 
 module.exports = router;
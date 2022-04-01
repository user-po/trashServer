const router = require("koa-router")();
const util = require("./../utils/util");
const uuid = require("./../models/uuidSchema")
const miniUser = require("../models/miniUserSchema")
const config = require("../config/index")
const jwt = require("jsonwebtoken")

router.post('/token',async (ctx)=>{

     const {key=null,code=null} = ctx.request.body;
     const params = {};
     if(!key || !code ){
        ctx.body = util.fail("参数错误", util.CODE.PARAM_ERROR);
        return;
     }
     params.key = key; 
    
    try {
        const res_key  = await uuid.findOne(params,"key")
        let data;
        if(!res_key){
            ctx.body = util.fail("密钥错误", util.CODE.BUSINESS_ERROR);
            return;
        }
        //密钥正确 获取用户openid 签名

        const openid = await util.getOpenId(code)
        const hasUser = await miniUser.findOne({openid:openid})
    
      
        if(!hasUser){
          const user = await miniUser.create({openid:openid})
          data = {key:key,openid:openid,id:user._doc._id}
       }else{
          data = {key:key,openid:openid,id:hasUser._doc._id}
       }
       
        const token = jwt.sign(
            {
              data,
            },
            config.TOKEN,
            { expiresIn: config.TOKEN_EXPIRE_IN }
          );
         
        ctx.body = util.success({token},"令牌创建成功")
    } catch (error) {
        ctx.body = util.fail(error.stack);
    }
})
router.post('/token/mgrfe',async (ctx)=>{
  
})
router.post("/token/verify",async (ctx)=>{
   const {token=null} = ctx.request.body;
   if(!token){
      ctx.body = util.fail({},"参数错误",util.CODE.PARAM_ERROR)
      return;  
   } 
  
   const res = jwt.verify(token, config.TOKEN)
   const valid = util.isTokenOutOfDate(res.exp)
   ctx.body = util.success({valid},"ok",util.CODE.SUCCESS)
})
module.exports = router;
const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const koaBody = require('koa-body')
const log4js = require('./utils/log')
const registeRoutes = require("./routes/index")
const cors = require('koa2-cors'); //跨域处理
const koaJwt = require('koa-jwt')
const util = require('./utils/util')
const config = require("./config/index")
// error handler
onerror(app)
app.use(
  cors({
      origin: function(ctx) { //设置允许来自指定域名请求
        
              return '*'; // 允许来自所有域名请求
          
         
      },
      maxAge: 5, //指定本次预检请求的有效期，单位为秒。
      credentials: true, //是否允许发送Cookie
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], //设置所允许的HTTP请求方法
      allowHeaders: ['Content-Type', 'Authorization', 'Accept'], //设置服务器支持的所有头信息字段
      exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'] //设置获取其他自定义字段
  })
);
app.use(require('koa-static')(__dirname))

//加载数据库
require('./config/db')
// middlewares
app.use(
  koaBody({
    multipart: true, // 支持文件上传
    formidable: {
      maxFieldsSize: 5 * 1024 * 1024, // 最大文件为5兆
    }
  })
)
app.use(json())

// logger
app.use(async (ctx, next) => {
  
  log4js.info(`get params:${JSON.stringify(ctx.request.query)}`)
  log4js.info(`post params:${JSON.stringify(ctx.request.body)}`)
  //捕获jwt的异常

  await next().catch((err)=>{
   
	console.log(err.originalError)
      if(err.status == '401'){
         ctx.status = 401;
         
              if(err.originalError&&err.originalError.name==='TokenExpiredError'){
            ctx.body = util.fail(err.originalError.name,'令牌过期',util.CODE.AUTH_ERROR)
          }else{
            ctx.body = util.fail(err.name,'认证错误',util.CODE.AUTH_ERROR)
          }
           
         
      }else{
        throw err;
      }

  })
})

//jwt校验
app.use(koaJwt({secret:config.TOKEN,debug:true}).unless({
  path:[
    /^\/v1\/user\/login/,
	/^\/admin/,
	/^\/v1\/user\/registe/,
	/^\/v1\/question/,
    /^\/v1\/protocol/,
    /^\/v1\/category/,
	/^\/v1\/mission/,
	/^\/v1\/mission\/list/,
    /^\/v1\/token/,
    /^\/v1\/uuid/,
    /^\/v1\/file/,
    /^\/storage/,
    /^\/favicon.ico/,
  ]
}))

registeRoutes(app)

// error-handling
app.on('error', (err, ctx) => {
  log4js.error(`${err.stack}`)
});

module.exports = app

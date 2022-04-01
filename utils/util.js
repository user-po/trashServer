/**
 * 通用工具函数
 */
const log4js = require("./log");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const config = require("../config/index")
const axios =require("axios")
let transporter = nodemailer.createTransport({
  host: "smtp.qq.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "1186968407@qq.com", // 发送方的邮箱
    pass: "colunezqfwimiabb", // smtp 的授权码
  },
});
const CODE = {
  SUCCESS: 200,
  PARAM_ERROR: 10000, //参数错误
  AUTH_ERROR: 10001, //未携带token
  TOKEN_OUT_DATE: 10002, //token过期
  POWER_NOT_ENOUGH:10010,//请求权限不足
  FILE_UNDEFINED: 10003, //	未获取到上传的文件资源或资源不存在
  DATA_UNDEFINED: 10004, //	未在数据库中获取到资源
  HAS_COMMENT: 10021, //您已评价过该订单
  COMMENT_FAIL: 10022, //订单评价失败
  FILE_SAVE_FAILED: 10007, //文件保存失败,
  FILE_UPLOAD_SUCCESS: 201, //文件上传成功,
  OPERATION_FAILED:10009,//操作失败
  USER_ACCOUNT_ERROR: 20001, //账号或密码错误
  USER_LOGIN_ERROR: 30001, //用户未登录
  BUSINESS_ERROR: 40001, //业务请求失败
};

module.exports = {
  /**
   * @param {from} 发件人邮箱
   * @param {to} 收件人邮箱
   * @param {subject} 邮件主题
   * @param {text} 邮件文本内容
   * @param {html} 邮件html内容
   * @param {callback} 回调函数
   * @returns
   */
  sendMail(mailObj, callback) {
    const { from, to, subject, text, html } = mailObj;
    // 发送的配置项
    let mailOptions = {
      from: from || "1186968407@qq.com", // 发送方
      to: to, //接收者邮箱，多个邮箱用逗号间隔
      subject: subject || "邮件标题", // 标题
      text: text || "测试文本", // 文本内容
      html: html || "", //页面内容
    };

    //发送函数
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        callback(false);
      } else {
        callback(true); //因为是异步 所有需要回调函数通知成功结果
      }
    });
  },
  /**
   * 获取openid
   * @param {code} code 
   * @returns openid
   */
  async getOpenId(code){
       if(!code){
        return;
       }
      
        const res = await axios.get(`${config.OPENID_URL}grant_type=${config.GRANT_TYPE}&appid=${config.APP_ID}&secret=${config.APP_SECRET}&js_code=${code}`)
       
        
       if(res.data.openid){
        return res.data.openid;
       }else{
         return ''
       }
  },
//生成订单号
 generateOrderCode() {
    let orderCode='';
    for (let i = 0; i < 6; i++) //6位随机数，用以加在时间戳后面。
    {
      orderCode += Math.floor(Math.random() * 10);
    }
    orderCode = new Date().getTime() + orderCode;  //时间戳，用来生成订单号。
   
    return orderCode;
  },
  /**
   * 分页结构封装
   * @param {number} pageNum
   * @param {number} pageSize
   * @returns {object}
   */
  pager({ page = 1, count = 10 }) {
    page *= 1;
    count *= 1;
    const skipIndex = (page - 1) * count;
    return {
      page: {
        page,
        count,
      },
      skipIndex,
    };
  },
  /**
   * 接口返回成功通用函数
   * @param {object} data
   * @param {string} msg
   * @param {string} error_code
   * @returns {object}
   */
  success(data = "", msg = "", error_code = CODE.SUCCESS) {
    log4js.debug(data);
    return {
      error_code,
      data,
      msg,
    };
  },
  /**
   * 接口返回失败通用函数
   * @param {object} data
   * @param {string} msg
   * @param {string} error_code
   * @returns {object}
   */
  fail(data = "",msg = "", error_code = CODE.BUSINESS_ERROR, ) {
    log4js.debug(msg);
    return {
      error_code,
      data,
      msg,
    };
  },
  /**
   * 状态码
   */
  CODE,
  /**
   * token解密
   * @param {string} authorization
   * @returns {string}
   */
  decoded(ctx) {

    if (ctx.header.authorization) {
      let token = ctx.header.authorization.split(" ")[1];
      if(token){
        return jwt.verify(token, config.TOKEN);
      }else{
        ctx.status = 401;
        ctx.body = fail({},'未登录',CODE.AUTH_ERROR)
        return;
      }
     
    }
    return "";
  },
 getNowFormatDate() {
    let date = new Date();
    let seperator1 = "-";
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    let currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
},
  /**
   * 检测token是否过期
   * @param {token过期时间} exp 
   * @returns 是否过期
   */
  isTokenOutOfDate(exp){
    const expSeconds = exp * 1000;
    const now = Date.now();
    if(now > expSeconds){
       return false;
    }else{
      return true;
    }
  },
  getNowFormatDateWithSeconds() {
  let date = new Date();
  let seperator1 = "-";
  let seperator2 = ":";
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let strDate = date.getDate();
  if (month >= 1 && month <= 9) {
      month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
  }
  let currentdate = year + seperator1 + month + seperator1 + strDate
          + " " + date.getHours() + seperator2 + date.getMinutes()
          + seperator2 + date.getSeconds();
  return currentdate;
},
 addNum (num1, num2) {
       var sq1,sq2,m;
       try {
         sq1 = num1.toString().split(".")[1].length;
       }
       catch (e) {
         sq1 = 0;
       }
       try {
         sq2 = num2.toString().split(".")[1].length;
       }
       catch (e) {
         sq2 = 0;
       }
       m = Math.pow(10,Math.max(sq1, sq2));
       return ((num1 * m + num2 * m) / m).toFixed(2);
     },
	  minusNum (num1, num2) {
       var sq1,sq2,m;
       try {
         sq1 = num1.toString().split(".")[1].length;
       }
       catch (e) {
         sq1 = 0;
       }
       try {
         sq2 = num2.toString().split(".")[1].length;
       }
       catch (e) {
         sq2 = 0;
       }
       m = Math.pow(10,Math.max(sq1, sq2));
       return ((num1 * m - num2 * m) / m).toFixed(2);
     },
  getdate(time) {
    let now = new Date(time),
      y = now.getFullYear(),
      m = now.getMonth() + 1,
      d = now.getDate();
    return y + (m < 10 ? "0" + m : m) + (d < 10 ? "0" + d : d);
  },
  /**
   * @description 判断文件夹是否存在 如果不存在则创建文件夹
   */
  checkDirExist(p) {
    if (!fs.existsSync(p)) {
      fs.mkdirSync(p);
    }
  },
  getUploadDirName() {
    const date = new Date();
    let month = Number.parseInt(date.getMonth()) + 1;
    month = month.toString().length > 1 ? month : `0${month}`;
    const dir = `${date.getFullYear()}${month}${date.getDate()}`;
    return dir;
  },
  getUploadFileExt(name) {
    let ext = name.split(".");
    return ext[ext.length - 1];
  },
  deleteFile(path,callback) {
    fs.unlink(path,callback)
    log4js.debug("文件删除成功");
  },
};

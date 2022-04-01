/**
 * 文件管理模块
 */
 const router = require("koa-router")();
 const File = require("./../models/fileSchema")
const util = require('../utils/util.js')
 const fs = require("fs")
 const path = require("path")
 const config = require("./../config/index")
const images = require("images");

 router.post("/file",async (ctx) => {
     const {key} = ctx.request.body;
  
     let files
     

        if(ctx.request.files){
            files = ctx.request.files[key].length?ctx.request.files[key]:[ctx.request.files[key]]; 
	
        }else{
            files = [];
        }
     
        const fileReader = [];
        const fileName =[];
        const fileResource =[];
        const writeStream = [];
        const url = [];
        const results = [];
        // 设置文件保存路径
        const filePath = path.join(__dirname,"../",`storage/${util.getdate(Date.now())}/`);
		const compressedPath = `C://manager-server//storage//${util.getdate(Date.now())}` 
        util.checkDirExist(filePath)
         
		
   
	    try{
			  //多文件上传 
        for(let i in files){
          //  console.log(files[i])
            //读取文件流
           fileReader.push(fs.createReadStream(files[i].path));
           fileName.push(`${key}-${Date.now().toString(16)}.${util.getUploadFileExt(files[i].name)}`);
		
           // 组装成绝对路径
		   
           fileResource.push(filePath+`\/${fileName[i]}`);
           writeStream.push(fs.createWriteStream(fileResource[i]));
           fileReader[i].pipe(writeStream[i]);
		   
           url.push(`https://www.gxfjyz.com/storage/${util.getdate(Date.now())}/${fileName[i]}`)
		  
           const res = await File.create({
               key,
               path:url[i]
           })
            results.push({_id:res._id,name:res.key,path:url[i]})
        }
	
		//压缩图片
		for(let i in fileName){
			images(compressedPath+`//${fileName[i]}`).save(compressedPath+`//${fileName[i]}`,{quality:10})
		}
		}catch(err){
			ctx.body = util.fail(err,'fail',util.CODE.BUSINESS_ERROR)
		}
	  
    
        ctx.status = 201;
        ctx.body = util.success(results, "ok",util.CODE.FILE_UPLOAD_SUCCESS); 
    
 })
 router.get('/file',async (ctx) => {
      const {imageId} = ctx.request.query;
      let params = {}
      if(imageId||imageId==0) params._id = imageId;
      let imageList = await File.find(params,"_id path")||[];
      ctx.body = util.success(imageList)
 })
 router.delete('/file',async (ctx) => {
     const {_id} = ctx.request.query;
	
     let params = {}
     if(_id||_id==0) params._id = _id;
  
     if(typeof _id === 'undefined'){
		 ctx.status = 400
        ctx.body = util.fail("参数错误", util.CODE.PARAM_ERROR);
        return;
     }
     try {
        let imageList = await File.find(params,"_id path")||[];
        console.log(params);
        let url = path.join(__dirname,'../',imageList[0].path.split("/")[3]+"/"+imageList[0].path.split("/")[4]+"/"+imageList[0].path.split("/")[5])
            const res = await File.findOneAndRemove({_id:_id})
        util.deleteFile(url,()=>{})
        ctx.body = util.success(res, "文件删除成功");
     } catch (error) {
        ctx.body = util.fail(error.stack);
     }
 })
 module.exports = router;
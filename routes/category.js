/**
 * 分类管理模块
 */
 const router = require("koa-router")();
 const Category = require("./../models/categoryShema")
 const File = require("./../models/fileSchema")
 const util = require("./../utils/util");

 //查询分类
 router.get("/category",async (ctx)=>{
    const {_id,name} =ctx.request.query;
    const params={}
   
    if(_id) params._id = _id;
    if(name) params.name = name;
    let categoryList = await Category.find(params,"_id name imageId price")||[];
    for(let index in categoryList){
            const imagePath = await File.find({_id:categoryList[index].imageId},"path")
            
            categoryList[index]._doc['path'] = imagePath[0].path
         

    }
  
  
    ctx.body = util.success(categoryList)
 }) 
 //增加分类
 router.post("/category",async (ctx)=>{
     const {name=null,imageId=null,price=null} = ctx.request.body;
     if(!name  || typeof price === 'undefined'){
		 ctx.status = 400;
        ctx.body = util.fail({},"参数错误", util.CODE.PARAM_ERROR);
        return;
     }
   try {
    const res = await Category.create({
        name:name,
        imageId,
        price
   })
   ctx.body = util.success(res, "分类创建成功",util.CODE.SUCCESS);
   } catch (error) {
    ctx.body = util.fail(error.stack);
   }
 })
router.put("/category",async (ctx)=>{
    const {_id,...params} = ctx.request.body;
   if(typeof _id === 'undefined'){
	ctx.status = 400;
        ctx.body = util.fail({},"参数错误", util.CODE.PARAM_ERROR);
        return;
	}
    params.updateTime = new Date();
    try {
        const res = await Category.findOneAndUpdate({_id},params,{new:true})
        ctx.body = util.success(res, "分类更新成功",util.CODE.SUCCESS);
    } catch (error) {
        ctx.body = util.fail(error.stack);
    }
})
router.delete("/category",async(ctx)=>{
    const {_id} = ctx.request.query;
    if(typeof _id === 'undefined'){
	ctx.status = 400;
        ctx.body = util.fail({},"参数错误", util.CODE.PARAM_ERROR);
        return;
	}
    try {
        const res = await Category.findByIdAndRemove({_id})
        ctx.body = util.success(res, "分类删除成功",util.CODE.SUCCESS);
    } catch (error) {
        ctx.body = util.fail(error.stack);
    }
})
 module.exports = router;

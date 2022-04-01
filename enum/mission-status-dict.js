// 	待审核	0	1.在小程序中创建任意类型的服务之后会进入此状态；2.修改了一个已经发布的服务会重新进入此状态
// 	待发布	1	1.新增的服务在后台审核之后会进入此状态；2.主动暂停发布已经发布的服务会进入此状态。
// 	已发布	2	用户点击发布后会进入此状态
// 	已下架	3	因违规强制被强制下架后会进入此状态
// 	已取消	4	用户主动点击取消服务后会进入此状态

// 	审核不通过	5	新增的服务审核不通过会进入此状态
const missionDict = {
    // 待审核
    0:'pending' ,
    // 待发布
    1:'unpublished',
    // 已发布
    2:'published',
    // 已下架
    3:'off_shelves',
    // 已取消
    4:'canceled',
    //审核不通过
    5:'deny',
    
}

module.exports = missionDict
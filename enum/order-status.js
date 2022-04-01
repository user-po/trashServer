// 1	待同意	0	提交预约订单后预约订单会进入此状态
// 2	待支付	1	发布者同意后，预约订单会进入此状态
// 3	待确认	2	服务者支付订单金额后预约订单会进入此状态
// 4	待评价	3	用户确认了订单后预约订单会进入此状态
// 5	已完成	4	用户评价了订单后预约订单会进入此状态
// 6	已取消	5	服务者主动取消了订单预约订单会进入此状态
// 7	已拒绝	6	发布者拒绝了服务者的预约请求后预约订单会进入此状态

const orderStatus = {
    UNAPPROVED: 0,
    UNPAID: 1,
    UNCONFIRMED: 2,
    UNRATED: 3,
    COMPLETED: 4,
    CANCELED: 5,
    REFUSED: 6
}
module.exports = orderStatus;
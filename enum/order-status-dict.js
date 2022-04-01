// 1	待同意	0	提交预约订单后预约订单会进入此状态UNAPPROVED
// 2	待支付	1	发布者同意后，预约订单会进入此状态
// 3	待确认	2	服务者支付订单金额后预约订单会进入此状态UNCONFIRMED
// 4	待评价	3	用户确认了订单后预约订单会进入此状态COMPLETED
// 5	已完成	4	用户评价了订单后预约订单会进入此状态
// 6	已取消	5	服务者主动取消了订单预约订单会进入此状态CANCELED
// 7	已拒绝	6	发布者拒绝了服务者的预约请求后预约订单会进入此状态REFUSED

const orderStatus = {
    0:"unapproved",
    1: "unpaid",
    2: "unconfirmed",
    3: "unrated",
    4:"completed",
    5: "canceled",
    6:"refused"
}
module.exports = orderStatus;
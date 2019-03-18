var model = require('./model'),
    SystemConfigure = model.systemConfigure,
    Order = model.order,
    OrderSeq = model.orderSeq,
    request = require('request'),
    util = require("util"),
    schedule = require('node-schedule'),
    crypto = require('crypto');

// var Wechat = {
//     option: {
//         appid: "wx5cad60f2e7ffb4f9",
//         appSecret: "0135d0be4e95ba212cf3a8e9eb789ba7"
//     },
//     getWXToken: function () {
//         var that = this;
//         debugger;
//         return new Promise(function (resolve, reject) {
//             request.get(util.format('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s',
//                 that.option.appid,
//                 that.option.appSecret
//             ), function (error, response, body) {
//                 debugger;
//                 const data = JSON.parse(body);
//                 if (data.errcode) {
//                     reject(data.errmsg);
//                 } else {
//                     resolve(data);
//                 }
//             })
//         });
//     }
// };

function scheduleWeAppPay() {
    // 小程序支付，必須保持token
    schedule.scheduleJob('0 0 * * * *', function () {
        // console.log("log:" + (new Date()));
        Wechat.getWXToken()
            .then(result => {
                // console.log(result);
                return SystemConfigure.update({
                    value: JSON.stringify(result),
                    updatedDate: new Date()
                }, {
                    where: {
                        name: "access_token"
                    }
                });
            })
            .then(() => {
                // model.db.sequelize.close();
                // console.log("done!");
            });
    });
};

function scheduleDeleteSeqs() {
    // 刪除沒用的排队信息，每天自动操作
    // 自动过期没处理的订单
    schedule.scheduleJob('0 0 2 * * *', function () {
        Order.update({
            orderStatus: 12
        }, {
            where: {
                orderStatus: 0,
                payStatus: 2
            }
        });
        OrderSeq.destroy();
    });
};

scheduleDeleteSeqs();
// scheduleWeAppPay();
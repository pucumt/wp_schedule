var model = require('./model.js'),
    AdminEnrollTrain = model.adminEnrollTrain,
    TrainClass = model.trainClass,
    CouponAssign = model.couponAssign,
    schedule = require('node-schedule'),
    settings = require('./settings.js'),
    request = require('request'),
    crypto = require('crypto');

function scheduleCronstyle() {
    schedule.scheduleJob('0 * * * * *', function () {
        console.log('scheduleCronstyle:' + new Date());
        var now = new Date();
        now.setTime(now.getTime() - 1200000); //20 minutes
        AdminEnrollTrain.getFilters({
                isDeleted: false,
                isSucceed: 1,
                isPayed: false,
                createdDate: {
                    $lt: now
                }
            })
            .then(function (orders) {
                if (orders && orders.length > 0) {
                    orders.forEach(function (order) {
                        // 取消订单
                        // 1. 修改课程人数
                        // 2. 取消订单
                        // 3. 取消使用的优惠券
                        model.db.sequelize.transaction(function (t1) {
                                return AdminEnrollTrain.update({
                                        isSucceed: 9,
                                        deletedBy: "system",
                                        deletedDate: new Date()
                                    }, {
                                        where: {
                                            _id: order._id,
                                            isSucceed: 1
                                        },
                                        transaction: t1
                                    })
                                    .then(function (updateResult) {
                                        if (updateResult && updateResult[0]) {
                                            return TrainClass.update({
                                                    enrollCount: model.db.sequelize.literal('`enrollCount`-1')
                                                }, {
                                                    where: {
                                                        _id: order.trainId
                                                    },
                                                    transaction: t1
                                                })
                                                .then(function () {
                                                    return CouponAssign.update({
                                                        isUsed: false
                                                    }, {
                                                        where: {
                                                            orderId: order._id
                                                        },
                                                        transaction: t1
                                                    });
                                                });
                                        }
                                    });
                            })
                            .then(function () {
                                //console.log("取消成功" + order._id);
                                if (order.payWay == 6 || order.payWay == 7) {
                                    //send message back to swiftpass
                                    closeOrder(order._id, order.schoolArea);
                                }
                            })
                            .catch(function (err) {
                                console.log("取消失败");
                            });
                    });
                }
            });
    });
};

function toxml(sendObject) {
    var keys = Object.getOwnPropertyNames(sendObject).sort();
    var xmlContent = "<xml>";
    keys.forEach(function (key) {
        xmlContent = xmlContent + "<" + key + "><![CDATA[" + sendObject[key] + "]]></" + key + ">"
    });
    xmlContent = xmlContent + "</xml>";
    return xmlContent;
};

function getPaySetting(schoolName) {
    if (schoolName == "中南校区") {
        return settings.pays.topublic;
    } else {
        return settings.pays.toprivate;
    }
};

function closeOrder(id, schoolName) {
    var paySetting = getPaySetting(schoolName),
        sendObject = {
            'mch_id': paySetting.mch_id,
            'nonce_str': 'bfbeducation',
            'out_trade_no': id,
            'service': 'unified.trade.close'
        };
    var keys = Object.getOwnPropertyNames(sendObject).sort(),
        strPay = "";
    keys.forEach(function (key) {
        var v = sendObject[key];
        if ("sign" != key && "key" != key) {
            strPay = strPay + key + "=" + v + "&";
        }
    });
    strPay = strPay + "key=" + paySetting.key;
    var md5 = crypto.createHash('md5'),
        sign = md5.update(strPay).digest('hex').toUpperCase();
    sendObject.sign = sign;
    var data = toxml(sendObject);

    request.post({
            url: 'https://pay.swiftpass.cn:443/pay/gateway',
            body: data
        },
        function (error, response, body) {
            if (response.statusCode == 200) {} else {}
        }
    );
};

scheduleCronstyle();
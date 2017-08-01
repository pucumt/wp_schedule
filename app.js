var AdminEnrollTrain = require('./adminEnrollTrain.js'),
    TrainClass = require('./trainClass.js'),
    CouponAssign = require('./couponAssign.js'),
    schedule = require('node-schedule'),
    settings = require('./settings.js'),
    request = require('request'),
    crypto = require('crypto');

function scheduleCronstyle() {
    schedule.scheduleJob('0 * * * * *', function() {
        console.log('scheduleCronstyle:' + new Date());
        AdminEnrollTrain.getUnpays().then(function(orders) {
            if (orders && orders.length > 0) {
                orders.forEach(function(order) {
                    TrainClass.cancel(order.trainId)
                        .then(function(resultTrainClass) {
                            if (resultTrainClass && resultTrainClass.ok && resultTrainClass.nModified == 1) {
                                AdminEnrollTrain.cancel(order._id).then(function() {
                                    CouponAssign.release(order._id);
                                    //send message back to swiftpass
                                    closeOrder(order._id);
                                });
                            }
                        });
                });
            }
        });
    });
};

function toxml(sendObject) {
    var keys = Object.getOwnPropertyNames(sendObject).sort();
    var xmlContent = "<xml>";
    keys.forEach(function(key) {
        xmlContent = xmlContent + "<" + key + "><![CDATA[" + sendObject[key] + "]]></" + key + ">"
    });
    xmlContent = xmlContent + "</xml>";
    return xmlContent;
};

function closeOrder(id) {
    var sendObject = {
        'mch_id': settings.mch_id,
        'nonce_str': 'bfbeducation',
        'out_trade_no': id,
        'service': 'unified.trade.close'
    };
    var keys = Object.getOwnPropertyNames(sendObject).sort(),
        strPay = "";
    keys.forEach(function(key) {
        var v = sendObject[key];
        if ("sign" != key && "key" != key) {
            strPay = strPay + key + "=" + v + "&";
        }
    });
    strPay = strPay + "key=" + settings.key;
    var md5 = crypto.createHash('md5'),
        sign = md5.update(strPay).digest('hex').toUpperCase();
    sendObject.sign = sign;
    var data = toxml(sendObject);

    request.post({
            url: 'https://pay.swiftpass.cn:443/pay/gateway',
            body: data
        },
        function(error, response, body) {
            if (response.statusCode == 200) {} else {}
        }
    );
};

scheduleCronstyle();
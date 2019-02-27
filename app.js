var model = require('./model'),
    SystemConfigure = model.systemConfigure,
    request = require('request'),
    util = require("util"),
    schedule = require('node-schedule'),
    crypto = require('crypto');

var Wechat = {
    option: {
        appid: "wxa155aceaa74876cb",
        appSecret: "10266a3d9426016582b3ba34d937acc1"
    },
    getWXToken: function () {
        var that = this;
        debugger;
        return new Promise(function (resolve, reject) {
            request.get(util.format('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s',
                that.option.appid,
                that.option.appSecret
            ), function (error, response, body) {
                debugger;
                const data = JSON.parse(body);
                if (data.errcode) {
                    reject(data.errmsg);
                } else {
                    resolve(data);
                }
            })
        });
    }
};

function scheduleCronstyle() {
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

scheduleCronstyle();
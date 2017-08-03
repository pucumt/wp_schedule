var mongoose = require('./db');
var adminEnrollTrainSchema = new mongoose.Schema({
    studentId: String,
    studentName: String,
    mobile: String,
    trainId: String,
    trainName: String,
    trainPrice: { type: Number, default: 0 },
    materialPrice: { type: Number, default: 0 },
    discount: { type: Number, default: 100 },
    totalPrice: { type: Number, default: 0 }, //实际培训费
    realMaterialPrice: { type: Number, default: 0 }, //实际教材费
    rebatePrice: { type: Number, default: 0 }, //退费
    isSucceed: { type: Number, default: 1 }, //1 succeed, 9 canceled
    isPayed: { type: Boolean, default: false },
    payWay: Number, //0 cash 1 offline card 2 zhuanzhang 8 zhifubao 9 weixin
    isDeleted: { type: Boolean, default: false },
    orderDate: Date,
    cancelDate: Date,
    comment: String,
    fromId: String //调班从哪里调过来
}, {
    collection: 'adminEnrollTrains'
});

var adminEnrollTrainModel = mongoose.model('adminEnrollTrain', adminEnrollTrainSchema);

function AdminEnrollTrain(option) {
    this.option = option;
};

module.exports = AdminEnrollTrain;

AdminEnrollTrain.cancel = function(id) {
    return adminEnrollTrainModel.update({
        _id: id
    }, {
        isSucceed: 9,
        cancelDate: new Date()
    }).exec();
};

AdminEnrollTrain.getUnpays = function() {
    var now = new Date();
    now.setTime(now.getTime() - 1200000); //20 minutes
    var filter = {
        isDeleted: { $ne: true },
        isSucceed: 1,
        isPayed: { $ne: true },
        orderDate: { $lt: now }
    };
    return adminEnrollTrainModel.find(filter)
        .exec();
};
var crypto = require('crypto');
var mongoose = require('./db');
var db = mongoose.connection;

var couponAssignSchema = new mongoose.Schema({
    couponId: String,
    couponName: String,
    studentId: String,
    studentName: String,
    gradeId: String,
    gradeName: String,
    subjectId: String,
    subjectName: String,
    reducePrice: Number,
    couponStartDate: Date,
    couponEndDate: Date,
    isDeleted: { type: Boolean, default: false },
    isUsed: { type: Boolean, default: false },
    isExpired: { type: Boolean, default: false }, //useless now
    orderId: String //just used in train class now
}, {
    collection: 'couponAssigns'
});

var couponAssignModel = mongoose.model('couponAssign', couponAssignSchema);

function CouponAssign(option) {
    this.option = option;
};

module.exports = CouponAssign;

CouponAssign.release = function(orderId) {
    return couponAssignModel.update({ orderId: orderId }, { isUsed: false, orderId: null }, { multi: true }).exec();
};
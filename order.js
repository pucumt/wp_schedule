// 模板，可以用于自动生成entity

const db = require('../../db'),
    config = require('../../settings');

// 章节默认为4级，每级4位 最多16位
const Order = db.defineModel('orders', {
    userId: {
        type: db.INTEGER
    },
    shopId: {
        type: db.INTEGER
    },
    totalPrice: {
        type: db.DECIMAL(10, 2),
        defaultValue: 0
    },
    orderStatus: {
        type: db.INTEGER,
        defaultValue: 0,
        comment: "订单状态 0，未确认；10，已完成；11，已取消；12，过期无效；13，退货；"
    },
    payStatus: {
        type: db.INTEGER,
        defaultValue: 0,
        comment: "支付状态；0，未付款；1，付款中；2，已付款"
    },
    payWay: {
        // 支付方式，默认在线支付，也可以现金结算
        type: db.INTEGER,
        defaultValue: 0,
        comment: "支付方式；0，在线；1，现金；"
    },
    isPrint: {
        // 是否打印
        type: db.BOOLEAN,
        defaultValue: false
    },
    _id: {
        type: db.STRING(32),
        primaryKey: true,
        comment: "主键，非自增"
    },
    payDate:{
        type: db.DATE,
        allowNull: true
    }
});
module.exports = Order;

//读取用户信息
Order.getFilter = function (filter) {
    filter.isDeleted = false;
    return Order.findOne({
        'where': filter
    });
};

Order.getFilters = function (filter, orders) {
    filter.isDeleted = false;
    return Order.findAll({
        'where': filter,
        order: (orders || [
            ['createdDate', 'desc'],
            ['_id']
        ])
    });
};

Order.getFiltersWithPage = function (page, filter, orders) {
    filter.isDeleted = false;
    return Order.findAndCountAll({
        'where': filter,
        order: (orders || [
            ['createdDate', 'desc'],
            ['_id']
        ]),
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};
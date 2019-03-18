// 订单队列，取后删除该分订单

const db = require('../../db'),
    config = require('../../settings');

const OrderSeq = db.defineModel('orderSeqs', {
    orderId: {
        type: db.STRING(32)
    },
    orderTypeId: {
        type: db.INTEGER,
        defaultValue: 0
    },
    status: {
        type: db.INTEGER,
        defaultValue: 0
    } // 0 未支付 1 已支付
});
module.exports = OrderSeq;

//读取用户信息
OrderSeq.getFilter = function (filter) {
    filter.isDeleted = false;
    return OrderSeq.findOne({
        'where': filter
    });
};

OrderSeq.getFilters = function (filter) {
    filter.isDeleted = false;
    return OrderSeq.findAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ]
    });
};

OrderSeq.getFiltersWithPage = function (page, filter) {
    filter.isDeleted = false;
    return OrderSeq.findAndCountAll({
        'where': filter,
        order: [
            ['sequence'],
            ['createdDate'],
            ['_id']
        ],
        offset: config.pageSize * (page - 1),
        limit: config.pageSize
    });
};
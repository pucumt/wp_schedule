var AdminEnrollTrain = require('./adminEnrollTrain.js'),
    TrainClass = require('./trainClass.js'),
    schedule = require('node-schedule');

function scheduleCronstyle() {
    schedule.scheduleJob('0 * * * * *', function() {
        console.log('scheduleCronstyle:' + new Date());
        AdminEnrollTrain.getUnpays().then(function(orders) {
            if (orders && orders.length > 0) {
                orders.forEach(function(order) {
                    TrainClass.cancel(order.trainId)
                        .then(function(resultTrainClass) {
                            if (resultTrainClass && resultTrainClass.ok && resultTrainClass.nModified == 1) {
                                AdminEnrollTrain.cancel(order._id);
                                //send message back to swiftpass
                            }
                        });
                });
            }
        });
    });
}

scheduleCronstyle();
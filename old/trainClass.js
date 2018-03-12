var mongoose = require('./db');
var db = mongoose.connection;

var trainClassSchema = new mongoose.Schema({
    name: String,
    yearId: String,
    yearName: String,
    gradeId: String,
    gradeName: String,
    subjectId: String,
    subjectName: String,
    categoryId: String,
    categoryName: String,
    totalStudentCount: { type: Number, default: 0 }, //招生人数
    enrollCount: { type: Number, default: 0 }, //报名人数
    totalClassCount: { type: Number, default: 0 }, //共多少课时
    trainPrice: { type: Number, default: 0 },
    materialPrice: { type: Number, default: 0 },
    teacherId: String,
    teacherName: String,
    courseStartDate: Date,
    courseEndDate: Date,
    courseTime: String,
    courseContent: String,
    classRoomId: String,
    classRoomName: String,
    schoolId: String,
    schoolArea: String,
    isWeixin: { type: Number, default: 0 }, //0 new 1 publish 0 stop
    isStop: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    exams: [{
        examId: String,
        examName: String,
        minScore: Number
    }],
    isFull: { type: Boolean, default: false }
}, {
    collection: 'trainClasss'
});

var trainClassModel = mongoose.model('trainClass', trainClassSchema);

function TrainClass(option) {
    this.option = option;
};

module.exports = TrainClass;

TrainClass.cancel = function(id) {
    return trainClassModel.findOne({ _id: id, isDeleted: { $ne: true } })
        .then(function(exam) {
            return trainClassModel.update({
                _id: id
            }, {
                $inc: { enrollCount: -1 },
                isFull: false
            }).exec();
        });
};
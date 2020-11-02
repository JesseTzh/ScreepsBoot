const System = require('System');

module.exports.loop = function () {

    //初始化系统数据以及分析安排当前tick任务
    System.boot();

    //调动所有Creep以及建筑进行工作
    System.work();

    //执行统计监控、发送邮件等次要任务
    System.end();

}
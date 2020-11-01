const logger = require('utils.log').getLogger("System");
const ExtensionLoader = require('ExtensionLoader');
const DataCleaner = require('DataCleaner');
const Timer = require('Timer');
const Database = require('Database');

//系统启动
function boot() {
    //挂载各原型扩展
    ExtensionLoader();
    //清理内存以及global储存空间
    DataCleaner();
    //检查数据库是否需要刷新
    Database.checkDatabaseFlag();
    //计时器开始运作检查本tick工作
    Timer();
}

//系统关闭
function shutDown() {
    // TODO 添加能量短缺计数器
    //logger.info("---------------------------------------------- 游戏时间: " + Game.time + " | 所用CPU: " + Game.cpu.getUsed().toFixed(2) + "----------------------------------------------")
    //Game.cpu.generatePixel();
}

//系统运作
function work() {

    //Game.creeps["Harvester"].work();

}

module.exports = {
    boot: boot,
    shutDown: shutDown,
    work: work
}
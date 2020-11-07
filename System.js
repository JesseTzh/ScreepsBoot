const logger = require('Log').getLogger("System");
const ExtensionLoader = require('ExtensionLoader');
const DataCleaner = require('DataCleaner');
const Timer = require('Timer');
const Database = require('Database');
const creepManager = require('creepManager');

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
    //Creep管理
    creepManager.creepManager();
}

//系统关闭
function end() {
    // TODO 添加能量短缺计数器
    logger.info("---------------------------------------------- 游戏时间: " + Game.time + " | 所用CPU: " + Game.cpu.getUsed().toFixed(2) + "----------------------------------------------")
    //Game.cpu.generatePixel();
}

//系统运作
function work() {
    for (let name in Game.creeps) {
        Game.creeps[name].work();
    }
}

module.exports = {
    boot: boot,
    end: end,
    work: work
}
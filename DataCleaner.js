const Database = require('Database');
const logger = require('Log').getLogger("dataCleaner");

function cleanRomMemory() {
    //清除 Harvester 挖矿计数器
    cleanHarvesterMemory()
    //清除已不存在的 Creep Memory
    cleanCreepMemory()
}

function cleanHarvesterMemory() {
    for (let name in Memory.rooms) {
        delete Memory.rooms[name].Harvester;
    }
}

function cleanCreepMemory() {
    if (!Database.getCreepData()) {
        return;
    }
    for (let name in Memory.creeps) {
        if (! Database.getCreepData().has(name)) {
            delete Memory.creeps[name];
            logger.debug('删除不存在的Creep记录:', name);
        }
    }
}

function cleanDatabase() {

}

module.exports = function () {
    //清理内存数据
    cleanRomMemory();
    //清理 global 储存空间数据
    cleanDatabase();
}
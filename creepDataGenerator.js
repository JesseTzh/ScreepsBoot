/**
 * 数据库类
 *
 * 设计思路：
 * 本类意在将所有存储在 global 中的数据全部封装为类以提高维护性,并尽量通过本类中提供的接口方法而非直接操作 global 数据库
 * 其中包含：
 *      RoomData：以每个房间为单位存储了所有房间的建筑数据
 *      CreepData：以每个 Creep 为单位存储了所有 Creep 的相关数据
 */
const logger = require('Log').getLogger("creepDataGenerator");
const CreepData = require('creepData');

function generate(room) {
    return getHarvesterList(room);
}

function getHarvesterList(room) {
    let creepDataMap = new Map();
    const roomLevel = room.controller.level;
    //根据房间等级生成的 Harvester 数量
    let harvesterNum;
    //Harvester 生成方式
    var harvesterGenerateMode;
    switch (true) {
        case roomLevel <= 3:
            harvesterNum = 6;
            harvesterGenerateMode = "Auto";
            break;
        case roomLevel <= 5:
            harvesterNum = 4;
            harvesterGenerateMode = "Auto";
            break;
        case roomLevel <= 8:
            harvesterNum = 2;
            harvesterGenerateMode = "Config";
            break;
    }
    while (harvesterNum > 0) {
        let harvesterName = `Harvester-${room.name}-${harvesterNum}`;
        let harvestData = new CreepData().initData(harvesterName, "Harvester", harvesterGenerateMode, room.name);
        creepDataMap.set(harvesterName, harvestData);
        harvesterNum--;
    }
    return creepDataMap;
}


module.exports = {
    generate: generate
}
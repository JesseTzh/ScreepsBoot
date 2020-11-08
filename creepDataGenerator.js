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

function generate(room, creepDataList) {
    creepDataList = getHarvesterList(room, creepDataList);
    creepDataList = getUpgraderList(room, creepDataList);
    creepDataList = getBuilderList(room, creepDataList)
    return creepDataList;
}

function getHarvesterList(room, creepDataList) {
    const roomLevel = room.controller.level;
    //根据房间等级生成的 Harvester 数量
    let harvesterNum;
    //Harvester 生成方式
    let generateMode;
    switch (true) {
        case roomLevel <= 3:
            harvesterNum = 6;
            generateMode = "Auto";
            break;
        case roomLevel <= 5:
            harvesterNum = 4;
            generateMode = "Auto";
            break;
        case roomLevel <= 8:
            harvesterNum = 2;
            generateMode = "Config";
            break;
    }
    while (harvesterNum > 0) {
        const harvesterName = `Harvester-${room.name}-${harvesterNum}`;
        const harvestData = new CreepData().initData(harvesterName, "Harvester", generateMode, room.name);
        creepDataList.set(harvesterName, harvestData);
        harvesterNum--;
    }
    return creepDataList;
}

function getUpgraderList(room, creepDataList) {
    const roomLevel = room.controller.level;
    //根据房间等级生成的 Upgrader 数量
    let upgraderNum;
    //Upgrader 生成方式
    let generateMode;
    switch (true) {
        case roomLevel <= 3:
            upgraderNum = 5;
            generateMode = "Auto";
            break;
        case roomLevel <= 5:
            upgraderNum = 2;
            generateMode = "Auto";
            break;
        case roomLevel <= 8:
            upgraderNum = 1;
            generateMode = "Config";
            break;
    }
    while (upgraderNum > 0) {
        const upgraderName = `Upgrader-${room.name}-${upgraderNum}`;
        const upgraderData = new CreepData().initData(upgraderName, "Upgrader", generateMode, room.name);
        creepDataList.set(upgraderName, upgraderData);
        upgraderNum--;
    }
    return creepDataList;
}

function getBuilderList(room, creepDataList) {
    const builderName = `Builder-${room.name}-1`;
    let builderData = new CreepData().initData(builderName, "Builder", "Auto", room.name);
    creepDataList.set(builderName, builderData);
    global.database.roomData.get(room.name).builder = builderName;
    return creepDataList;
}

module.exports = {
    generate: generate
}
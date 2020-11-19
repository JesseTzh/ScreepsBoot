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
const CONFIG_CREEP_DATA = require('config.creep.data');

function generate(room, creepDataList) {
    creepDataList = getHarvesterList(room, creepDataList);
    creepDataList = getUpgraderList(room, creepDataList);
    creepDataList = getBuilderList(room, creepDataList);
    creepDataList = getMoverList(room, creepDataList);
    return creepDataList;
}

function getHarvesterList(room, creepDataList) {
    const creepData = CONFIG_CREEP_DATA["Harvester"].amount[room.controller.level];
    //根据房间等级生成的 Harvester 数量
    let harvesterNum= creepData[0];
    //Harvester 生成方式
    const generateMode = creepData[1];
    while (harvesterNum > 0) {
        let harvesterName = `Harvester-${room.name}-${harvesterNum}`;
        let harvestData = new CreepData().initData(harvesterName, "Harvester", generateMode, room.name);
        creepDataList.set(harvesterName, harvestData);
        harvesterNum--;
    }
    return creepDataList;
}

function getUpgraderList(room, creepDataList) {
    const creepData = CONFIG_CREEP_DATA["Upgrader"].amount[room.controller.level];
    //根据房间等级生成的 Upgrader 数量
    let upgraderNum = creepData[0];
    //Upgrader 生成方式
    let generateMode = creepData[1];
    while (upgraderNum > 0) {
        let upgraderName = `Upgrader-${room.name}-${upgraderNum}`;
        let upgraderData = new CreepData().initData(upgraderName, "Upgrader", generateMode, room.name);
        creepDataList.set(upgraderName, upgraderData);
        upgraderNum--;
    }
    return creepDataList;
}

function getBuilderList(room, creepDataList) {
    const creepData = CONFIG_CREEP_DATA["Builder"].amount[room.controller.level];
    //根据房间等级生成的 Builder 数量
    let builderNum = creepData[0];
    //Builder 生成方式
    let generateMode = creepData[1];
    while (builderNum > 0) {
        let builderName = `Builder-${room.name}-${builderNum}`;
        let builderData = new CreepData().initData(builderName, "Builder", generateMode, room.name);
        creepDataList.set(builderName, builderData);
        builderNum--;
    }
    //global.database.roomData.get(room.name).builder = builderName;
    return creepDataList;
}

function getMoverList(room, creepDataList) {
    const creepData = CONFIG_CREEP_DATA["Mover"].amount[room.controller.level];
    //根据房间等级生成的 Mover 数量
    let moverNum = creepData[0];
    //Mover 生成方式
    let generateMode = creepData[1];
    while (moverNum > 0) {
        let moverName = `Mover-${room.name}-${moverNum}`;
        let moverData = new CreepData().initData(moverName, "Mover", generateMode, room.name);
        creepDataList.set(moverName, moverData);
        moverNum--;
    }
    return creepDataList;
}

module.exports = {
    generate: generate
}
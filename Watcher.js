const CONFIG = require('config');
const logger = require('utils.log').getLogger("Watcher");
const Observer = require('Construction_Observer');

function beginWatch() {
    // const cpuUsedBefore = Game.cpu.getUsed();

    // 监测外矿房间敌人
    defenseOuterRoom();
    // 监测Mine是否刷新
    mineMonitor();
    // 监测领地房间是否有建筑工地
    constructionSiteMonitor();
    // 监测房间资源状况并下发生产任务
    checkIndustryTask();

    //监测者探测外界房间
    //observer();
    // const cpuUsed = Game.cpu.getUsed() - cpuUsedBefore;
    // logger.info("守望者CPU用量：" + cpuUsed)

    //定时发送邮件报告房间能量情况
    gameStatusReport();
}

function defenseOuterRoom() {
    // 检测是否有对应的外矿配置文件
    if (!CONFIG.EXTERNAL_ROOMS) {
        return
    }
    // 遍历控制的房间列表（非外矿房间）
    for (let roomName in CONFIG.EXTERNAL_ROOMS) {
        // 控制房间所对应的外矿房间遍历
        for (let i = 0; i < CONFIG.EXTERNAL_ROOMS[roomName][0].length; i++) {
            //检测对应守卫是否已经是战时状态
            if (Memory.creeps[CONFIG.EXTERNAL_ROOMS[roomName][1][0]] && Memory.creeps[CONFIG.EXTERNAL_ROOMS[roomName][1][0]].Target != "Yes") {
                // 外矿房间名称
                let externalRoomName = CONFIG.EXTERNAL_ROOMS[roomName][0][i];
                // 外矿房间对象
                let room = Game.rooms[externalRoomName];
                // 丢失此外矿房间视野
                if (!room) {
                    let message = '丢失房间[' + externalRoomName + ']的视野，请注意！';
                    logger.info(message);
                    //发送邮件通知外矿视野丢失
                    //Game.notify(message);
                    continue;
                }
                // 首先检测是否有敌对 Creep
                let target = room.find(FIND_HOSTILE_CREEPS);
                if (!target.length) {
                    // 再检测是否有要塞核心刷出
                    target = room.find(FIND_HOSTILE_STRUCTURES);
                }
                if (target && target.length) {
                    logger.info("侦测到[" + externalRoomName + "]有敌人入侵！");
                    Memory.creeps[CONFIG.EXTERNAL_ROOMS[roomName][1][0]].TargetRoom = externalRoomName;
                    Memory.creeps[CONFIG.EXTERNAL_ROOMS[roomName][1][0]].Target = "Yes";
                    if (target.length > 1) {
                        Game.notify("侦测到[" + externalRoomName + "]有多个敌人入侵！");
                    }
                }
            }
        }
    }
}

function mineMonitor() {
    for (let roomName of global.roomArray) {
        if (Game.rooms[roomName].controller.level < 6) {
            logger.debug(`房间[${roomName}]控制等级尚未达到6级,无法挖矿.`);
            continue;
        }
        if (!CONFIG.MINE[roomName]) {
            logger.info(`房间[${roomName}]尚未配置挖矿者`);
            continue;
        }
        let mine = Game.getObjectById(Game.rooms[roomName].getMineral());
        if (mine.mineralAmount > 0 || (mine.mineralAmount === 0 && mine.ticksToRegeneration <= 30)) {
            Memory.creeps[CONFIG.MINE[roomName][1]].RebornFlag = "Yes";
        } else {
            Memory.creeps[CONFIG.MINE[roomName][1]].RebornFlag = "No";
        }
    }
}

function constructionSiteMonitor() {
    // 检测是否有对应的配置文件
    if (!CONFIG.ROOMS_BUILDER) {
        return
    }
    for (let roomName in CONFIG.ROOMS_BUILDER) {
        // TODO 添加房间过滤器，以实现对于不同房间的操控
        //首先检测内存中是否有对应建造者记录（起码出生过一次）
        if (Memory.creeps[CONFIG.ROOMS_BUILDER[roomName][0]]) {
            let builderFlag = "No";
            if (Game.rooms[roomName].storage) {
                const roomStorageEnergy = Game.rooms[roomName].storage.store.getUsedCapacity(RESOURCE_ENERGY);
                // 房间 Storage 中储存有能量
                if (roomStorageEnergy > 10000) {
                    const constructionSite = Game.rooms[roomName].find(FIND_MY_CONSTRUCTION_SITES);
                    // 房间内有建筑工地，则允许建造者重生
                    if (constructionSite.length > 0) {
                        builderFlag = "Yes";
                    } else {
                        //如果有待修建的城墙等等，也允许重生
                        const repairConstruction = Game.rooms[roomName].find(FIND_STRUCTURES, {
                            filter: (structure) => {
                                return (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
                                    structure.hits / structure.hitsMax <= 0.01;
                            }
                        })
                        if (repairConstruction.length > 0) {
                            //builderFlag = "Yes";
                        }
                    }
                }
            }
            Memory.creeps[CONFIG.ROOMS_BUILDER[roomName][0]].RebornFlag = builderFlag;
        }
    }
}

function observer() {
    // 检测是否有对应的配置文件
    if (!CONFIG.OBSERVER_ROOMS) {
        return
    }
    for (let roomName in CONFIG.OBSERVER_ROOMS) {
        let roomNum = Game.time % CONFIG.OBSERVER_ROOMS[roomName][0].length;
        Observer.observerWork(CONFIG.OBSERVER_ROOMS[roomName][0][roomNum], CONFIG.OBSERVER_ROOMS[roomName][1]);
        if (roomNum === 0) {
            roomNum = CONFIG.OBSERVER_ROOMS[roomName][0].length;
        }
        // 上一 tick 探测的房间这一 tick 才是可见
        roomNum--;
        let room = Game.rooms[CONFIG.OBSERVER_ROOMS[roomName][0][roomNum]];
        if (!CONFIG.OBSERVER_ROOMS[roomName][0][roomNum] || !room) {
            logger.warn("房间[" + CONFIG.OBSERVER_ROOMS[roomName][0][roomNum] + "]未能成功侦测！");
            continue;
        }
        const target = room.find(FIND_STRUCTURES, {
            filter: {structureType: STRUCTURE_POWER_BANK}
        });
        if (target.length) {
            const message = "房间[" + CONFIG.OBSERVER_ROOMS[roomName][0][roomNum] + "]发现超能！";
            logger.info(message);
            //Game.notify(message);
        }
    }
}

function gameStatusReport() {
    if (Game.time % 3000 === 0) {
        let message = "Screeps房间状态检测报告：\n";
        for (let roomName of global.roomArray) {
            let room = Game.rooms[roomName];
            let energyStatus = (room.getRatioOfEnergy() * 100).toFixed(2);
            message += `房间[${roomName}]当前能量比例为:${energyStatus}%`;
            if (room.storage) {
                let storageFreeCapacity = room.storage.store.getFreeCapacity();
                message += `,Storage剩余容量为[${storageFreeCapacity}]\n`;
                // for (let resource in room.storage.store) {
                //     if (room.storage.store.getUsedCapacity(resource) > 10000) {
                //         message += `  ${resource}储量：${room.storage.store.getUsedCapacity(resource)}\n`;
                //     }
                // }
            } else {
                message += `\n`;
            }
            //message += `----------------------------------------------------------\n`;
        }
        Game.notify(message);
        logger.info(message);
    }
}

function checkIndustryTask() {
    for (let roomName in CONFIG.DEFAULT_PRODUCTION) {
        const room = Game.rooms[roomName];
        if (!global.roomData.get(roomName).factory || !room.storage) {
            return;
        }
        let storageEnergy = room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
        //冗余能量大于 10000
        if (storageEnergy > 100000) {
            //检测当前需要搬运什么样的物资
            checkWhatResourceNeedMove(room);
        } else {
            room.memory.moveResource = null;
        }
    }
}

function checkWhatResourceNeedMove(room) {
    const factory = Game.getObjectById(room.getFactory());
    if (!room.memory.moveResource) {
        //工厂当前生产成品超过 100 则搬运出去
        if (factory.store.getUsedCapacity(CONFIG.DEFAULT_PRODUCTION[room.name]) >= 100) {
            room.memory.moveResource = CONFIG.DEFAULT_PRODUCTION[room.name];
            room.memory.direction = "Out";
        }
        //有电池则先搬电池出去，防止后期堆积
        else if (factory.store.getUsedCapacity(RESOURCE_BATTERY) >= 100) {
            room.memory.moveResource = RESOURCE_BATTERY;
            room.memory.direction = "Out";
        }
        //工厂当前生产原材料低于 20000 则搬运进来
        else if (factory.store.getUsedCapacity(Game.getObjectById(room.getMineral()).mineralType) < 20000 && room.storage.store.getUsedCapacity((Game.getObjectById(room.getMineral()).mineralType)) > 0) {
            room.memory.moveResource = Game.getObjectById(room.getMineral()).mineralType;
            room.memory.direction = "In";
        }
        //工厂当前能量少于 20000 则搬运进来
        else if (factory.store.getUsedCapacity(RESOURCE_ENERGY) < 20000) {
            room.memory.moveResource = RESOURCE_ENERGY;
            room.memory.direction = "In";
        }
    } else {
        if (factory.store.getUsedCapacity(room.memory.moveResource) == 0 && room.memory.direction === "Out") {
            room.memory.moveResource = null;
        } else if (room.memory.moveResource === RESOURCE_ENERGY && factory.store.getUsedCapacity(RESOURCE_ENERGY) >= 20000) {
            room.memory.moveResource = null;
        } else if (room.memory.moveResource === Game.getObjectById(room.getMineral()).mineralType && factory.store.getUsedCapacity(Game.getObjectById(room.getMineral()).mineralType) >= 20000) {
            room.memory.moveResource = null;
        }
    }
}

module.exports = {
    beginWatch: beginWatch
};
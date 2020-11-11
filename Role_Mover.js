const logger = require('Log').getLogger("Mover");
const SYS_CONFIG = require('config.system.setting');

function freeJob(creep) {
    //寻找遗弃资源
    let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
    if (target && creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
        logger.debug(creep.name + "发现遗弃资源！");
        const result = creep.pickup(target);
        if (result === ERR_NOT_IN_RANGE) {
            creep.say("🚮");
            creep.moveTo(target);
        } else if (result === OK && target.resourceType !== RESOURCE_ENERGY) {
            //如果捡到了除了能量之外的资源要去清理背包
            creep.memory.NeedCleanBag = true;
        }
        return;
    } else if (!target) {
        //尝试提取墓碑中的资源
        target = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
            filter: (structure) => {
                return structure.store[RESOURCE_ENERGY] > 0;
            }
        });
        if (target && creep.store[RESOURCE_ENERGY] < creep.store.getCapacity()) {
            logger.debug(creep.name + "发现墓碑资源！");
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            return;
        }
    }
    if (!target) {
        logger.debug(creep.name + "找不到被遗弃的资源！尝试续命...");
        creep.selfFix();
    }
}

function checkTowerEnergy(creep) {
    const towerList = creep.room.getTowerList();
    if (towerList) {
        for (let i = 0; i < towerList.length; i++) {
            let tower = Game.getObjectById(towerList[i]);
            if (tower.store[RESOURCE_ENERGY] / TOWER_CAPACITY <= SYS_CONFIG.TOWER_ENERGY_NEED) {
                return true;
            }
        }
    }
}

module.exports = ({
    // 提取能量矿
    source: creep => {
        creep.say("🔽");
        let source;
        if (creep.memory.NeedCleanBag) {
            creep.cleanBag(RESOURCE_ENERGY);
            return;
        }
        const sourceLinkList = creep.room.getSourceLinkList();
        //如果未达房间能量上限
        if (creep.room.energyAvailable / creep.room.energyCapacityAvailable < 0.9 || checkTowerEnergy(creep)) {
            //优先从冗余储能建筑提取能量：只有未达房间能量上限时才从 Storage 中提取能量，只有达到房间能量上限才向 STORAGE 储存能量，避免原地举重现象
            if(creep.room.storage.store[RESOURCE_ENERGY] > 0){
                source = creep.room.storage;
            }
            //如果依旧没有可用的储能建筑，则使用 Terminal 或 Factory 中的能量
            if (!source) {
                source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_TERMINAL || structure.structureType === STRUCTURE_FACTORY) &&
                            structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            //冗余储能建筑消耗完毕，使用Link中的能量
            if (!source) {
                for (let i = 0; i < sourceLinkList.length; i++) {
                    //为避免反复去同一Link提取刚刚挖出的那一点能量，故设置为Link能量大于400时再提取，以使Mover优先去能量较多的Link中提取
                    if (Game.getObjectById(sourceLinkList[i]).store[RESOURCE_ENERGY] > 400) {
                        source = Game.getObjectById(sourceLinkList[i]);
                        break;
                    }
                }
            }
            //如果达到房间能量上限，并且 Link 当前储量超过一半时，直接从 Link 中提取
        } else if (creep.room.energyAvailable / creep.room.energyCapacityAvailable >= 0.9 && SYS_CONFIG.ALLOW_STORE_ENERGY) {
            for (let i = 0; i < sourceLinkList.length; i++) {
                source = Game.getObjectById(sourceLinkList[i]);
                if (source.store[RESOURCE_ENERGY] / LINK_CAPACITY >= 0.5) {
                    break;
                }
            }
        }
        if (!source || source.store[RESOURCE_ENERGY] === 0) {
            logger.debug(creep.name + "找不到可以提取能量的建筑，切换为自由工作");
            freeJob(creep);
        } else {
            const result = creep.withdraw(source, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                creep.moveTo(source);
            }
        }
    },
    // 转移
    target: creep => {
        creep.say("🔼");
        if (creep.memory.NeedCleanBag) {
            creep.cleanBag(RESOURCE_ENERGY);
            return;
        }
        //优先供给 Extension
        let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType === STRUCTURE_EXTENSION &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        });
        if (!target) {
            //Extension 已满，再向 Spawn 供能
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType === STRUCTURE_SPAWN &&
                        structure.store.getUsedCapacity(RESOURCE_ENERGY) / structure.store.getCapacity(RESOURCE_ENERGY) < 0.9;
                }
            });
        }
        if (!target) {
            //按照配置文件中的参数为能量低于一定比例的Tower冲能
            const towerList = creep.room.getTowerList();
            if (towerList) {
                for (let i = 0; i < towerList.length; i++) {
                    let tower = Game.getObjectById(towerList[i]);
                    if (tower.store[RESOURCE_ENERGY] / TOWER_CAPACITY <= SYS_CONFIG.TOWER_ENERGY_NEED) {
                        target = tower;
                    }
                }
            }
        }
        //如果升级Controller所用Link能量断供则向其运输能量
        if (!target && creep.room.getControllerLink()) {
            const upgradeId = Game.getObjectById(creep.room.getControllerLink());
            if (upgradeId.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                target = upgradeId
            }
        }
        //如果 Spawn/Extension/Tower 都已满,根据config文件配置的参数决定是否进一步将能量存入冗余能量存储建筑
        if (!target && SYS_CONFIG.ALLOW_STORE_ENERGY) {
            target = creep.room.storage;
            //如果房间内没有Storage或已满，则搜寻其他可以储能的建筑
            if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return ((structure.structureType === STRUCTURE_TERMINAL || structure.structureType === STRUCTURE_FACTORY || structure.structureType === STRUCTURE_CONTAINER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                    }
                });
            }
        }
        if (target && target.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else {
            logger.debug(`[${creep.name}]找不到需要存入能量的建筑，切换为自由工作`);
            freeJob(creep);
        }
    },
    // 状态切换条件
    switch: creep => creep.updateState()
})
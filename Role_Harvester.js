const logger = require('utils.log').getLogger("Harvester");
const SYS_CONFIG = require('config.system.setting');

module.exports = ({
    // 采集能量矿
    source: creep => {
        creep.room.memory.Harvester != 0 ? creep.room.memory.Harvester = 0 : creep.room.memory.Harvester = 1;
        let source = Game.getObjectById(creep.room.getSourceList()[creep.room.memory.Harvester]);
        // TODO 判断当前能源点刷新时间较长且另一矿还有很多剩余再进行切换
        if (!source || source.energy === 0) {
            logger.info(creep.name + "找不到默认采矿点或默认采矿点为空,切换为备用矿源");
            source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
        }
        if ((source && source.energy > 0)) {
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.say("⛏");
                creep.moveTo(source);
            }
        } else if (!source || source.energy === 0) {
            creep.say("🚬");
            logger.debug(creep.name + "找不到可挖掘的矿点！");
            creep.selfFix();
        }
    },
    // 存储能量逻辑
    target: creep => {
        creep.room.memory.Harvester != 0 ? creep.room.memory.Harvester = 0 : creep.room.memory.Harvester = 1;
        let target = Game.getObjectById(creep.room.getSourceLinkList()[creep.room.memory.Harvester]);
        //如默认储能建筑已满/不存在则存储至最近的 EXTENSION/SPAWN
        if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) < 2) {
            logger.debug(creep.name + "距离矿点最近Link不存在/已存满，转存至最近的 EXTENSION/SPAWN");
            target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            //如 EXTENSION/SPAWN 已满则存入 TOWER
            if (!target) {
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
            //如所有 EXTENSION/SPAWN/TOWER 都已放满则存入 STORAGE/CONTAINER
            if (!target) {
                logger.debug(creep.name + "其余建筑已满，转存入冗余储能建筑 STORAGE/CONTAINER");
                target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
        }
        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.say("🔼");
                creep.moveTo(target);
            }
        } else {
            //所有建筑已满，无法继续存入矿物，一般存在于前期没有冗余能量存储建筑的情况
            logger.warn(creep.name + "找不到可用的储能设备！")
            creep.say("🈵");
            creep.selfFix();
        }
    },
    // 状态切换条件
    switch: creep => creep.updateState()
})
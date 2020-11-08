const logger = require('Log').getLogger("Upgrader");

module.exports = ({
    // 提取能量矿
    source: creep => {
        var source = Game.getObjectById(creep.room.getControllerLink());
        if (!source || source.store.getUsedCapacity(RESOURCE_ENERGY) < 1) {
            logger.debug(creep.name + ': 默认取能建筑存量为空或找不到指定的取能建筑！')
            source = null;
        }
        if (!source) {
            //默认取能建筑为空，尝试从其他冗余储能建筑提取能量
            logger.debug(creep.name + "尝试从Storage中提取能量");
            source = creep.room.storage;
            //冗余储能建筑也为空，若在配置文件中允许，则从 EXTENSION/SPAWN 提取能量
            if (!source || source.store.getUsedCapacity(RESOURCE_ENERGY) < 1) {
                logger.debug(creep.name + "尝试从 EXTENSION/SPAWN 获取");
                source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store[RESOURCE_ENERGY] > 0;
                    }
                });
            }
        }
        if (source) {
            if (creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.say("🔽");
                creep.moveTo(source);
            }
        } else {
            creep.say("🚬");
            logger.warn(creep.name + "找不到可用的取能设施")
            creep.selfFix();
        }
    },
    // 升级Controller
    target: creep => {
        const controller = creep.room.controller;
        if (creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
            creep.say("💡");
            creep.moveTo(controller);
        }
    },
    // 状态切换条件
    switch: creep => creep.updateState()
})
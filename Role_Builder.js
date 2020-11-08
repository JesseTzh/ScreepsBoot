const logger = require('Log').getLogger("Builder");

module.exports = ({
    //提取能量
    source: creep => {
        var source = creep.room.storage;
        //如果当前房间没有Storage或者Storage能量储量为空
        if (!source || source.store.getUsedCapacity(RESOURCE_ENERGY) < 1) {
            logger.debug(creep.name + "默认取能建筑存量为空！")
            //从冗余建筑中提取能量
            source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_TERMINAL || structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_FACTORY) &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            //根据config文件的参数看是否允许从默认能量提取建筑之外的建筑提取能量
            if (!source || source.store.getUsedCapacity(RESOURCE_ENERGY) < 1) {
                source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_LINK || structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN) &&
                            structure.store[RESOURCE_ENERGY] > 0;
                    }
                });
            }
        }
        if (source && source.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            if (creep.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.say("🚚");
                creep.moveTo(source);
            }
        } else {
            logger.info(creep.name + "找不到可用的取能建筑！");
            creep.say("🈳");
        }
    },
    // 建造
    target: creep => {
        let targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        if (targets.length) {
            creep.say("🌇");
            if (creep.build(targets[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        } else {
            targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
                        structure.hits / structure.hitsMax <= 0.01;
                }
            })
            if (targets.length && creep.repair(targets[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0]);
            }
        }
    },
    // 状态切换条件
    switch: creep => creep.updateState()
})
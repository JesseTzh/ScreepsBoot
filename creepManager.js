const logger = require('Log').getLogger("CreepManager");
const Database = require('Database');
const generator = require('creepTemplateGenerator');

function creepManager() {
    //存储本 Tick 内正忙的 Spawn
    let spawnBusyList = new Set();
    //遍历数据库中所有 Creep 数据
    for (let [name, creepTemplateConfig] of Database.getCreepData()) {
        if (!Game.creeps[name]) {
            //检查重生标记
            if (checkCreepRebornFlag(name)) {
                continue;
            }
            const room = Game.rooms[creepTemplateConfig.roomName];
            if (room.energyAvailable >= 300) {
                //初始化本房间 Creep 模板
                const creepTemplate = generator.genTemplate(creepTemplateConfig.roomName);
                //根据 Creep 数据生成模板
                const template = creepTemplate.getTemplate(creepTemplateConfig);
                //获取当前房间空闲 Spawn
                const freeSpawn = room.getFreeSpawn(spawnBusyList);
                if (!freeSpawn) {
                    logger.info(`${room}已没有空闲 Spawn 孵化 Creep！`);
                    continue;
                }
                const spawnName = freeSpawn.name;
                //尝试孵化 Creep
                const result = Game.spawns[spawnName].spawnCreep(template, name);
                if (result === ERR_NOT_ENOUGH_ENERGY) {//孵化失败：没有足够能量
                    //尝试使用自适应模板重生
                    tryAdaptionReborn(spawnName, creepTemplateConfig);
                    return;
                } else if (result === OK) {//孵化成功
                    logger.info('正在重生 : ' + name);
                    //当前 Creep 重生失败计数归零
                    Memory.creeps[name].RebornFailTimes = 0;
                    //将孵化使用的 Spwan 标记为忙碌，不再参与本 Tick 孵化工作
                    spawnBusyList.add(spawnName);
                } else {//孵化失败：其他错误，大概率是系统Bug产生，需要重视
                    logger.warn("[" + name + "]重生失败！错误代码：" + result);
                }
            }
        }
    }
}

//检查 Creep 是否已被暂停重生
function checkCreepRebornFlag(name) {
    if (Memory.creeps[name] && Memory.creeps[name].RebornFlag && Memory.creeps[name].RebornFlag === "No") {
        logger.debug("[" + name + ']已被暂停重生');
        return true;
    } else {
        return false;
    }
}

//房间能量不足尝试使用自适应模板重生
function tryAdaptionReborn(freeSpawnName, creepTemplateConfig) {
    // Creep 所在房间
    const room = Game.rooms[creepTemplateConfig.roomName];
    // Creep 内存记忆
    const creepMemory = Memory.creeps[creepTemplateConfig.name];
    // 如果是Mover则立刻尝试自适应重生，如不是，则累加重生计数
    if (!isMover(freeSpawnName, creepTemplateConfig) && creepMemory) {
        //重生失败计数 + 1
        creepMemory.RebornFailTimes === null ? creepMemory.RebornFailTimes = 1 : creepMemory.RebornFailTimes += 1;
        logger.info(`[${creepTemplateConfig.name}]第[${creepMemory.RebornFailTimes}] Tick 重生失败！`)
        //如果超过 200 Tick 重生失败则采用自适应模板
        if (creepMemory.RebornFailTimes > 200) {
            // TODO 更优雅的方式判断是否可以使用自动生成模板
            // if (canNotUseSelfAdaptionTemplate(name)) {
            //     //不能使用自适应模板生成的Creep
            //     logger.warn(name + "不能使用自适应模板生成，跳过重生！");
            // }
            //生成自适应模板
            const tempTemplate = generator.genTemplate(room.name).getSelfAdaptionTemplate();
            //尝试以自适应模板孵化
            const result = Game.spawns[freeSpawnName].spawnCreep(tempTemplate, creepTemplateConfig.name);
            if (result === OK) {
                let message = creepTemplateConfig.name + "长时间重生失败，使用自适应模板......";
                logger.info(message);
            } else {
                let message = `${creepTemplateConfig.name}使用自适应模板重生出错，错误代码:[${result}]`
                logger.info(message);
                Game.notify(message);
            }
        }
    }
}

//判断 Creep 是否为 Mover 并尝试使用自适应模板重生
function isMover(freeSpawnName, creepTemplateConfig) {
    let flag = false;
    if (creepTemplateConfig.role === "Mover") {
        // TODO 此处代码可与 tryAdaptionReborn 方法合并
        const template = generator.genTemplate(creepTemplateConfig.roomName).getMoverSelfAdaptionTemplate();
        const result = Game.spawns[freeSpawnName].spawnCreep(template, creepTemplateConfig.name);
        if (result === OK) {
            let message = `[${creepTemplateConfig.name}]已使用自适应模板重生！\n,自适应模板为：${template}`;
            logger.info(message);
            flag = true;
            //重生失败计数归零
            Memory.creeps[creepTemplateConfig.name].RebornFailTimes = 0;
        } else {
            let message = `${name}使用自适应模板重生出错，错误代码:[${result}]`;
            logger.info(message);
            Game.notify(message);
        }
    }
    return flag;
}

module.exports = {
    creepManager: creepManager
};

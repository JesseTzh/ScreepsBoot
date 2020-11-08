const logger = require('Log').getLogger("Tower");
const SYS_CONFIG = require('config.system.setting');
const Database = require('Database');

function towerWork() {
    // 直接遍历房间列表，检测每个房间内是否有需要攻击/维护的目标，避免使用每个 Tower 反复在同一房间内搜索以提升效率
    for (let room of Database.getRoomArray()) {
        if (Game.rooms[room].controller.level < 3) {
            logger.debug(`房间[${room}] Controller 等级未达3级，无法建造 Tower`);
            continue;
        }
        if (!Game.rooms[room].getTowerList() || Game.rooms[room].getTowerList().length === 0) {
            logger.info(`房间[${room}] Controller 等级已达3级，请及时建造 Tower!`);
            continue;
        }
        // 检测是否有敌人
        const enemas = Game.rooms[room].find(FIND_HOSTILE_CREEPS);
        if (enemas.length) {
            towerAttack(room, enemas);
        } else {
            // 检测是否有建筑需要维护
            const repairTargets = Game.rooms[room].find(FIND_STRUCTURES, {
                filter: (structure) => (structure.hits < structure.hitsMax - 200 && structure.structureType !== STRUCTURE_RAMPART && structure.structureType !== STRUCTURE_WALL)
            });
            if (repairTargets.length) {
                towerRepair(room, repairTargets);
            } else {
                // 检测是否有受伤 Creep
                const injuredCreeps = Game.rooms[room].find(FIND_MY_CREEPS, {
                    filter: (creep) => creep.hits < creep.hitsMax
                });
                if (injuredCreeps.length) {
                    towerHeal(room, injuredCreeps);
                }
            }
        }
    }
}

//检测到进入范围的敌人自动攻击
function towerAttack(room, targets) {
    for (let towerId of Game.rooms[room].getTowerList()) {
        const tower = Game.getObjectById(towerId);
        if (tower.store[RESOURCE_ENERGY] > 0) {
            // for(let target of targets){
            //     for(let bodyPart of target.body){
            //         if(bodyPart === HEAL){
            //             break;
            //         }
            //     }
            // }
            tower.attack(targets[0]);
        } else {
            logger.info(`房间[${room}]中的Tower[${towerId}]能量储量为空，无法工作！`)
        }
    }
}

//检测到范围内需要维修、保养的劳工自动进行维护
function towerRepair(room, targets) {
    for (let towerId of Game.rooms[room].getTowerList()) {
        const tower = Game.getObjectById(towerId);
        if (tower.store.getUsedCapacity(RESOURCE_ENERGY) / TOWER_CAPACITY <= 0.2) {
            continue;
        }
        if (tower.store[RESOURCE_ENERGY] > 0) {
            tower.repair(targets[0])
        } else {
            logger.info(`房间[${room}]中的Tower[${towerId}]能量储量为空，无法工作！`)
        }
    }
}

function towerHeal(room, targets) {
    for (let towerId of Game.rooms[room].getTowerList()) {
        const tower = Game.getObjectById(towerId);
        if (tower.store[RESOURCE_ENERGY] > 0) {
            tower.heal(targets[0])
        } else {
            logger.info(`房间[${room}]中的Tower[${towerId}]能量储量为空，无法工作！`)
        }
    }
}

module.exports = {
    towerWork: towerWork
};
// 引入 creep 配置项
const logger = require('Log').getLogger("creep");
// 引入 creep 角色模板
const roleConfig = require('creepRole')
const Database = require('Database');

// 自定义的 Creep 的拓展
const creepExtension = {
    work() {
        if (this.spawning) {
            logger.debug(`${this.name}正在孵化,无法工作`);
            return;
        }
        // TODO 检查 creep 是否还在数据库中
        // 获取对应配置项
        const creepConfig = roleConfig[this.getCreepData().role];
        // 获取是否工作
        const working = creepConfig.switch ? creepConfig.switch(this) : true;
        // 执行对应操作
        if (working) {
            if (creepConfig.target) creepConfig.target(this);
        } else {
            if (creepConfig.source) creepConfig.source(this);
        }
    },
    updateState() {
        // creep 身上没有能量 && creep 之前的状态为“工作”
        if (this.store[RESOURCE_ENERGY] === 0 && this.memory.working) {
            this.memory.working = false;
        }
        // creep 身上能量满了 && creep 之前的状态为“不工作”
        if (this.store[RESOURCE_ENERGY] === this.store.getCapacity() && !this.memory.working) {
            this.memory.working = true;
        }
        return this.memory.working;
    },
    // Creep 续命
    selfFix() {
        // if (this.ticksToLive < 1400) {
        //     const reNewRoom = Game.rooms[this.getTemplateConfig("roomName")];
        //     if (reNewRoom.energyAvailable / reNewRoom.energyCapacityAvailable < 0.1) {
        //         logger.warn(`房间[${reNewRoom.name}]能量不足，已停止Renew[${this.name}]`);
        //         return;
        //     }
        //     if (reNewRoom) {
        //         this.say("🐸");
        //         const reNewSpawn = reNewRoom.find(FIND_MY_SPAWNS, {
        //             filter: function (object) {
        //                 return object.spawning === null && object.store[RESOURCE_ENERGY] > 0;
        //             }
        //         });
        //         if (reNewSpawn.length) {
        //             const result = reNewSpawn[0].renewCreep(this);
        //             if (result === ERR_NOT_IN_RANGE) {
        //                 logger.debug("[" + this.name + "]正在赶往续命地点...");
        //                 this.moveTo(reNewSpawn[0]);
        //
        //             } else if (result === OK) {
        //                 logger.debug("[" + this.name + "]正在续命...");
        //             } else {
        //                 logger.info("[" + this.name + "]续命失败，错误代码：" + result);
        //             }
        //         } else {
        //             logger.debug("[" + this.name + "]暂无可用Spawn以拱续命!");
        //         }
        //     }
        // } else {
        //     logger.debug("[" + this.name + "]寿命充足!");
        // }
    },
    // Creep 将自己回收
    selfRecycle() {
        // const creepTemplateConfig = creepTemplateConfigs[this.name];
        // if (!creepTemplateConfig) {
        //     this.suicide();
        //     return;
        // }
        // const target = Game.spawns[creepTemplateConfig.spawnName];
        // if (creepTemplateConfig && target && target.recycleCreep(this) === ERR_NOT_IN_RANGE) {
        //     this.say("🌍");
        //     logger.info(`${this.name}正在将自己回收再利用...`);
        //     this.moveTo(target);
        // } else {
        //     logger.info(`${this.name}无法回收自己,直接自杀！`);
        // }
    },
    //避免Creep在房间边界处进进出出
    avoidGoBackRoom() {
        let flag = false;
        if (this.pos.x === 0) {
            this.moveTo(this.pos.x + 1, this.pos.y)
            flag = true;
        } else if (this.pos.x === 49) {
            this.moveTo(this.pos.x - 1, this.pos.y)
            flag = true;
        }
        if (this.pos.y === 0) {
            this.moveTo(this.pos.x, this.pos.y + 1)
            flag = true;
        } else if (this.pos.y === 49) {
            this.moveTo(this.pos.x, this.pos.y - 1)
            flag = true;
        }
        return flag;
    },
    // 在房间内尽可能获取资源，获取到返回 true,否则返回 false
    pickEnergy() {
        //首先检查有没有丢弃在地上的资源
        let source = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        if (source && source.resourceType === RESOURCE_ENERGY) {
            if (this.pickup(source) === ERR_NOT_IN_RANGE) {
                this.say("🚮");
                this.moveTo(source);
            }
            return true;
        } else {
            //如果没有则检查有没有建筑废墟
            source = this.pos.findClosestByRange(FIND_RUINS, {
                filter: (structure) => {
                    return structure.store[RESOURCE_ENERGY] > 0;
                }
            });
        }
        //再没有则检查建筑
        if (!source) {
            source = this.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_TOWER || structure.structureType === STRUCTURE_STORAGE || structure.structureType === STRUCTURE_TERMINAL) &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            });
        }
        if (source) {
            if (this.withdraw(source, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                this.say("🔽");
                this.moveTo(source);
            }
            return true;
        } else {
            //都没有，则就地采矿
            const target = this.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
            if (target) {
                logger.debug(this.name + "尝试就地取材");
                if (this.harvest(target) === ERR_NOT_IN_RANGE) {
                    this.moveTo(target);
                }
                return true;
            } else {
                logger.warn(this.name + "在本房间内没有获取能量的方法！");
                return false;
            }
        }
    },
    //转移至其他房间,支持中转房间以防止路过被占领房间挨打，抵达目标返回 true,否则返回 false
    moveToOtherRoom(transferRoom, targetRoomName) {
        if (this.avoidGoBackRoom()) {
            return false;
        }
        // 存在中转房间且未抵达过
        if (transferRoom && !this.memory.transferFlag) {
            // 前往中转房间
            if (this.room.name !== transferRoom) {
                this.say("🏴");
                this.moveTo(new RoomPosition(25, 25, transferRoom))
                return false;
                // 抵达中转房间并记录在内存中
            } else if (this.room.name === transferRoom) {
                this.memory.transferFlag = true;
            }
            // 没有中转房间或已抵达
        } else if (this.memory.transferFlag || !transferRoom) {
            // 前往目标房间
            if (this.room.name !== targetRoomName) {
                this.say("🚩");
                this.moveTo(new RoomPosition(25, 25, targetRoomName));
                return false;
            } else {
                //抵达目标房间
                return true;
            }
        }
    },
    //清理掉 Creep 身上除 retainReSourceType 之外的所有资源,默认会放在本房间内的 Storage ,如没有则直接丢弃
    cleanBag(retainReSourceType) {
        let flag = true;
        for (let resourceType in this.carry) {
            if (resourceType !== retainReSourceType) {
                flag = false;
                logger.debug(this.name + "正在清理背包");
                this.say("🧺");
                let target = this.room.storage;
                if (target) {
                    if (this.transfer(target, resourceType) === ERR_NOT_IN_RANGE) {
                        this.moveTo(target);
                    }
                } else {
                    this.drop(resourceType);
                }
            }
        }
        if (flag && this.memory.NeedCleanBag) {
            this.memory.NeedCleanBag = false;
        }
        return flag;
    },
    //Creep死前1 tick 检查当前房间能量是否足够复活，如不够则返回 true
    canNotReborn() {
        // if (this.ticksToLive > 1) {
        //     return false;
        // }
        // const creepTemplate = require('Creep_TemplateGenerate').genTemplate(creepTemplateConfig.roomName);
        // const creepTemplateConfig = creepTemplateConfigs[this.name];
        // const template = creepTemplate.getTemplateByConfig(creepTemplateConfig);
        // let result = Game.spawns[creepTemplateConfig.spawnName].spawnCreep(template, name, {dryRun: true});
        // if (result === ERR_NOT_ENOUGH_ENERGY) {
        //     return true;
        // }
    },
    getCreepData() {
        return Database.getCreepData(this.name);
    }
}

// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Creep.prototype, creepExtension)
}
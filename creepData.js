/**
 * Creep数据
 * ------------------------------------
 *           |  1-3  |  4-5  |  6-8  |    --> Controller 等级
 * ------------------------------------
 * Harvester |   6   |   4   |   2   |
 * ------------------------------------
 * Upgrader  |   3   |   2   |   1   |   TODO 6-8级 Upgrader 数量还需测试验证
 * ------------------------------------
 * Mover     |   0   |   0   |   1   |
 * -------------------------------------
 */
const logger = require('Log').getLogger("creepData");

class CreepData {
    constructor(name) {
        //Creep名称
        this.name = name;
        //生成方式
        this.generateMode = "";
        //部件配置
        this.partsSet = new Array();
        //出生点
        this.spawnName = "";
        //出生房间
        this.roomName = "";
        //Creep工种
        this.role = "";
    }

    initData(creepName, creepRole, generateMode, roomName) {
        this.name = creepName;
        this.role = creepRole;
        this.generateMode = generateMode;
        this.roomName = roomName;
        if (generateMode === "config") {
            // TODO 从 config.creep.template中获取预设的部件配置
        }
        return this;
    }

}

module.exports = CreepData;
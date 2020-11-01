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
const logger = require('utils.log').getLogger("creepData");

class CreepData {
    constructor() {
        //生成方式，默认"Auto"自适应生成
        this.generateMode = "";
        //部件配置
        this.partsSet = new Array();
        //出生点
        this.spawnName = "";
        //出生房间
        this.roomName = "";
    }

    initData(creepName, room) {

        return this;
    }

}

module.exports = CreepData;
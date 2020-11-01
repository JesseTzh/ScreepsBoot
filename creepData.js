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

class RoomData {
    constructor() {
        //房间名称
        this.name = "";
        //Harvester名称列表
        this.harvesterList = new Array();
        //Upgrader列表
        this.upgraderList = new Array();
        //Mover列表
        this.MoverList = new Array();
        //房间内所有creep列表
        this.allCreepList = new Array();
    }

    initData(roomName) {
        this.name = roomName;
        const claimRoom = Game.rooms[this.name];
        if (!claimRoom) {
            logger.error("丢失房间[" + roomName + "]视野!");
            // TODO 考量数据库刷新逻辑以确定是否要在此处改变刷新标识
            //global.database.creepDataFlag = false;
        }
        this.sourceList = this._getSourceList(claimRoom);

        //合并所有list方便统一遍历
        this.allCreepList = this.allCreepList.concat(this.harvesterList).concat(this.upgraderList).concat(this.MoverList)
        return this;
    }

}

module.exports = RoomData;
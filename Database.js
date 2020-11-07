/**
 * 数据库类
 *
 * 设计思路：
 * 本类意在将所有存储在 global 中的数据全部封装为类以提高维护性,并尽量通过本类中提供的接口方法而非直接操作 global 数据库
 * 其中包含：
 *      RoomData：以每个房间为单位存储了所有房间的建筑数据
 *      CreepData：以每个 Creep 为单位存储了所有 Creep 的相关数据
 */
const logger = require('Log').getLogger("Database");
const RoomData = require('roomData');
const CreepData = require('creepData');

class Database {
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

    static checkDatabaseFlag(creepName, room) {
        if (!global.database) {
            global.database = new Map();
        }
        if (!global.database.roomDataFlag) {
            new Database().initRoomData();
        }
        if (!global.database.creepDataFlag) {
            new Database().initCreepData();
        }
    }


    initCreepData() {
        logger.info("正在初始化Creep库...");

        for (let roomName of Database.getRoomArray()) {
            let room = Game.rooms[roomName];
            if (!room) {
                logger.warn(`房间${roomName}丢失视野，请及时检查！`)
                // TODO 邮件提醒以及考量是否需要重置数据库
            }
            this._getHarvesterList(room);
        }
        Database.setCreepDataFlag(true);
    }

    initRoomData() {
        logger.info("正在初始化Room数据库...");
        //获取房间列表
        let roomArray = new Array();
        for (let roomName in Game.rooms) {
            if (Game.rooms[roomName].controller.my) {
                roomArray.push(roomName)
            }
        }
        global.database.roomArray = roomArray;
        //获取各房间数据
        let roomDataMap = new Map();
        for (let claimRoomName of global.database.roomArray) {
            let roomData = new RoomData().initData(claimRoomName);
            if (roomData) {
                roomDataMap.set(claimRoomName, roomData);
            } else {
                logger.error("房间[" + claimRoomName + "]数据初始化失败!");
            }
        }
        global.database.roomData = roomDataMap;
        Database.setRoomDataFlag(true);
    }

    _getHarvesterList(room) {
        let creepDataMap = new Map();
        const roomLevel = room.controller.level;
        //根据房间等级生成的 Harvester 数量
        let harvesterNum;
        //Harvester 生成方式
        var harvesterGenerateMode;
        switch (true) {
            case roomLevel <= 3:
                harvesterNum = 6;
                harvesterGenerateMode = "Auto";
                break;
            case roomLevel <= 5:
                harvesterNum = 4;
                harvesterGenerateMode = "Auto";
                break;
            case roomLevel <= 8:
                harvesterNum = 2;
                harvesterGenerateMode = "Config";
                break;
        }
        while (harvesterNum > 0) {
            let harvesterName = `Harvester-${room.name}-${harvesterNum}`;
            let harvestData = new CreepData().initData(harvesterName,"Harvester", harvesterGenerateMode, room.name);
            creepDataMap.set(harvesterName, harvestData);
            harvesterNum--;
        }
        global.database.creepData = creepDataMap;
    }

    static getRoomArray() {
        return global.database.roomArray;
    }

    static setCreepDataFlag(flag) {
        global.database.creepDataFlag = flag;
    }

    static setRoomDataFlag(flag) {
        global.database.roomDataFlag = flag;
    }

    static getCreepData(name){
        return global.database.creepData.get(name);
    }

}



module.exports = Database;
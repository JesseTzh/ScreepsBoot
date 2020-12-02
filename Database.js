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
const creepDataGenerator = require('creepDataGenerator');

class Database {

    //检测数据库是否需要刷新
    static checkDatabaseFlag(creepName, room) {
        if (!Database.checkDatabaseStatus()) {
            global.database = new Map();
        }
        if (!global.database.roomDataFlag) {
            new Database().initRoomData();
        }
        if (!global.database.creepDataFlag) {
            new Database().initCreepData();
        }
    }

    //初始化 Creep 数据库
    initCreepData() {
        logger.info("正在初始化Creep库...");
        let creepDataList = new Map();
        for (let roomName of Database.getRoomArray()) {
            let room = Game.rooms[roomName];
            if (!room) {
                logger.warn(`房间${roomName}丢失视野，请及时检查！`)
                // TODO 邮件提醒以及考量是否需要重置数据库
            }
            creepDataList = creepDataGenerator.generate(room, creepDataList);
        }
        Database.setCreepData(creepDataList);
        Database.setCreepDataFlag(true);
    }

    //初始化 Room 数据库
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

    //检测数据库是否初始化过
    static checkDatabaseStatus() {
        if (!global.database) {
            return false;
        } else {
            return true
        }
    }

    //获取房间列表
    static getRoomArray() {
        if (!Database.checkDatabaseStatus()) {
            return null;
        }
        return global.database.roomArray;
    }

    //更改 Creep 数据库状态
    static setCreepDataFlag(flag) {
        global.database.creepDataFlag = flag;
    }

    //更改 Room 数据库状态
    static setRoomDataFlag(flag) {
        global.database.roomDataFlag = flag;
    }

    static setCreepData(dataMap) {
        global.database.creepData = dataMap;
    }

    static getLastLog() {
        return global.database.lastLog;
    }

    static setNewestLog(log){
        global.database.lastLog = log;
    }

    //获取指定 Creep 的数据
    static getCreepData(name) {
        if (!Database.checkDatabaseStatus()) {
            return null;
        }
        if (!name) {
            return global.database.creepData;
        }
        return global.database.creepData.get(name);
    }

    //获取指定 Room 的数据
    static getRoomData(name) {
        if (!Database.checkDatabaseStatus()) {
            return null;
        }
        return global.database.roomData.get(name);
    }

}


module.exports = Database;

const logger = require('utils.log').getLogger("Database");
const RoomData = require('roomData');

function checkDatabaseFlag(){
    if(!global.database){
        global.database = new Map();
    }
    if(!global.database.creepDataFlag){
        initCreepData();
    }
    if(!global.database.roomDataFlag){
        initRoomData();
    }
}

function initCreepData() {
    logger.info("正在初始化Creep库...")
    let creepDataMap = new Map();

    global.database.creepData = creepDataMap;
    global.database.creepDataFlag = true;
}

function initRoomData() {
    logger.info("正在初始化Room数据库...")
    //获取房间列表
    let roomArray = new Array();
    for(let roomName in Game.rooms){
        if(Game.rooms[roomName].controller.my){
            roomArray.push(roomName)
        }
    }
    global.database.roomArray = roomArray
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
    global.database.roomDataFlag = true;
}

module.exports = {
    checkDatabaseFlag: checkDatabaseFlag,
    initRoomData: initRoomData,
    initCreepData: initCreepData
}
const logger = require('Log').getLogger("util.tools");
const SYS_CONFIG = require('config.system.setting');
const Database = require('Database');

//监测房间可用能量是否短缺，并在长时间处于短缺状态时报警
function roomEnergAlertyMonitor() {
    if (SYS_CONFIG.ENERGY_SHORTAGE.SWITCH) {
        for (let roomName of global.database.roomArray) {
            //房间能量比例
            let energyStatus = Game.rooms[roomName.getRatioOfEnergy()];
            //房间能量短缺计数器
            let roomCountNum = Game.rooms[roomName].memory.EnergyShortageCount;
            //如果尚未检测过
            if (!roomCountNum) {
                //则初始化计数器
                roomCountNum = 0;
            }
            if (energyStatus >= SYS_CONFIG.ENERGY_SHORTAGE.RATIO) {
                roomCountNum = 0;
            } else {
                roomCountNum++;
            }
            if (roomCountNum >= SYS_CONFIG.ENERGY_SHORTAGE.COUNTNUM) {
                let message = `房间[${roomName}]超过${SYS_CONFIG.ENERGY_SHORTAGE.COUNTNUM}tick能量比例低于${SYS_CONFIG.ENERGY_SHORTAGE.RATIO},请及时检查！`;
                Game.notify(message);
                logger.info(message);
            }
            //储存计数器
            Game.rooms[roomName].memory.EnergyShortageCount = roomCountNum;
        }
    }

}

// 此函数可监测房间能量矿每轮刷新时是否未挖完
function energySourceMonitor() {
    for (let i = 0; i < CONFIG.ENERGY_SOURCE.length; i++) {
        let source = Game.getObjectById(CONFIG.ENERGY_SOURCE[i]);
        if (source.ticksToRegeneration === 1) {
            source.room.memory.EnergyRemain == null ? source.room.memory.EnergyRemain = source.energy : source.room.memory.EnergyRemain += source.energy;
        } else {
            logger.debug(source.id + "被成功挖光")
        }
    }
}

// 此函数可返回传入对象的具体类型
function getType(obj) {
    var type = Object.prototype.toString.call(obj).match(/^\[object (.*)\]$/)[1].toLowerCase();
    if (type === 'string' && typeof obj === 'object') return 'object'; // Let "new String('')" return 'object'
    if (obj === null) return 'null'; // PhantomJS has type "DOMWindow" for null
    if (obj === undefined) return 'undefined'; // PhantomJS has type "DOMWindow" for undefined
    return type;
}

function sendEmail() {
    if (global.email) {
        logger.info("正在发送邮件...")
        Game.notify(global.email);
    }
}

function test() {
    let newMap = new Map();
    // for (let [name, creepTemplateConfig] of Database.getCreepData()) {
    //     logger.info(name)
    //     newMap.set(name, creepTemplateConfig);
    // }
    // logger.info("------")
    // for (let [name, creepTemplateConfig] of newMap) {
    //     logger.info(name)
    // }

}

module.exports = {
    roomEnergAlertyMonitor: roomEnergAlertyMonitor,
    energySourceMonitor: energySourceMonitor,
    getType: getType,
    sendEmail: sendEmail,
    test: test
};
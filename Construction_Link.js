/*  
    Link的建筑模块
    主要工作：远程传送能量，尽量保证矿工走最少的路
    函数：
        1. linkTransfer()：检查config文件中配置的Link能量容量是否冗余，是则发送至target
    参数：
        
    使用：
        1. 引入 var link = require('construction.link');
        2. 调用 link.linkTransfer();
*/
const logger = require('Log').getLogger("Link");
const SYS_CONFIG = require('config.system.setting');
const Database = require('Database');

function linkTransfer() {
    for (let roomName of Database.getRoomArray()) {
        let room = Game.rooms[roomName];
        if (room.controller.level < 5) {
            logger.debug(`房间[${roomName}]控制等级尚未达到5级,跳过 Link 工作`);
            continue;
        }
        if (!room.getSourceLinkList() || !room.getControllerLink()) {
            logger.debug(`房间[${roomName}] Link 数据库尚未完全`);
            continue;
        }
        //房间可用能量大于 ALLOW_UPGRADER_USE_ENERGY 参数值
        if (room.getRatioOfEnergy() <= SYS_CONFIG.ALLOW_UPGRADER_USE_ENERGY) {
            logger.info(`房间[${roomName}]能量余量过低,暂停 Link 传输工作.`);
            continue;
        }
        let sourceLinkList = room.getSourceLinkList();
        let receiveLink = Game.getObjectById(room.getControllerLink());
        for (let i = 0; i < sourceLinkList.length; i++) {
            let sendLink = Game.getObjectById(sourceLinkList[i]);
            if (checkEnergyStatus(sendLink)) {
                //发送端能量储量大于50%，或接收端能量为0,则传输
                if ((sendLink.store.getUsedCapacity(RESOURCE_ENERGY) / LINK_CAPACITY >= 0.5) || (receiveLink.store.getUsedCapacity(RESOURCE_ENERGY) === 0)) {
                    sendLink.transferEnergy(receiveLink);
                }
            }
        }
    }
}

function checkEnergyStatus(sendLink) {
    //发送端不在冷却中
    if (sendLink.cooldown === 0) {
        //发送端能量大于1
        if (sendLink.store.getUsedCapacity(RESOURCE_ENERGY) > 1) {
            return true;
        }
    }
    return false;
}

module.exports = {
    linkTransfer: linkTransfer
};
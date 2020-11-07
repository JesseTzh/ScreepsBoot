const logger = require('Log').getLogger("Room_Extension");

//自定义的 Room 的拓展
const roomExtension = {
    getSourceList() {
        return global.database.roomData.get(this.name).sourceList;
    },
    getSourceLinkList() {
        return global.database.roomData.get(this.name).sourceLinkList;
    },
    getTowerList() {
        return global.database.roomData.get(this.name).towerList;
    },
    getControllerLink() {
        return global.database.roomData.get(this.name).controllerLink;
    },
    getSpawnList() {
        return global.database.roomData.get(this.name).spawnList;
    },
    getFreeSpawn() {
        for (let spawnId of global.database.roomData.get(this.name).spawnList){
            let freeSpawn = Game.getObjectById(spawnId);
            if(!freeSpawn.spawning){
                return freeSpawn;
            }
        }
    },
    getExtensionList() {
        return global.database.roomData.get(this.name).extensionList;
    },
    getFactory() {
        return global.database.roomData.get(this.name).factory;
    },
    getMineral() {
        return global.database.roomData.get(this.name).mineral;
    },
    getRatioOfEnergy() {
        return this.energyAvailable / this.energyCapacityAvailable;
    },
    factory: function (){
        return global.database.roomData.get(this.name).factory;
    }
}

// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Room.prototype, roomExtension)
}
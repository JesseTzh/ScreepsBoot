const logger = require('Log').getLogger("Room_Extension");
const Database = require('Database');

//自定义的 Room 的拓展
const roomExtension = {
    getSourceList() {
        return Database.getRoomData(this.name).sourceList;
    },
    getSourceLinkList() {
        return Database.getRoomData(this.name).sourceLinkList;
    },
    getTowerList() {
        return Database.getRoomData(this.name).towerList;
    },
    getControllerLink() {
        return Database.getRoomData(this.name).controllerLink;
    },
    getSpawnList() {
        return Database.getRoomData(this.name).spawnList;
    },
    getFreeSpawn() {
        for (let spawnId of Database.getRoomData(this.name).spawnList) {
            let freeSpawn = Game.getObjectById(spawnId);
            if (!freeSpawn.spawning) {
                return freeSpawn;
            }
        }
    },
    getExtensionList() {
        return Database.getRoomData(this.name).extensionList;
    },
    getFactory() {
        return Database.getRoomData(this.name).factory;
    },
    getMineral() {
        return Database.getRoomData(this.name).mineral;
    },
    getRatioOfEnergy() {
        return this.energyAvailable / this.energyCapacityAvailable;
    },
    factory: function () {
        return Database.getRoomData(this.name).factory;
    }
}

// 将拓展签入 Creep 原型
module.exports = function () {
    _.assign(Room.prototype, roomExtension)
}
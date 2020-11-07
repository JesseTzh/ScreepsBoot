const loadCreepExtension = require('creepExtension');
const loadRoomExtension  = require('roomExtension');
const logger = require('Log').getLogger("ExtensionLoader");

function load() {
    logger.info("正在挂载原型扩展...");
    global.loadedExtension = true
    //挂载Creep原型扩展
    loadCreepExtension();
    //挂载Room原型扩展
    loadRoomExtension();
}

module.exports = function () {
    if (!global.loadedExtension) {
        load();
    }
}
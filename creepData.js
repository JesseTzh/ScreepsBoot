const logger = require('Log').getLogger("creepData");
const CONFIG_CREEP_DATA = require('config.creep.data');

class CreepData {
    constructor(name) {
        //Creep名称
        this.name = name;
        //生成方式
        this.generateMode = "";
        //部件配置
        this.partsSet = new Array();
        //出生点
        this.spawnName = "";
        //出生房间
        this.roomName = "";
        //Creep工种
        this.role = "";
        //Creep在本房间的编号，便于指派任务
        this.num = "";
    }

    initData(creepName, creepRole, generateMode, roomName) {
        this.name = creepName;
        this.role = creepRole;
        this.generateMode = generateMode;
        this.roomName = roomName;
        if (generateMode === "Config") {
            this.partsSet = CONFIG_CREEP_DATA[this.role].partsSet;
        }
        this.num = creepName.substr(creepName.length-1,1);
        return this;
    }

}

module.exports = CreepData;
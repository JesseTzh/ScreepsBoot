/**
 * Creep部件配置
 *      本文件将包含各种 Creep 预设的部件配置
 *
 */

module.exports = {

    /**
     *   Harvester配置文件
     */
    Harvester: {
        partsSet: [[WORK, 10], [MOVE, 6], [CARRY, 2]],
        amount: [[6,"Auto"], [6,"Auto"], [6,"Auto"], [4,"Auto"], [4,"Auto"], [2,"Config"], [2,"Config"], [2,"Config"], [2,"Config"]],
    },

    /**
     *   Upgrader 配置文件
     */
    Upgrader: {
        partsSet: [[WORK, 10], [MOVE, 6], [CARRY, 2]],
        amount: [[5,"Auto"], [5,"Auto"], [5,"Auto"], [3,"Auto"], [3,"Auto"], [3,"Config"], [2,"Config"], [2,"Config"]],
    },

    /**
     *   Builder 配置文件
     */
    Builder: {
        partsSet: [[WORK, 5], [MOVE, 5], [CARRY, 5]],
        amount: [[0,"Auto"], [1,"Auto"], [1,"Auto"], [31,"Auto"], [1,"Auto"], [1,"Auto"], [1,"Config"], [1,"Config"]],
    },

    /**
     *   Mover 配置文件
     */
    Mover: {
        partsSet: [[WORK, 0], [MOVE, 15], [CARRY, 30]],
        amount: [[0,"Auto"], [0,"Auto"], [10,"Auto"], [0,"Auto"], [0,"Auto"], [1,"Auto"], [1,"Auto"], [1,"Config"]],
    },
}
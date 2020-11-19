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
        partsSet: [[[WORK, 10], [MOVE, 6], [CARRY, 2]],[]],
        amount: [[6, "Auto"], [6, "Auto"], [6, "Auto"], [4, "Auto"], [4, "Auto"], [2, 0], [2, 0], [2, 0], [2, 0]],
    },

    /**
     *   Upgrader 配置文件
     */
    Upgrader: {
        partsSet: [[[WORK, 10], [MOVE, 6], [CARRY, 2]]],
        amount: [[5, "Auto"], [5, "Auto"], [5, "Auto"], [3, "Auto"], [3, "Auto"], [3, 0], [2, 0], [2, 0]],
    },

    /**
     *   Builder 配置文件
     */
    Builder: {
        partsSet: [[[WORK, 5], [MOVE, 5], [CARRY, 5]]],
        amount: [[0, "Auto"], [1, "Auto"], [1, "Auto"], [31, "Auto"], [1, "Auto"], [1, "Auto"], [1, 0], [1, 0]],
    },

    /**
     *   Mover 配置文件
     */
    Mover: {
        partsSet: [[[WORK, 0], [MOVE, 15], [CARRY, 30]]],
        amount: [[0, "Auto"], [0, "Auto"], [10, "Auto"], [0, "Auto"], [0, "Auto"], [1, "Auto"], [1, "Auto"], [1, 0]],
    },
}
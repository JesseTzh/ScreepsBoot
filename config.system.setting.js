module.exports = {

    //日志输出等级
    LOGGER_LEVEL: "INFO",

    //是否输出回合结束标识日志。有可能导致控制台不断滚动难以及时发现报错
    END_LOG: false,

    ENERGY_SHORTAGE: ({
        //房间能量比例过低警报开关
        SWITCH: true,
        //房间能量比例低于多少时开始积累计数
        RATIO: 0.5,
        //房间能量比例过低计数超过多少时开始发送邮件警报并输出日志
        COUNTNUM: 300,
    }),
    
    //允许制造 Creep 的最大能量消耗值
    MAX_CREEP_ENERGY_CONSUM: 1500,

    // Tower 剩余多少能量时允许 Mover 加进来
    TOWER_ENERGY_NEED: 0.9,

    //房间可用能量达到多少时才会允许传输给 Upgrader 使用
    ALLOW_UPGRADER_USE_ENERGY: 0.5,

    // Tower 修理 Wall/Rampart 上限
    DEFENSE_CONSTRUCTION_HITS_LIMITS: 0.011,

    // 不能使用自适应模板生成的Creep
    CAN_NOT_USE_SELF_ADAPTION_TEMPLATE: ["Claimer", "Defender", "Guard"]
}
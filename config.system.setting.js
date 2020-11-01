module.exports = {

    //日志输出等级
    LOGGER_LEVEL: "INFO",

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

    //房间可用能量低于多少时会被监测函数记录
    ENERGY_ALERT_RATIO: 0.5,

    // Tower 剩余多少能量时允许 Mover 加进来
    TOWER_ENERGY_NEED: 0.9,

    // Tower 修理 Wall/Rampart 上限
    DEFENSE_CONSTRUCTION_HITS_LIMITS: 0.011,

    // 不能使用自适应模板生成的Creep
    CAN_NOT_USE_SELF_ADAPTION_TEMPLATE: ["Claimer", "Defender", "Guard"]
}
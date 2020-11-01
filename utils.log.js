/**
 * 日志工具类
 * 用法：
 *     引入
 *        const logger = require('util.log').getLogger(name);
 *        强制关闭（无视config里的日志等级）：logger.off();
 *        强制打开（无视config里的日志等级）：logger.on();
 *        取消强制设定：logger.reset();
 *     使用
 *        logger.info("a");
 *        logger.warn("a","b");
 */
const SYS_CONFIG = require('config.system.setting')

class Logger {
    constructor() {
        this.LEVEL = new Map([["DEBUG", 1], ["INFO", 2], ["WARN", 3], ["ERROR", 4], ["OFF", 5]])
        this.logSettingNum = 5;
        this.forceControl = null;
        this.name = "";
    }

    static getLogger(name) {
        let logger = new Logger();
        logger.name = name;
        let num = logger.LEVEL.get(SYS_CONFIG.LOGGER_LEVEL);
        num ? logger.logSettingNum = num : logger.logSettingNum = 5;
        return logger;
    }

    _canLog(levelNum) {
        if (levelNum == null) return false;
        return this.forceControl === true || levelNum >= this.logSettingNum && this.forceControl == null;
    }

    _log(level, messages) {
        if (this._canLog(this.LEVEL.get(level.trim()))) {
            console.log("[" + level + "][" + this.name + "]", messages.join(" "));
        }
    }

    off() {
        this.forceControl = false;
        return this;
    }

    on() {
        this.forceControl = true;
        return this;
    }

    reset() {
        this.forceControl = null;
        return this;
    }

    debug(...message) {
        this._log("DEBUG", message);
    }

    info(...message) {
        this._log("INFO ", message);
    }

    warn(...message) {
        this._log("WARN ", message);
    }

    error(...message) {
        this._log("ERROR", message);
    }

    creepLog(creep, action, code) {
        const message = `${creep}在${creep.room}执行任务[${action}]时出错,错误代码:[${code}]`;
        this._log("INFO ", message);
    }
}

module.exports = Logger;
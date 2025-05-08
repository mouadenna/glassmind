const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Logging utility for application-wide logging
 */
class Logger {
    /**
     * Creates a new Logger instance
     */
    constructor() {
        this.logDir = path.join(app.getPath('userData'), 'logs');
        this.logFile = path.join(this.logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    /**
     * Internal method to write a log entry
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     * @private
     */
    _writeLog(level, message, data = null) {
        const timestamp = new Date().toISOString();
        let logMessage = `[${timestamp}] ${level}: ${message}`;
        
        if (data) {
            logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
        }
        
        logMessage += '\n';

        // Write to file
        fs.appendFileSync(this.logFile, logMessage);
        
        // Also log to console
        console.log(logMessage);
    }

    /**
     * Log an informational message
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    info(message, data = null) {
        this._writeLog('INFO', message, data);
    }

    /**
     * Log an error message
     * @param {string} message - Log message
     * @param {Error} error - Error object
     */
    error(message, error = null) {
        let errorData = null;
        if (error) {
            errorData = {
                message: error.message,
                stack: error.stack,
                ...error
            };
        }
        this._writeLog('ERROR', message, errorData);
    }

    /**
     * Log a debug message
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    debug(message, data = null) {
        this._writeLog('DEBUG', message, data);
    }

    /**
     * Log a warning message
     * @param {string} message - Log message
     * @param {Object} data - Additional data to log
     */
    warn(message, data = null) {
        this._writeLog('WARN', message, data);
    }
}

module.exports = new Logger(); 
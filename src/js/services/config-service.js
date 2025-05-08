const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Service for managing application configuration
 */
class ConfigService {
  /**
   * Creates an instance of ConfigService
   * @param {string} configPath - Path to the configuration file
   */
  constructor(configPath) {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }

  /**
   * Loads configuration from file
   * @returns {Object} - Configuration object
   * @throws {Error} - If configuration is invalid or missing API key
   */
  loadConfig() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      if (!config.apiKey) {
        throw new Error("API key is missing in config.json");
      }
      
      // Set default model if not specified
      if (!config.model) {
        config.model = "gpt-4o-mini";
        logger.info("Model not specified in config, using default:", { model: config.model });
      }

      return config;
    } catch (err) {
      logger.error("Error reading config:", err);
      throw err;
    }
  }

  /**
   * Gets the configuration
   * @returns {Object} - Configuration object
   */
  getConfig() {
    return this.config;
  }

  /**
   * Updates configuration and writes to file
   * @param {Object} newConfig - New configuration object
   * @returns {boolean} - Success status
   */
  updateConfig(newConfig) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(newConfig, null, 2), 'utf8');
      this.config = newConfig;
      return true;
    } catch (err) {
      logger.error("Error updating config:", err);
      return false;
    }
  }
}

module.exports = ConfigService; 
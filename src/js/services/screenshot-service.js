const { app } = require('electron');
const screenshot = require('screenshot-desktop');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Service for handling screenshot operations
 */
class ScreenshotService {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.screenshots = [];
  }

  /**
   * Captures a screenshot and returns it as a base64 string
   * @returns {Promise<string>} - Base64 encoded screenshot
   */
  async captureScreenshot() {
    try {
      logger.debug("Starting screenshot capture");
      
      // Show waiting animation before hiding window
      this.mainWindow.webContents.send('request-started');
      
      this.mainWindow.webContents.send('hide-instruction');
      this.mainWindow.hide();
      await new Promise(res => setTimeout(res, 200));

      const timestamp = Date.now();
      const imagePath = path.join(app.getPath('pictures'), `screenshot_${timestamp}.png`);
      await screenshot({ filename: imagePath });
      logger.info("Screenshot captured", { path: imagePath });

      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString('base64');

      this.mainWindow.show();
      
      // Stop waiting animation after screenshot is captured
      this.mainWindow.webContents.send('request-finished');
      
      return base64Image;
    } catch (err) {
      logger.error("Screenshot capture failed:", err);
      this.mainWindow.show();
      
      // Stop waiting animation on error
      this.mainWindow.webContents.send('request-finished');
      
      this.mainWindow.webContents.send('error', err.message);
      throw err;
    }
  }

  /**
   * Adds a screenshot to the collection
   * @param {string} base64Image - Base64 encoded screenshot
   */
  addScreenshot(base64Image) {
    this.screenshots.push(base64Image);
  }

  /**
   * Gets all captured screenshots
   * @returns {string[]} - Array of base64 encoded screenshots
   */
  getScreenshots() {
    return this.screenshots;
  }

  /**
   * Clears all screenshots
   */
  clearScreenshots() {
    this.screenshots = [];
  }
}

module.exports = ScreenshotService; 
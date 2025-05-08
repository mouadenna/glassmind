const { app, ipcMain } = require('electron');
const path = require('path');
const logger = require('./utils/logger');

// Import services
const ConfigService = require('./services/config-service');
const WindowService = require('./services/window-service');
const ShortcutService = require('./services/shortcut-service');
const ScreenshotService = require('./services/screenshot-service');
const OpenAIService = require('./services/openai-service');

/**
 * Main application controller that coordinates all services
 */
class AppController {
  /**
   * Creates an instance of AppController
   */
  constructor() {
    // Initialize state
    this.multiPageMode = false;
    this.userMessage = '';
    this.stage = 0; // 0 = boot up stage, 1 = multi capture, 2 = AI Answered
    
    // Setup config service
    const configPath = path.join(__dirname, '../../config.json');
    this.configService = new ConfigService(configPath);
    
    // Setup window service
    this.windowService = new WindowService();
    this.windowService.setStage(this.stage);
    
    // Setup shortcut service
    this.shortcutService = new ShortcutService(this);
    
    // Initialize IPC handlers
    this.initializeIpcHandlers();
  }

  /**
   * Initializes the application
   */
  initialize() {
    // Create main window
    const mainWindow = this.windowService.createMainWindow();
    
    // Setup screenshot service
    this.screenshotService = new ScreenshotService(mainWindow);
    
    // Setup OpenAI service
    const config = this.configService.getConfig();
    this.openaiService = new OpenAIService(config, mainWindow);
    
    // Register global shortcuts
    this.shortcutService.registerAllShortcuts();
  }

  /**
   * Initializes IPC event handlers
   */
  initializeIpcHandlers() {
    ipcMain.on('close-settings', () => {
      this.windowService.closeSettingsWindow();
    });
    
    ipcMain.on('text-input', (event, text) => {
      logger.info("Received text input");
      this.userMessage = text;
      this.windowService.updateInstruction("Multi-mode: Ctrl+Shift+A to add, Ctrl+Shift+I to add text, Ctrl+Shift+S to finalize");
    });
  }

  /**
   * Handles single screenshot capture
   */
  async takeSingleScreenshot() {
    try {
      const img = await this.screenshotService.captureScreenshot();
      this.screenshotService.addScreenshot(img);
      await this.processScreenshots();
    } catch (error) {
      logger.error("Single screenshot error:", error);
      throw error;
    }
  }

  /**
   * Handles multi-page mode
   */
  async handleMultiPageMode() {
    try {
      if (!this.multiPageMode) {
        // First press: enable multi-mode without taking a screenshot
        this.multiPageMode = true;
        this.windowService.updateInstruction("Multi-mode: Ctrl+Shift+A to add, Ctrl+Shift+I to add text, Ctrl+Shift+S to finalize");
      } else {
        // Subsequent presses in multi-mode capture a screenshot
        const img = await this.screenshotService.captureScreenshot();
        this.screenshotService.addScreenshot(img);
        this.windowService.updateInstruction("Multi-mode: Ctrl+Shift+A to add, Ctrl+I to add text, Ctrl+Shift+S to finalize");
        this.stage = 1;
        this.windowService.setStage(this.stage);
      }
    } catch (error) {
      logger.error("Multi-page mode error:", error);
      throw error;
    }
  }

  /**
   * Finalizes multi-page mode and processes screenshots
   */
  async finalizeMultiPageMode() {
    try {
      await this.processScreenshots();
    } catch (error) {
      logger.error("Finalize multi-page mode error:", error);
      throw error;
    }
  }

  /**
   * Processes screenshots with OpenAI
   */
  async processScreenshots() {
    try {
      const screenshots = this.screenshotService.getScreenshots();
      const result = await this.openaiService.processScreenshots(screenshots, this.userMessage);
      
      const mainWindow = this.windowService.getMainWindow();
      mainWindow.webContents.send('analysis-result', result);
      
      this.stage = 2;
      this.windowService.setStage(this.stage);
    } catch (error) {
      logger.error("Process screenshots error:", error);
      const mainWindow = this.windowService.getMainWindow();
      mainWindow.webContents.send('error', error.message);
      throw error;
    }
  }

  /**
   * Resets the application state
   */
  resetProcess() {
    this.screenshotService.clearScreenshots();
    this.multiPageMode = false;
    this.userMessage = '';
    this.stage = 0;
    this.windowService.setStage(this.stage);
    
    const mainWindow = this.windowService.getMainWindow();
    mainWindow.webContents.send('clear-result');
    this.windowService.updateInstruction("Ctrl+Shift+S: Screenshot | Ctrl+Shift+A: Multi-mode |  Ctrl+Shift+W: Hide Window | Ctrl+Shift+Q: Close");
  }

  /**
   * Shows the main window
   */
  showWindow() {
    this.windowService.showMainWindow();
    this.shortcutService.registerAllShortcuts();
  }

  /**
   * Hides the main window
   */
  hideWindow() {
    this.windowService.hideMainWindow();
    this.shortcutService.registerShowWindowShortcut();
  }

  /**
   * Opens the settings window
   */
  openSettings() {
    this.windowService.createSettingsWindow();
  }

  /**
   * Shows the text input overlay
   */
  showTextInput() {
    if (this.multiPageMode) {
      const mainWindow = this.windowService.getMainWindow();
      mainWindow.show();
      mainWindow.webContents.send('show-text-input');
    }
  }

  /**
   * Moves the window in the specified direction
   * @param {string} direction - Direction to move (left, right, up, down)
   */
  moveWindow(direction) {
    this.windowService.moveWindow(direction);
  }

  /**
   * Centers the window on the screen
   */
  centerWindow() {
    this.windowService.centerWindow();
  }

  /**
   * Scrolls the window content
   * @param {number} amount - Amount to scroll
   */
  scrollWindow(amount) {
    this.windowService.scrollWindow(amount);
  }

  /**
   * Quits the application
   */
  quitApplication() {
    logger.info("Quitting application");
    app.quit();
  }

  /**
   * Gets the window service
   * @returns {WindowService} The window service
   */
  getWindowService() {
    return this.windowService;
  }

  /**
   * Checks if multi-page mode is active
   * @returns {boolean} - Multi-page mode status
   */
  isMultiPageMode() {
    return this.multiPageMode;
  }
}

module.exports = AppController; 
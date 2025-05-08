const { globalShortcut } = require('electron');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Service for managing global keyboard shortcuts
 */
class ShortcutService {
  /**
   * Creates an instance of ShortcutService
   * @param {Object} appController - The main application controller
   */
  constructor(appController) {
    this.appController = appController;
    this.shortcuts = this.loadShortcuts();
  }

  /**
   * Loads shortcuts from settings.json
   * @returns {Object} - Shortcuts configuration
   */
  loadShortcuts() {
    try {
      const settingsPath = path.join(__dirname, '../../../settings.json');
      if (fs.existsSync(settingsPath)) {
        const settingsData = fs.readFileSync(settingsPath, 'utf8');
        const settings = JSON.parse(settingsData);
        return settings.shortcuts || this.getDefaultShortcuts();
      }
      return this.getDefaultShortcuts();
    } catch (err) {
      logger.error("Error loading shortcuts:", err);
      return this.getDefaultShortcuts();
    }
  }

  /**
   * Gets default shortcuts
   * @returns {Object} - Default shortcuts configuration
   */
  getDefaultShortcuts() {
    return {
      captureScreenshot: "Ctrl+Shift+S",
      multiPageCapture: "Ctrl+Shift+A",
      textInput: "Ctrl+Shift+I",
      openSettings: "Ctrl+P",
      toggleWindowVisibility: "Ctrl+Shift+W",
      resetSession: "Ctrl+Shift+R",
      quitApp: "Ctrl+Shift+Q",
      moveWindow: "Ctrl+ArrowKeys",
      centerWindow: "Ctrl+C",
      scrollResponse: "Ctrl+U/D"
    };
  }

  /**
   * Registers all application shortcuts
   */
  registerAllShortcuts() {
    // Unregister all first to avoid duplicates
    globalShortcut.unregisterAll();

    // Register all configured shortcuts
    this.registerShortcut(this.shortcuts.openSettings, () => {
      logger.info("Settings shortcut triggered");
      this.appController.openSettings();
    });

    this.registerShortcut(this.shortcuts.captureScreenshot, async () => {
      try {
        logger.info("Screenshot shortcut triggered");
        if (this.appController.isMultiPageMode()) {
          logger.info("Finalizing multi-page mode");
          await this.appController.finalizeMultiPageMode();
        } else {
          logger.info("Taking single screenshot");
          await this.appController.takeSingleScreenshot();
        }
      } catch (error) {
        logger.error("Screenshot error:", error);
      }
    });

    this.registerShortcut(this.shortcuts.multiPageCapture, async () => {
      try {
        logger.info("Multi-page mode shortcut triggered");
        await this.appController.handleMultiPageMode();
      } catch (error) {
        logger.error("Multi-page mode error:", error);
      }
    });

    this.registerShortcut(this.shortcuts.textInput, () => {
      logger.info("Text input shortcut triggered");
      this.appController.showTextInput();
    });

    this.registerShortcut(this.shortcuts.resetSession, () => {
      logger.info("Reset shortcut triggered");
      this.appController.resetProcess();
    });

    this.registerShortcut(this.shortcuts.toggleWindowVisibility, () => {
      logger.info("Toggle window visibility shortcut triggered");
      if (this.appController.getWindowService().showWindow) {
        this.appController.hideWindow();
      } else {
        this.appController.showWindow();
      }
    });
       
    this.registerShortcut(this.shortcuts.quitApp, () => {
      logger.info("Quit application shortcut triggered");
      this.appController.quitApplication();
    });

    // Move window shortcuts
    globalShortcut.register('CommandOrControl+Left', () => {
      this.appController.moveWindow('left');
    });

    globalShortcut.register('CommandOrControl+Right', () => {
      this.appController.moveWindow('right');
    });

    globalShortcut.register('CommandOrControl+Up', () => {
      this.appController.moveWindow('up');
    });

    globalShortcut.register('CommandOrControl+Down', () => {
      this.appController.moveWindow('down');
    });

    // Center window shortcut
    this.registerShortcut(this.shortcuts.centerWindow, () => {
      this.appController.centerWindow();
    });

    // Scroll controls
    globalShortcut.register('CommandOrControl+U', () => {
      this.appController.scrollWindow(-100);
    });

    globalShortcut.register('CommandOrControl+D', () => {
      this.appController.scrollWindow(100);
    });
  }

  /**
   * Registers a single shortcut
   * @param {string} accelerator - Shortcut key combination
   * @param {Function} callback - Callback function
   */
  registerShortcut(accelerator, callback) {
    if (typeof accelerator === 'string' && accelerator.trim() !== '') {
      try {
        globalShortcut.register(accelerator, callback);
      } catch (err) {
        logger.error(`Failed to register shortcut: ${accelerator}`, err);
      }
    }
  }

  /**
   * Registers only the show window shortcut (for when app is hidden)
   */
  registerShowWindowShortcut() {
    globalShortcut.unregisterAll();
    this.registerShortcut(this.shortcuts.toggleWindowVisibility, () => {
      logger.info("Show window shortcut triggered");
      this.appController.showWindow();
    });
  }

  /**
   * Unregisters all shortcuts
   */
  unregisterAllShortcuts() {
    globalShortcut.unregisterAll();
  }
}

module.exports = ShortcutService; 
const { BrowserWindow, globalShortcut, screen } = require('electron');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Service for managing application windows
 */
class WindowService {
  /**
   * Creates an instance of WindowService
   */
  constructor() {
    this.mainWindow = null;
    this.settingsWindow = null;
    this.showWindow = true;
    this.isToggling = false;
  }

  /**
   * Creates the main application window
   * @returns {BrowserWindow} - The created main window
   */
  createMainWindow() {
    logger.info("Creating main window");
    
    // Calculate horizontal center position for top-middle placement
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 800;
    const posX = Math.floor((screenWidth - windowWidth) / 2);
    
    this.mainWindow = new BrowserWindow({
      x: posX*(1-0.2),
      y: 0,
      width: 900,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      paintWhenInitiallyHidden: true,
      type: 'toolbar',
    });

    this.mainWindow.loadFile('index.html');
    this.mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    this.mainWindow.setAlwaysOnTop(true, 'screen-saver', 1);
    
    // Set initial state to ignore mouse events
    this.mainWindow.setIgnoreMouseEvents(true, { forward: true });

    logger.info("Main window created and configured");
    
    return this.mainWindow;
  }

  /**
   * Creates the settings window
   */
  createSettingsWindow() {
    if (this.settingsWindow) {
      this.settingsWindow.focus();
      return;
    }

    this.settingsWindow = new BrowserWindow({
      width: 600,
      height: 500,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      resizable: false,
      minimizable: false,
      maximizable: false,
      fullscreenable: false,
      show: false,
      useContentSize: true
    });

    this.settingsWindow.loadFile('settings.html');
    this.settingsWindow.once('ready-to-show', () => {
      this.settingsWindow.show();
    });

    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null;
    });

    // Prevent window dragging from causing resize
    this.settingsWindow.setMinimumSize(600, 500);
    this.settingsWindow.setMaximumSize(600, 500);
  }

  /**
   * Shows the main window
   */
  showMainWindow() {
    if (this.isToggling || this.showWindow) {
      logger.debug("Ignoring show window request - already showing or in progress");
      return;
    }
    
    this.isToggling = true;
    logger.debug("Showing main window");
    this.mainWindow.show();
    if (this.stage === 2) {
      this.mainWindow.webContents.send('show-app');
    } else {
      this.mainWindow.webContents.send('update-instruction');
    }
    this.showWindow = true;
    setTimeout(() => {
      this.isToggling = false;
    }, 100);
  }

  /**
   * Hides the main window
   */
  hideMainWindow() {
    if (this.isToggling || !this.showWindow) {
      logger.debug("Ignoring hide window request - already hidden or in progress");
      return;
    }
    
    this.isToggling = true;
    logger.debug("Hiding main window");
    this.mainWindow.webContents.send('hide-app');
    this.mainWindow.hide();
    this.showWindow = false;
    setTimeout(() => {
      this.isToggling = false;
    }, 100);
  }

  /**
   * Updates the instruction banner in the main window
   * @param {string} instruction - Instruction text to display
   */
  updateInstruction(instruction) {
    if (this.mainWindow?.webContents) {
      this.mainWindow.webContents.send('update-instruction', instruction);
    }
  }

  /**
   * Hides the instruction banner in the main window
   */
  hideInstruction() {
    if (this.mainWindow?.webContents) {
      this.mainWindow.webContents.send('hide-instruction');
    }
  }

  /**
   * Moves the main window to the center of the screen
   */
  centerWindow() {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const { width: windowWidth, height: windowHeight } = this.mainWindow.getBounds();
    const x = Math.floor((screenWidth - windowWidth) / 2);
    const y = Math.floor((screenHeight - windowHeight) / 2);
    this.mainWindow.setPosition(x, y);
  }

  /**
   * Moves the main window in the specified direction
   * @param {string} direction - Direction to move (left, right, up, down)
   */
  moveWindow(direction) {
    const [x, y] = this.mainWindow.getPosition();
    const offset = 50;
    
    switch (direction) {
      case 'left':
        this.mainWindow.setPosition(x - offset, y);
        break;
      case 'right':
        this.mainWindow.setPosition(x + offset, y);
        break;
      case 'up':
        this.mainWindow.setPosition(x, y - offset);
        break;
      case 'down':
        this.mainWindow.setPosition(x, y + offset);
        break;
    }
  }

  /**
   * Scrolls the response box in the main window
   * @param {number} amount - Amount to scroll
   */
  scrollWindow(amount) {
    this.mainWindow.webContents.send('scroll-window', amount);
  }

  /**
   * Sets the application stage
   * @param {number} stage - Stage number (0: boot, 1: multi-capture, 2: AI answered)
   */
  setStage(stage) {
    this.stage = stage;
  }

  /**
   * Gets the application stage
   * @returns {number} - Current stage
   */
  getStage() {
    return this.stage;
  }

  /**
   * Gets the main window
   * @returns {BrowserWindow} - Main window
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * Closes the settings window if it exists
   */
  closeSettingsWindow() {
    if (this.settingsWindow) {
      this.settingsWindow.close();
    }
  }
}

module.exports = WindowService; 
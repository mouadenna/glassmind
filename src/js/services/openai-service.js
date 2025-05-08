const { OpenAI } = require('openai');
const logger = require('../utils/logger');

/**
 * Service for handling OpenAI API operations
 */
class OpenAIService {
  /**
   * Creates an instance of OpenAIService
   * @param {Object} config - Configuration object with API key and options
   * @param {BrowserWindow} mainWindow - Main application window
   */
  constructor(config, mainWindow) {
    this.config = config;
    this.mainWindow = mainWindow;
    
    if (config.baseURL) {
      this.openai = new OpenAI({ baseURL: config.baseURL, apiKey: config.apiKey });
    } else {
      this.openai = new OpenAI({ apiKey: config.apiKey });
    }
    
    // Set default model if not specified
    if (!config.model) {
      this.config.model = "gpt-4o-mini";
      logger.info("Model not specified in config, using default:", { model: this.config.model });
    }
  }

  /**
   * Processes screenshots and user message to get AI analysis
   * @param {string[]} screenshots - Array of base64 encoded screenshots
   * @param {string} userMessage - Optional user message
   * @returns {Promise<string>} - AI-generated response
   */
  async processScreenshots(screenshots, userMessage = "") {
    try {
      // Emit request-started event
      if (this.mainWindow && this.mainWindow.webContents) {
        this.mainWindow.webContents.send('request-started');
      }
      
      logger.info("Processing screenshots", { count: screenshots.length });
      const messages = [
        { type: "text", text: userMessage || "Can you solve the question for me and give the final answer/code?" }
      ];
      
      for (const img of screenshots) {
        messages.push({
          type: "image_url",
          image_url: { url: `data:image/png;base64,${img}` }
        });
      }

      logger.debug("Making OpenAI API request");
      const response = await this.openai.chat.completions.create({
        model: this.config.model,
        messages: [{ role: "user", content: messages }],
        max_completion_tokens: 5000
      });

      logger.info("Received API response");
      
      // Emit request-finished event
      if (this.mainWindow && this.mainWindow.webContents) {
        this.mainWindow.webContents.send('request-finished');
      }
      
      return response.choices[0].message.content;
    } catch (err) {
      logger.error("Error in processScreenshots:", err);
      
      // Emit request-finished event even on error
      if (this.mainWindow && this.mainWindow.webContents) {
        this.mainWindow.webContents.send('request-finished');
      }
      
      throw err;
    }
  }
}

module.exports = OpenAIService; 
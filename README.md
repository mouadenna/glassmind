# GlassMind: The Visual Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg" alt="Platform">
</p>

GlassMind is a smart, screenshot-powered assistant that helps you quickly understand the content on your screen. Whether you're facing a coding problem, deciphering chat conversations, exploring webpage content, troubleshooting desktop errors, or studying complex material, GlassMind provides real-time insights powered by advanced AI technology from OpenAI.

<p align="center">
  <img src="docs/screenshot.png" alt="GlassMind Screenshot" width="800">
</p>

## ✨ Features

- **📸 Screenshot-to-Insight:** Capture any part of your screen and receive real-time AI analysis
- **📚 Multi-Page Support:** Seamlessly capture and analyze multi-step or multi-page content
- **🔍 Floating Glass UI:** Transparent, always-on-top interface that stays unobtrusive while you work
- **⌨️ Global Shortcuts:** Control GlassMind with customizable keyboard shortcuts
- **📝 Markdown Rendering:** View clean AI responses with rich formatting and syntax highlighting

## 🚀 Use Cases

- **🌐 Understand Webpages:** Get plain-language explanations, summaries, or translations of any webpage or UI screen
- **💬 Chat Analysis:** Obtain context-aware responses or summaries from chats on Slack, Discord, or forums
- **📖 Study Assistance:** Simplify complex slides, PDFs, textbooks, or formula screenshots for enhanced learning
- **🐛 Visual Debugging:** Capture terminal errors, code snippets, or error pop-ups and let GlassMind help troubleshoot them
- **💻 Universal Desktop Use:** Compatible with any desktop app—from VS Code and Excel to Photoshop
- **🔠 Interface Translation:** Instantly translate foreign-language UIs or documents
- **⚙️ Prompt Generation:** Convert screenshots into shell commands, Markdown tables, SQL queries, or GPT prompts

## 🏗️ Project Structure

The project follows a modular architecture to improve maintainability, testability, and scalability:

```
glassmind/
├── src/                       # Source code directory
│   ├── css/                   # Stylesheets
│   │   └── styles.css         # Main application styles
│   ├── js/                    # JavaScript code
│   │   ├── services/          # Service modules (business logic)
│   │   │   ├── config-service.js     # Configuration management
│   │   │   ├── openai-service.js     # OpenAI API interactions
│   │   │   ├── screenshot-service.js # Screenshot capture logic
│   │   │   ├── shortcut-service.js   # Keyboard shortcuts management
│   │   │   └── window-service.js     # Window management
│   │   ├── ui/                # UI-related code
│   │   │   └── renderer.js    # UI rendering and event handling
│   │   ├── utils/             # Utility functions
│   │   │   └── logger.js      # Logging utility
│   │   ├── app-controller.js  # Main application controller
│   │   └── main.js            # Application entry point
├── docs/                      # Documentation
│   └── screenshot.png         # Application screenshot for README
├── index.html                 # Main application HTML
├── settings.html              # Settings window HTML
├── settings.json              # Keyboard shortcuts configuration
├── start.js                   # Application startup script
├── config.json                # API configuration
├── package.json               # Project metadata and dependencies
└── README.md                  # Project documentation
```

### 🔄 Architecture

The project uses a modern modular architecture with clear separation of concerns:

- **🧩 Service-oriented architecture**: Each major functionality is separated into its own service module
- **💉 Dependency injection**: Services receive their dependencies through constructors, making testing easier
- **🏛️ MVC pattern**: Clear separation between:
  - **Model**: Services that manage data and business logic
  - **View**: UI components in the renderer.js file
  - **Controller**: App controller that coordinates between services and UI

### 🧩 Core Components

#### Main Process (Node.js)
- **⚙️ main.js**: Application entry point that initializes the app and creates windows
- **🎮 app-controller.js**: Orchestrates all services and handles the application flow
- **🚀 start.js**: Handles configuration setup and application startup

#### Renderer Process (Browser)
- **🖌️ renderer.js**: Manages UI updates and user interactions
- **📄 index.html**: Main application window structure
- **⚙️ settings.html**: Settings window structure

### 🔌 Services

Each service is designed to handle a specific aspect of the application:

- **⚙️ ConfigService**: 
  - Loads and parses the config.json file
  - Provides configuration values to other services
  - Handles saving configuration changes

- **🪟 WindowService**: 
  - Creates and manages application windows
  - Handles window positioning and visibility
  - Controls window interactions (show/hide/move)

- **⌨️ ShortcutService**: 
  - Registers global keyboard shortcuts
  - Loads custom shortcuts from settings.json
  - Maps shortcuts to application functions

- **📸 ScreenshotService**: 
  - Captures screenshots of the screen
  - Converts screenshots to base64 for API use
  - Manages collections of screenshots for multi-page mode

- **🧠 OpenAIService**: 
  - Initializes the OpenAI client with API key
  - Handles API requests and responses
  - Processes images and text for AI analysis

### 📂 Configuration Files

- **config.template.json**: Template for API configuration
  ```json
  {
    "apiKey": "YOUR_OPENAI_API_KEY",
    "model": "gpt-4o-mini",
    "baseURL": null
  }
  ```

- **settings.json**: Customizable keyboard shortcuts
  ```json
  {
    "shortcuts": {
      "captureScreenshot": "Ctrl+Shift+S",
      "multiPageCapture": "Ctrl+Shift+A",
      "textInput": "Ctrl+Shift+I",
      "openSettings": "Ctrl+P",
      "toggleWindowVisibility": "Ctrl+Shift+W",
      "resetSession": "Ctrl+Shift+R",
      "quitApp": "Ctrl+Shift+Q"
    }
  }
  ```

## 🛠️ Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- An OpenAI API key with Vision access

## 📦 Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/mouadenna/glassmind.git
   cd glassmind
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the application:**

   ```bash
   npm start
   ```

   The first time you run the application, it will create a `config.json` file from the template and ask you to add your OpenAI API key.

4. **Edit the config.json file:**

   Add your OpenAI API key to the `config.json` file:

   ```json
   {
     "apiKey": "YOUR_OPENAI_API_KEY",
     "model": "gpt-4o-mini"
   }
   ```

5. **Start the application again:**

   ```bash
   npm start
   ```

## 🎮 Usage

Start GlassMind with:

```bash
npm start
```

For development with instant reload:

```bash
npm run dev
```

## ⌨️ Keyboard Shortcuts

GlassMind supports customizable shortcuts through the `settings.json` file in the project root.

### Default Shortcuts

| Shortcut              | Action                                      |
|-----------------------|---------------------------------------------|
| `Ctrl + Shift + S`    | Capture screenshot & process it             |
| `Ctrl + Shift + A`    | Start/continue multi-page capture           |
| `Ctrl + Shift + I`    | Open text input                             |
| `Ctrl + P`            | Open settings                               |
| `Ctrl + Shift + W`    | Toggle window visibility                    |
| `Ctrl + Shift + R`    | Reset/clear the current session             |
| `Ctrl + Shift + Q`    | Quit the application                        |
| `Ctrl + Arrow Keys`   | Move window (Left, Right, Up, Down)         |
| `Ctrl + C`            | Center window on screen                     |
| `Ctrl + U / D`        | Scroll AI response up/down                  |

### Customizing Shortcuts

To change the default shortcuts, modify the `settings.json` file:

```json
{
  "shortcuts": {
    "captureScreenshot": "Ctrl+Shift+S",
    "multiPageCapture": "Ctrl+Shift+A",
    "textInput": "Ctrl+Shift+I",
    "openSettings": "Ctrl+P",
    "toggleWindowVisibility": "Ctrl+Shift+W",
    "resetSession": "Ctrl+Shift+R",
    "quitApp": "Ctrl+Shift+Q",
    "moveWindow": "Ctrl+ArrowKeys",
    "centerWindow": "Ctrl+C",
    "scrollResponse": "Ctrl+U/D"
  }
}
```

## 🛠️ Building for Production

Build for your platform:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux

# All platforms
npm run build
```

## 🔍 Technical Highlights

- ⚡ Electron-powered desktop application
- 🧠 Powered by advanced AI technology from OpenAI
- 📝 Advanced markdown rendering with built-in code syntax highlighting
- ⌨️ Keyboard-first UX designed to minimize distractions
- 📦 Modular architecture for better maintainability and extendability
- 🔄 Multi-shot context capture for comprehensive analysis

## 👥 Contributing

Contributions are welcome! If you have ideas or encounter any bugs, please:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. For more details, see the [LICENSE](LICENSE) file.

## ⚠️ Disclaimer

GlassMind is intended for educational, productivity, and personal use. Please adhere to the terms of service for any third-party content or platforms you interact with.
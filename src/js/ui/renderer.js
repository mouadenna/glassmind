const { ipcRenderer } = require('electron');

// Configure marked to use highlight.js
marked.setOptions({
  sanitize: true,
  breaks: true,
  gfm: true,
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    return hljs.highlightAuto(code).value;
  }
});

/**
 * Shows the response overlay
 */
const showOverlay = () => {
  const overlay = document.getElementById('response-overlay');
  overlay.classList.add('visible');
};

/**
 * Hides the response overlay
 */
const hideOverlay = () => {
  const overlay = document.getElementById('response-overlay');
  overlay.classList.remove('visible');
};

/**
 * Updates the instruction banner with the given text
 * @param {string} text - The text to display
 * @param {boolean} show - Whether to show the banner
 */
const updateBanner = (text, show = true) => {
  const banner = document.getElementById('instruction-banner');
  banner.style.opacity = show ? '1' : '0';
  if (text) {
    // Format keyboard shortcuts with <span class="kbd">
    const formattedText = text.replace(/Ctrl\+Shift\+([A-Z])/g, '<span class="kbd">Ctrl+Shift+$1</span>');
    banner.innerHTML = formattedText;
  }
};

/**
 * Shows a waiting animation on the instruction banner
 * @param {boolean} isWaiting - Whether to show or hide the waiting animation
 */
const showWaitingAnimation = (isWaiting) => {
  const banner = document.getElementById('instruction-banner');
  
  if (isWaiting) {
    // Store original opacity for restoration
    banner.dataset.originalOpacity = banner.style.opacity || '1';
    
    // Start the pulsing animation
    let opacity = 1;
    let decreasing = true;
    banner.waitingInterval = setInterval(() => {
      if (decreasing) {
        opacity -= 0.1;
        if (opacity <= 0.4) decreasing = false;
      } else {
        opacity += 0.1;
        if (opacity >= 1) decreasing = true;
      }
      banner.style.opacity = opacity;
    }, 200);
  } else {
    // Stop the animation
    if (banner.waitingInterval) {
      clearInterval(banner.waitingInterval);
      banner.waitingInterval = null;
      
      // Restore original opacity
      banner.style.opacity = banner.dataset.originalOpacity || '1';
    }
  }
};

/**
 * Formats keyboard shortcuts in text
 * @param {string} text - The text containing keyboard shortcuts
 * @returns {string} - Formatted text
 */
const formatKeyboardShortcuts = (text) => {
  return text.replace(/Ctrl\+Shift\+([A-Z])/g, 'Ctrl+Shift+$1');
};

/**
 * Shows the text input overlay
 */
const showTextInput = () => {
  const textInputOverlay = document.getElementById('text-input-overlay');
  const textInput = document.getElementById('text-input');
  textInputOverlay.style.display = 'flex';
  textInput.value = '';
  textInput.focus();
};

/**
 * Hides the text input overlay
 */
const hideTextInput = () => {
  const textInputOverlay = document.getElementById('text-input-overlay');
  textInputOverlay.style.display = 'none';
};

/**
 * Sends the text input to the main process
 */
const sendTextInput = () => {
  const textInput = document.getElementById('text-input');
  const text = textInput.value.trim();
  if (text) {
    ipcRenderer.send('text-input', text);
    hideTextInput();
  }
};

// Define handlers for IPC events
const handlers = {
  'analysis-result': (event, result) => {
    showWaitingAnimation(false);
    showOverlay();
    document.getElementById('response-box').innerHTML = marked.parse(result);
    // Apply highlighting to any code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
    updateBanner(formatKeyboardShortcuts("Ctrl+Shift+R: Repeat process <br> Ctrl+Shift+W: Hide Window <br> Ctrl+Shift+Q: Close"));
  },
  
  'error': (event, error) => {
    showWaitingAnimation(false);
    showOverlay();
    document.getElementById('response-box').innerHTML = 
      `<div class="error-message">
        <span class="response-type response-error">ERROR</span>
        <strong>${error}</strong>
        <br><small>Press <span class="kbd">Ctrl+Shift+R</span> to try again</small>
      </div>`;
  },
  
  'update-instruction': (event, instruction) => {
    updateBanner(instruction, true);
  },
  
  'hide-instruction': () => {
    updateBanner('', false);
  },

  'hide-app': () => {
    showWaitingAnimation(false);
    updateBanner('', false);
    hideOverlay();
  },

  'show-app': () => {
    updateBanner('', true);
    showOverlay();
  },
  
  'clear-result': () => {
    showWaitingAnimation(false);
    document.getElementById('response-box').innerHTML = "";
    hideOverlay();
  },

  'scroll-window': (event, amount) => {
    const responseBox = document.getElementById('response-box');
    responseBox.scrollBy({
      top: amount,
      behavior: 'smooth'
    });
  },
  
  'request-started': () => {
    showWaitingAnimation(true);
  },
  
  'request-finished': () => {
    showWaitingAnimation(false);
  },

  'show-text-input': showTextInput
};

// Register all IPC event handlers
const registerHandlers = () => {
  Object.entries(handlers).forEach(([channel, handler]) => {
    ipcRenderer.on(channel, handler);
  });
};

// Event listeners setup
const setupEventListeners = () => {
  // Add document click listener to hide overlay when clicking outside response box
  document.addEventListener('click', (e) => {
    const responseBox = document.getElementById('response-box');
    const overlay = document.getElementById('response-overlay');
    
    if (overlay.classList.contains('visible') && !responseBox.contains(e.target)) {
      hideOverlay();
    }
  });

  // Add keyboard event listener for text input
  document.getElementById('text-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextInput();
    } else if (e.key === 'Escape') {
      hideTextInput();
    }
  });
};

// Initialize the UI
const initUI = () => {
  registerHandlers();
  setupEventListeners();
  // Initialize with formatted shortcuts
  updateBanner(formatKeyboardShortcuts("Ctrl+Shift+S: Screenshot | Ctrl+Shift+A: Multi-mode <br> Ctrl+Shift+W: Hide Window | Ctrl+Shift+Q: Close"));
};

// Clean up event listeners when the window is unloaded
window.addEventListener('unload', () => {
  Object.keys(handlers).forEach(channel => {
    ipcRenderer.removeAllListeners(channel);
  });
});

// Initialize the UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', initUI);

// Export functions for potential external use
module.exports = {
  showOverlay,
  hideOverlay,
  updateBanner,
  showTextInput,
  hideTextInput,
  showWaitingAnimation
}; 
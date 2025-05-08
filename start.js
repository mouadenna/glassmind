const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Check if config.json exists
const configPath = path.join(__dirname, 'config.json');
const templatePath = path.join(__dirname, 'config.template.json');

if (!fs.existsSync(configPath) && fs.existsSync(templatePath)) {
  console.log('No config.json found. Creating from template...');
  
  // Copy the template to config.json
  fs.copyFileSync(templatePath, configPath);
  
  console.log('config.json created. Please edit it to add your API key.');
  console.log('');
  console.log('You need to add your OpenAI API key to config.json before continuing.');
  
  // Exit the process to let the user add their API key
  process.exit(0);
}

// If config.json exists, check if it has a valid API key
try {
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  
  if (!config.apiKey || config.apiKey === 'YOUR_OPENAI_API_KEY') {
    console.log('Please add your OpenAI API key to config.json before starting the application.');
    process.exit(0);
  }
  
  // Start the application
  const electron = require('electron');
  const proc = spawn(electron, ['.'], { stdio: 'inherit' });
  
  proc.on('close', (code) => {
    process.exit(code);
  });
  
} catch (err) {
  console.error('Error reading config.json:', err);
  process.exit(1);
} 
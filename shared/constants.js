/**
 * Application-wide constants shared between frontend and backend
 */

// Browser engines
const BROWSER_ENGINES = {
  CHROMIUM: 'chromium',
  FIREFOX: 'firefox',
  WEBKIT: 'webkit'
};

// Browser platforms
const PLATFORMS = {
  WINDOWS: 'windows',
  MACOS: 'macos',
  LINUX: 'linux',
  ANDROID: 'android',
  IOS: 'ios'
};

// Browser fingerprinting protections
const FINGERPRINT_PROTECTION = {
  REAL: 'real',
  FAKE: 'fake',
  NOISE: 'noise',
  BLOCK: 'block',
  DISABLED: 'disabled'
};

// Proxy types
const PROXY_TYPES = {
  HTTP: 'http',
  HTTPS: 'https',
  SOCKS4: 'socks4',
  SOCKS5: 'socks5',
  SSL: 'ssl'
};

// Workflow step types
const WORKFLOW_STEP_TYPES = {
  NAVIGATE: 'navigate',
  CLICK: 'click',
  TYPE: 'type',
  WAIT: 'wait',
  SCREENSHOT: 'screenshot',
  EXTRACT: 'extract'
};

// Status values
const STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error',
  WORKING: 'working',
  TESTING: 'testing',
  NOT_TESTED: 'not_tested'
};

// IPC channels
const IPC_CHANNELS = {
  PROFILE_STATUS: 'profile:status',
  PROXY_STATUS: 'proxy:status',
  WORKFLOW_STATUS: 'workflow:status',
  WORKFLOW_LOG: 'workflow:log',
  THEME_CHANGED: 'theme:changed'
};

// Theme options
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Log levels
const LOG_LEVELS = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

module.exports = {
  BROWSER_ENGINES,
  PLATFORMS,
  FINGERPRINT_PROTECTION,
  PROXY_TYPES,
  WORKFLOW_STEP_TYPES,
  STATUS,
  IPC_CHANNELS,
  THEMES,
  LOG_LEVELS
};

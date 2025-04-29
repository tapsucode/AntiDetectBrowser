const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Create express app
const app = express();
app.use(express.json());

// In-memory storage (for demo purposes)
let profiles = [];
let proxies = [];
let workflows = [];

// Initialize data directory
async function initDataDirectory() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.mkdir(dataDir, { recursive: true });
    
    // Create subdirectories
    await fs.mkdir(path.join(dataDir, 'screenshots'), { recursive: true });
    await fs.mkdir(path.join(dataDir, 'downloads'), { recursive: true });
    
    console.log('Data directory initialized:', dataDir);
  } catch (error) {
    console.error('Failed to initialize data directory:', error);
  }
}

// API Routes for Profiles
app.get('/api/profiles', (req, res) => {
  res.json(profiles);
});

app.post('/api/profiles', (req, res) => {
  const newProfile = {
    id: uuidv4(),
    name: req.body.name,
    userAgent: req.body.userAgent || '',
    proxyId: req.body.proxyId || null,
    platform: req.body.platform || 'windows',
    screenResolution: req.body.screenResolution || '1920x1080',
    language: req.body.language || 'en-US',
    timezone: req.body.timezone || 'UTC',
    webRTC: req.body.webRTC || 'real',
    canvas: req.body.canvas || 'real',
    webGL: req.body.webGL || 'real',
    notes: req.body.notes || '',
    active: false,
    sessions: 0,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  profiles.push(newProfile);
  res.status(201).json(newProfile);
});

app.get('/api/profiles/:id', (req, res) => {
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  res.json(profile);
});

app.put('/api/profiles/:id', (req, res) => {
  const index = profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  
  const updatedProfile = {
    ...profiles[index],
    name: req.body.name || profiles[index].name,
    userAgent: req.body.userAgent !== undefined ? req.body.userAgent : profiles[index].userAgent,
    proxyId: req.body.proxyId !== undefined ? req.body.proxyId : profiles[index].proxyId,
    platform: req.body.platform || profiles[index].platform,
    screenResolution: req.body.screenResolution || profiles[index].screenResolution,
    language: req.body.language || profiles[index].language,
    timezone: req.body.timezone || profiles[index].timezone,
    webRTC: req.body.webRTC || profiles[index].webRTC,
    canvas: req.body.canvas || profiles[index].canvas,
    webGL: req.body.webGL || profiles[index].webGL,
    notes: req.body.notes !== undefined ? req.body.notes : profiles[index].notes,
    updatedAt: Date.now()
  };
  
  profiles[index] = updatedProfile;
  res.json(updatedProfile);
});

app.delete('/api/profiles/:id', (req, res) => {
  const index = profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  
  profiles.splice(index, 1);
  res.json({ message: 'Profile deleted successfully' });
});

app.post('/api/profiles/:id/launch', (req, res) => {
  const index = profiles.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  
  // Simulate launching the profile
  profiles[index].active = true;
  profiles[index].sessions += 1;
  profiles[index].updatedAt = Date.now();
  
  setTimeout(() => {
    // Notify clients about the status change (in a real app, this would use WebSockets)
    console.log(`Profile ${profiles[index].name} is now active`);
  }, 1000);
  
  res.json(profiles[index]);
});

// API Routes for Proxies
app.get('/api/proxies', (req, res) => {
  res.json(proxies);
});

app.post('/api/proxies', (req, res) => {
  const newProxy = {
    id: uuidv4(),
    name: req.body.name,
    type: req.body.type || 'http',
    host: req.body.host,
    port: req.body.port,
    username: req.body.username || '',
    password: req.body.password || '',
    country: req.body.country || '',
    city: req.body.city || '',
    status: 'not_tested',
    lastTest: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  proxies.push(newProxy);
  res.status(201).json(newProxy);
});

app.get('/api/proxies/:id', (req, res) => {
  const proxy = proxies.find(p => p.id === req.params.id);
  if (!proxy) {
    return res.status(404).json({ message: 'Proxy not found' });
  }
  res.json(proxy);
});

app.put('/api/proxies/:id', (req, res) => {
  const index = proxies.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Proxy not found' });
  }
  
  const updatedProxy = {
    ...proxies[index],
    name: req.body.name || proxies[index].name,
    type: req.body.type || proxies[index].type,
    host: req.body.host || proxies[index].host,
    port: req.body.port || proxies[index].port,
    username: req.body.username !== undefined ? req.body.username : proxies[index].username,
    password: req.body.password !== undefined ? req.body.password : proxies[index].password,
    country: req.body.country !== undefined ? req.body.country : proxies[index].country,
    city: req.body.city !== undefined ? req.body.city : proxies[index].city,
    updatedAt: Date.now()
  };
  
  proxies[index] = updatedProxy;
  res.json(updatedProxy);
});

app.delete('/api/proxies/:id', (req, res) => {
  const index = proxies.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Proxy not found' });
  }
  
  proxies.splice(index, 1);
  res.json({ message: 'Proxy deleted successfully' });
});

app.post('/api/proxies/:id/test', (req, res) => {
  const index = proxies.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Proxy not found' });
  }
  
  // Simulate testing the proxy
  proxies[index].status = 'testing';
  proxies[index].lastTest = Date.now();
  
  // Simulate async testing
  setTimeout(() => {
    // Randomly succeed or fail for demo purposes
    proxies[index].status = Math.random() > 0.3 ? 'working' : 'error';
    console.log(`Proxy ${proxies[index].name} tested: ${proxies[index].status}`);
  }, 2000);
  
  res.json(proxies[index]);
});

// API Routes for Workflows
app.get('/api/workflows', (req, res) => {
  res.json(workflows);
});

app.post('/api/workflows', (req, res) => {
  const newWorkflow = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description || '',
    profileId: req.body.profileId,
    steps: req.body.steps || [],
    status: 'idle',
    lastRun: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  workflows.push(newWorkflow);
  res.status(201).json(newWorkflow);
});

app.get('/api/workflows/:id', (req, res) => {
  const workflow = workflows.find(w => w.id === req.params.id);
  if (!workflow) {
    return res.status(404).json({ message: 'Workflow not found' });
  }
  res.json(workflow);
});

app.put('/api/workflows/:id', (req, res) => {
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Workflow not found' });
  }
  
  const updatedWorkflow = {
    ...workflows[index],
    name: req.body.name || workflows[index].name,
    description: req.body.description !== undefined ? req.body.description : workflows[index].description,
    profileId: req.body.profileId || workflows[index].profileId,
    steps: req.body.steps || workflows[index].steps,
    updatedAt: Date.now()
  };
  
  workflows[index] = updatedWorkflow;
  res.json(updatedWorkflow);
});

app.delete('/api/workflows/:id', (req, res) => {
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Workflow not found' });
  }
  
  workflows.splice(index, 1);
  res.json({ message: 'Workflow deleted successfully' });
});

app.post('/api/workflows/:id/execute', (req, res) => {
  const index = workflows.findIndex(w => w.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Workflow not found' });
  }
  
  // Update status to running
  workflows[index].status = 'running';
  workflows[index].lastRun = Date.now();
  
  // Simulate workflow execution
  setTimeout(() => {
    // Simulate workflow completion or error
    workflows[index].status = Math.random() > 0.2 ? 'completed' : 'error';
    console.log(`Workflow ${workflows[index].name} executed: ${workflows[index].status}`);
  }, 5000);
  
  res.json(workflows[index]);
});

// Serve static files
app.use(express.static('public'));

// Routes for SPA support
app.get('/', (req, res) => {
  // For demo, redirect to login page first time
  if (!req.query.loggedIn) {
    res.redirect('/login.html');
  } else {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// Route for login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// For demo, redirect to login when accessing root for first time
app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route for handling SPA navigation
app.get('/profiles', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/proxies', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/automation', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'automation.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize and start the server
async function startServer() {
  await initDataDirectory();
  
  // Add some sample data for demo purposes
  profiles.push({
    id: uuidv4(),
    name: "Marketing Profile",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36",
    proxyId: null,
    platform: "windows",
    screenResolution: "1920x1080",
    language: "en-US",
    timezone: "America/New_York",
    webRTC: "fake",
    canvas: "noise",
    webGL: "noise",
    notes: "Used for marketing campaigns",
    active: false,
    sessions: 12,
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
  });
  
  profiles.push({
    id: uuidv4(),
    name: "Social Media",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15",
    proxyId: null,
    platform: "macos",
    screenResolution: "1440x900",
    language: "en-GB",
    timezone: "Europe/London",
    webRTC: "real",
    canvas: "block",
    webGL: "real",
    notes: "Social media accounts management",
    active: false,
    sessions: 34,
    createdAt: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000 // 5 days ago
  });
  
  // Add a sample proxy
  proxies.push({
    id: uuidv4(),
    name: "US Proxy",
    type: "http",
    host: "us-proxy.example.com",
    port: "8080",
    username: "user123",
    password: "pass456",
    country: "United States",
    city: "New York",
    status: "working",
    lastTest: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000 // 2 days ago
  });
  
  // Add a sample workflow
  workflows.push({
    id: uuidv4(),
    name: "Login Automation",
    description: "Automated login to example website",
    profileId: profiles[0].id,
    steps: [
      {
        type: "navigate",
        parameters: { url: "https://example.com/login" }
      },
      {
        type: "type",
        parameters: { selector: "#username", text: "testuser" }
      },
      {
        type: "type",
        parameters: { selector: "#password", text: "password123" }
      },
      {
        type: "click",
        parameters: { selector: "#loginButton" }
      },
      {
        type: "wait",
        parameters: { selector: ".dashboard-container" }
      }
    ],
    status: "idle",
    lastRun: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000 // 7 days ago
  });
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
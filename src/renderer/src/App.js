import React, { useState, useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import styled from 'styled-components';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ProfileManager from './views/ProfileManager';
import ProxyManager from './views/ProxyManager';
import Automation from './views/Automation';
import Settings from './views/Settings';

// Global styles
const GlobalStyle = createGlobalStyle`
  button, input, select, textarea {
    font-family: var(--font-primary);
  }
  
  button {
    cursor: pointer;
  }

  a {
    color: var(--color-accent);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--color-bg-secondary);
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--color-border);
    border-radius: 4px;
    
    &:hover {
      background: var(--color-text-secondary);
    }
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentArea = styled.main`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
`;

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [profiles, setProfiles] = useState([]);
  const [proxies, setProxies] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Load initial data from the backend
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [profilesData, proxiesData, workflowsData] = await Promise.all([
          window.api.getProfiles(),
          window.api.getProxies(),
          window.api.getWorkflows()
        ]);
        
        setProfiles(profilesData || []);
        setProxies(proxiesData || []);
        setWorkflows(workflowsData || []);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setLoading(false);
      }
    };

    loadInitialData();
    
    // Set up theme based on system preference if no stored preference
    if (!localStorage.getItem('theme')) {
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDarkMode ? 'dark' : 'light');
      document.documentElement.setAttribute('data-theme', prefersDarkMode ? 'dark' : 'light');
    }
    
    // Subscribe to backend events
    window.api.on('profile:status', (updatedProfile) => {
      setProfiles(prevProfiles => prevProfiles.map(profile => 
        profile.id === updatedProfile.id ? updatedProfile : profile
      ));
    });
    
    window.api.on('proxy:status', (updatedProxy) => {
      setProxies(prevProxies => prevProxies.map(proxy => 
        proxy.id === updatedProxy.id ? updatedProxy : proxy
      ));
    });
    
    window.api.on('workflow:status', (updatedWorkflow) => {
      setWorkflows(prevWorkflows => prevWorkflows.map(workflow => 
        workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow
      ));
    });
    
    return () => {
      window.api.removeListener('profile:status');
      window.api.removeListener('proxy:status');
      window.api.removeListener('workflow:status');
    };
  }, []);

  // Render the active view
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard profiles={profiles} proxies={proxies} workflows={workflows} />;
      case 'profiles':
        return <ProfileManager profiles={profiles} setProfiles={setProfiles} proxies={proxies} />;
      case 'proxies':
        return <ProxyManager proxies={proxies} setProxies={setProxies} />;
      case 'automation':
        return <Automation workflows={workflows} setWorkflows={setWorkflows} profiles={profiles} />;
      case 'settings':
        return <Settings theme={theme} toggleTheme={toggleTheme} />;
      default:
        return <Dashboard profiles={profiles} proxies={proxies} workflows={workflows} />;
    }
  };

  if (loading) {
    return <div className="app-loading">
      <div className="loading-spinner"></div>
      <p>Loading Anti-Detect Browser...</p>
    </div>;
  }

  return (
    <AppContainer>
      <GlobalStyle />
      <Header theme={theme} toggleTheme={toggleTheme} />
      <MainContent>
        <Sidebar activeView={activeView} setActiveView={setActiveView} />
        <ContentArea>
          {renderView()}
        </ContentArea>
      </MainContent>
    </AppContainer>
  );
};

export default App;

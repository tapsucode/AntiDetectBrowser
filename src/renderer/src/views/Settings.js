import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 1.5rem;
  
  h1 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--color-text-secondary);
  }
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(600px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingsSection = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--color-border);
`;

const SectionHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  
  .title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .description {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
  }
`;

const SectionContent = styled.div`
  padding: 1.25rem;
`;

const SettingItem = styled.div`
  margin-bottom: 1.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  .setting-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
    
    .setting-label {
      font-weight: 500;
    }
    
    .setting-control {
      &.switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
        
        input {
          opacity: 0;
          width: 0;
          height: 0;
          
          &:checked + .slider {
            background-color: var(--color-accent);
          }
          
          &:focus + .slider {
            box-shadow: 0 0 1px var(--color-accent);
          }
          
          &:checked + .slider:before {
            transform: translateX(20px);
          }
        }
        
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--color-text-secondary);
          opacity: 0.3;
          transition: .4s;
          border-radius: 24px;
          
          &:before {
            position: absolute;
            content: "";
            height: 18px;
            width: 18px;
            left: 3px;
            bottom: 3px;
            background-color: white;
            transition: .4s;
            border-radius: 50%;
          }
        }
      }
    }
  }
  
  .setting-description {
    color: var(--color-text-secondary);
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
  
  .setting-input {
    select, input {
      width: 100%;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background-color: var(--color-bg-primary);
      color: var(--color-text-primary);
      font-size: 0.95rem;
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }
    
    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236e6e80' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 16px;
      padding-right: 2.5rem;
    }
  }
  
  .radio-options {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
    
    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      
      input[type="radio"] {
        cursor: pointer;
      }
    }
  }
  
  .theme-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    
    .theme-option {
      text-align: center;
      border-radius: 8px;
      border: 2px solid transparent;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &.selected {
        border-color: var(--color-accent);
      }
      
      &:hover {
        background-color: var(--color-border);
      }
      
      .theme-preview {
        height: 80px;
        margin-bottom: 0.75rem;
        border-radius: 6px;
        overflow: hidden;
        
        &.light {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          
          .preview-header {
            background-color: #f5f7fa;
            height: 20px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .preview-content {
            display: flex;
            height: calc(100% - 20px);
            
            .preview-sidebar {
              width: 25%;
              background-color: #f5f7fa;
              border-right: 1px solid #e2e8f0;
            }
            
            .preview-main {
              width: 75%;
              padding: 4px;
              
              .preview-text {
                height: 4px;
                margin-bottom: 3px;
                background-color: #6e6e80;
                width: 80%;
                opacity: 0.3;
                border-radius: 2px;
              }
              
              .preview-text:nth-child(2) {
                width: 60%;
              }
              
              .preview-text:nth-child(3) {
                width: 70%;
              }
            }
          }
        }
        
        &.dark {
          background-color: #1a1c25;
          
          .preview-header {
            background-color: #24273a;
            height: 20px;
            border-bottom: 1px solid #2d2f3b;
          }
          
          .preview-content {
            display: flex;
            height: calc(100% - 20px);
            
            .preview-sidebar {
              width: 25%;
              background-color: #24273a;
              border-right: 1px solid #2d2f3b;
            }
            
            .preview-main {
              width: 75%;
              padding: 4px;
              
              .preview-text {
                height: 4px;
                margin-bottom: 3px;
                background-color: #a9b4c0;
                width: 80%;
                opacity: 0.5;
                border-radius: 2px;
              }
              
              .preview-text:nth-child(2) {
                width: 60%;
              }
              
              .preview-text:nth-child(3) {
                width: 70%;
              }
            }
          }
        }
        
        &.system {
          position: relative;
          
          .system-preview {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            transition: opacity 1.5s ease;
            
            &.light {
              opacity: ${props => props.systemPrefersDark ? 0 : 1};
            }
            
            &.dark {
              opacity: ${props => props.systemPrefersDark ? 1 : 0};
            }
          }
        }
      }
      
      .theme-name {
        font-size: 0.9rem;
        font-weight: 500;
      }
    }
  }
`;

const ActionButton = styled.button`
  background-color: ${props => props.primary ? 'var(--color-accent)' : 'transparent'};
  color: ${props => props.primary ? 'white' : 'var(--color-text-secondary)'};
  border: ${props => props.primary ? 'none' : '1px solid var(--color-border)'};
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.primary ? 'var(--color-accent-hover)' : 'var(--color-border)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const InfoBanner = styled.div`
  padding: 1rem;
  background-color: ${props => 
    props.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 
    props.type === 'info' ? 'rgba(59, 130, 246, 0.1)' :
    props.type === 'warning' ? 'rgba(251, 191, 36, 0.1)' :
    'rgba(248, 113, 113, 0.1)'
  };
  border-left: 4px solid ${props => 
    props.type === 'success' ? '#4ade80' : 
    props.type === 'info' ? '#3b82f6' :
    props.type === 'warning' ? '#fbbc24' :
    '#f87171'
  };
  border-radius: 6px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  
  .banner-icon {
    color: ${props => 
      props.type === 'success' ? '#4ade80' : 
      props.type === 'info' ? '#3b82f6' :
      props.type === 'warning' ? '#fbbc24' :
      '#f87171'
    };
    margin-top: 0.1rem;
  }
  
  .banner-content {
    flex: 1;
    
    .banner-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }
    
    .banner-text {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }
  }
`;

const Settings = ({ theme, toggleTheme }) => {
  const [settings, setSettings] = useState({
    theme: theme,
    autoLaunchOnStartup: false,
    clearCookiesOnClose: false,
    defaultBrowserEngine: 'chromium',
    notificationsEnabled: true,
    blockedDomains: '',
    anonymizationLevel: 'balanced'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showSavedBanner, setShowSavedBanner] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  
  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await window.api.getSettings();
        setSettings({
          ...settings,
          ...savedSettings,
          theme // Use the theme from props
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setIsLoading(false);
      }
    };
    
    loadSettings();
    
    // Set up listener for system theme changes
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e) => {
      setSystemPrefersDark(e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleThemeChange = (newTheme) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      theme: newTheme
    }));
    
    // Update the theme in the application
    if (newTheme !== 'system') {
      toggleTheme(newTheme === 'dark');
    } else {
      // If system, use the system preference
      toggleTheme(systemPrefersDark);
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      await window.api.updateSettings(settings);
      setShowSavedBanner(true);
      setTimeout(() => setShowSavedBanner(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Handle error (show error message)
    }
  };
  
  const handleResetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings({
        theme: 'system',
        autoLaunchOnStartup: false,
        clearCookiesOnClose: false,
        defaultBrowserEngine: 'chromium',
        notificationsEnabled: true,
        blockedDomains: '',
        anonymizationLevel: 'balanced'
      });
    }
  };
  
  if (isLoading) {
    return (
      <SettingsContainer>
        <PageHeader>
          <h1>Settings</h1>
          <p>Loading settings...</p>
        </PageHeader>
      </SettingsContainer>
    );
  }
  
  return (
    <SettingsContainer>
      <PageHeader>
        <h1>Settings</h1>
        <p>Configure your anti-detect browser preferences</p>
      </PageHeader>
      
      {showSavedBanner && (
        <InfoBanner type="success">
          <div className="banner-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="banner-content">
            <div className="banner-title">Settings saved successfully</div>
            <div className="banner-text">Your preferences have been updated</div>
          </div>
        </InfoBanner>
      )}
      
      <SettingsGrid>
        <SettingsSection>
          <SectionHeader>
            <div className="title">Appearance</div>
            <div className="description">Customize how your anti-detect browser looks</div>
          </SectionHeader>
          
          <SectionContent>
            <SettingItem>
              <div className="setting-header">
                <div className="setting-label">Theme</div>
              </div>
              <div className="setting-description">
                Choose between light, dark, or system-based theme
              </div>
              
              <div className="theme-options">
                <div 
                  className={`theme-option ${settings.theme === 'light' ? 'selected' : ''}`}
                  onClick={() => handleThemeChange('light')}
                >
                  <div className="theme-preview light">
                    <div className="preview-header"></div>
                    <div className="preview-content">
                      <div className="preview-sidebar"></div>
                      <div className="preview-main">
                        <div className="preview-text"></div>
                        <div className="preview-text"></div>
                        <div className="preview-text"></div>
                      </div>
                    </div>
                  </div>
                  <div className="theme-name">Light</div>
                </div>
                
                <div 
                  className={`theme-option ${settings.theme === 'dark' ? 'selected' : ''}`}
                  onClick={() => handleThemeChange('dark')}
                >
                  <div className="theme-preview dark">
                    <div className="preview-header"></div>
                    <div className="preview-content">
                      <div className="preview-sidebar"></div>
                      <div className="preview-main">
                        <div className="preview-text"></div>
                        <div className="preview-text"></div>
                        <div className="preview-text"></div>
                      </div>
                    </div>
                  </div>
                  <div className="theme-name">Dark</div>
                </div>
                
                <div 
                  className={`theme-option ${settings.theme === 'system' ? 'selected' : ''}`}
                  onClick={() => handleThemeChange('system')}
                  systemPrefersDark={systemPrefersDark}
                >
                  <div className="theme-preview system">
                    <div className="system-preview light">
                      <div className="preview-header"></div>
                      <div className="preview-content">
                        <div className="preview-sidebar"></div>
                        <div className="preview-main">
                          <div className="preview-text"></div>
                          <div className="preview-text"></div>
                          <div className="preview-text"></div>
                        </div>
                      </div>
                    </div>
                    <div className="system-preview dark">
                      <div className="preview-header"></div>
                      <div className="preview-content">
                        <div className="preview-sidebar"></div>
                        <div className="preview-main">
                          <div className="preview-text"></div>
                          <div className="preview-text"></div>
                          <div className="preview-text"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="theme-name">System</div>
                </div>
              </div>
            </SettingItem>
          </SectionContent>
        </SettingsSection>
        
        <SettingsSection>
          <SectionHeader>
            <div className="title">General</div>
            <div className="description">General application settings</div>
          </SectionHeader>
          
          <SectionContent>
            <SettingItem>
              <div className="setting-header">
                <div className="setting-label">Launch on startup</div>
                <div className="setting-control switch">
                  <input 
                    type="checkbox" 
                    id="autoLaunchOnStartup"
                    name="autoLaunchOnStartup"
                    checked={settings.autoLaunchOnStartup}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="setting-description">
                Automatically launch the application when your computer starts
              </div>
            </SettingItem>
            
            <SettingItem>
              <div className="setting-header">
                <div className="setting-label">Clear cookies on close</div>
                <div className="setting-control switch">
                  <input 
                    type="checkbox" 
                    id="clearCookiesOnClose"
                    name="clearCookiesOnClose"
                    checked={settings.clearCookiesOnClose}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="setting-description">
                Automatically clear cookies when closing browser profiles
              </div>
            </SettingItem>
            
            <SettingItem>
              <div className="setting-header">
                <div className="setting-label">Notifications</div>
                <div className="setting-control switch">
                  <input 
                    type="checkbox" 
                    id="notificationsEnabled"
                    name="notificationsEnabled"
                    checked={settings.notificationsEnabled}
                    onChange={handleInputChange}
                  />
                  <span className="slider"></span>
                </div>
              </div>
              <div className="setting-description">
                Show desktop notifications for important events
              </div>
            </SettingItem>
          </SectionContent>
        </SettingsSection>
        
        <SettingsSection>
          <SectionHeader>
            <div className="title">Browser Engine</div>
            <div className="description">Configure the browser engine settings</div>
          </SectionHeader>
          
          <SectionContent>
            <SettingItem>
              <div className="setting-header">
                <div className="setting-label">Default Browser Engine</div>
              </div>
              <div className="setting-description">
                Select the default browser engine to use for new profiles
              </div>
              <div className="setting-input">
                <select
                  id="defaultBrowserEngine"
                  name="defaultBrowserEngine"
                  value={settings.defaultBrowserEngine}
                  onChange={handleInputChange}
                >
                  <option value="chromium">Chromium</option>
                  <option value="firefox">Firefox</option>
                  <option value="webkit">WebKit (Safari)</option>
                </select>
              </div>
            </SettingItem>
            
            <SettingItem>
              <div className="setting-header">
                <div className="setting-label">Anonymization Level</div>
              </div>
              <div className="setting-description">
                Set the default level of anonymization for new browser profiles
              </div>
              <div className="radio-options">
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="anonymizationLevel" 
                    value="minimal"
                    checked={settings.anonymizationLevel === 'minimal'}
                    onChange={handleInputChange}
                  />
                  Minimal
                </label>
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="anonymizationLevel" 
                    value="balanced"
                    checked={settings.anonymizationLevel === 'balanced'}
                    onChange={handleInputChange}
                  />
                  Balanced
                </label>
                <label className="radio-option">
                  <input 
                    type="radio" 
                    name="anonymizationLevel" 
                    value="maximum"
                    checked={settings.anonymizationLevel === 'maximum'}
                    onChange={handleInputChange}
                  />
                  Maximum
                </label>
              </div>
            </SettingItem>
          </SectionContent>
        </SettingsSection>
        
        <SettingsSection>
          <SectionHeader>
            <div className="title">Privacy & Security</div>
            <div className="description">Configure privacy and security settings</div>
          </SectionHeader>
          
          <SectionContent>
            <SettingItem>
              <div className="setting-header">
                <div className="setting-label">Blocked Domains</div>
              </div>
              <div className="setting-description">
                Comma-separated list of domains to block across all profiles
              </div>
              <div className="setting-input">
                <textarea
                  id="blockedDomains"
                  name="blockedDomains"
                  value={settings.blockedDomains}
                  onChange={handleInputChange}
                  placeholder="e.g., analytics.example.com, tracker.example.com"
                  rows="3"
                ></textarea>
              </div>
            </SettingItem>
            
            <InfoBanner type="info">
              <div className="banner-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="banner-content">
                <div className="banner-title">About Privacy & Security</div>
                <div className="banner-text">
                  These settings apply globally to all browser profiles. Individual profiles can have their own specific settings configured.
                </div>
              </div>
            </InfoBanner>
          </SectionContent>
        </SettingsSection>
      </SettingsGrid>
      
      <ButtonGroup>
        <ActionButton onClick={handleResetToDefaults}>
          Reset to Defaults
        </ActionButton>
        <ActionButton primary onClick={handleSaveSettings}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save Settings
        </ActionButton>
      </ButtonGroup>
    </SettingsContainer>
  );
};

export default Settings;

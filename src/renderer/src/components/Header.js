import React from 'react';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.5rem;
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  height: 60px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
`;

const LogoIcon = styled.div`
  svg {
    width: 28px;
    height: 28px;
  }
`;

const LogoText = styled.h1`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  gap: 0.5rem;
  
  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  
  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.isConnected ? '#4ade80' : '#f87171'};
  }
`;

const Header = ({ theme, toggleTheme }) => {
  const [isConnected, setIsConnected] = React.useState(true);
  
  // Check connection status periodically
  React.useEffect(() => {
    const checkConnection = () => {
      // In a real app, we'd check actual connection status to backend
      // For now, we'll simulate being connected
      setIsConnected(navigator.onLine);
    };
    
    // Check immediately and set up interval
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <HeaderContainer>
      <Logo>
        <LogoIcon>
          <svg width="28" height="28" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" rx="128" fill="currentColor" fillOpacity="0.1"/>
            <path d="M125 140C125 131.716 131.716 125 140 125H372C380.284 125 387 131.716 387 140V372C387 380.284 380.284 387 372 387H140C131.716 387 125 380.284 125 372V140Z" stroke="var(--color-accent)" strokeWidth="16"/>
            <rect x="155" y="155" width="202" height="202" rx="8" fill="var(--color-accent)" fillOpacity="0.15"/>
            <path d="M155 283L200.5 228.5L232.5 260.5L280 203L357 283" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="196" cy="196" r="12" fill="var(--color-accent)"/>
          </svg>
        </LogoIcon>
        <LogoText>Anti-Detect Browser</LogoText>
      </Logo>
      
      <HeaderActions>
        <StatusIndicator isConnected={isConnected}>
          <span>
            <div className="status-dot"></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </StatusIndicator>
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header;

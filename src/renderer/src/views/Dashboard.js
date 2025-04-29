import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    
    .stat-title {
      font-size: 0.95rem;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
    
    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background-color: ${props => props.iconBg || 'rgba(77, 118, 253, 0.1)'};
      color: ${props => props.iconColor || 'var(--color-accent)'};
    }
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  .stat-description {
    font-size: 0.85rem;
    color: var(--color-text-secondary);
  }
`;

const SectionsGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
    
    h2 {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .section-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
`;

const ProfileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProfileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  
  .profile-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    
    .profile-icon {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      background-color: rgba(77, 118, 253, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent);
    }
    
    .profile-name {
      font-weight: 500;
    }
    
    .profile-details {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  }
  
  .profile-actions {
    display: flex;
    gap: 0.5rem;
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

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
  
  &:last-child {
    border-bottom: none;
  }
  
  .activity-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background-color: ${props => {
      switch(props.type) {
        case 'success': return 'rgba(74, 222, 128, 0.1)';
        case 'error': return 'rgba(248, 113, 113, 0.1)';
        case 'warning': return 'rgba(251, 191, 36, 0.1)';
        default: return 'rgba(77, 118, 253, 0.1)';
      }
    }};
    color: ${props => {
      switch(props.type) {
        case 'success': return '#4ade80';
        case 'error': return '#f87171';
        case 'warning': return '#fbbc24';
        default: return 'var(--color-accent)';
      }
    }};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .activity-content {
    flex: 1;
    
    .activity-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }
    
    .activity-time {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  
  svg {
    width: 48px;
    height: 48px;
    color: var(--color-text-secondary);
    opacity: 0.5;
    margin-bottom: 1rem;
  }
  
  .empty-title {
    font-weight: 500;
    margin-bottom: 0.5rem;
  }
  
  .empty-description {
    color: var(--color-text-secondary);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
`;

const RecentActivitySection = ({ activities = [] }) => {
  if (activities.length === 0) {
    return (
      <EmptyState>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="empty-title">No recent activity</div>
        <div className="empty-description">Activities will appear here as you use the application</div>
      </EmptyState>
    );
  }

  return (
    <ActivityList>
      {activities.map((activity, index) => (
        <ActivityItem key={index} type={activity.type}>
          <div className="activity-icon">
            {activity.type === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
            {activity.type === 'error' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {activity.type === 'warning' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
            {activity.type === 'info' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
          </div>
          <div className="activity-content">
            <div className="activity-title">{activity.title}</div>
            <div className="activity-time">{activity.time}</div>
          </div>
        </ActivityItem>
      ))}
    </ActivityList>
  );
};

const Dashboard = ({ profiles = [], proxies = [], workflows = [] }) => {
  // Sample recent activities - in real app, this would come from a backend call
  const recentActivities = [
    {
      type: 'success',
      title: 'Successfully launched Profile "Marketing"',
      time: '5 minutes ago'
    },
    {
      type: 'error',
      title: 'Failed to connect to proxy #5',
      time: '1 hour ago'
    },
    {
      type: 'info',
      title: 'Automation workflow completed',
      time: '3 hours ago'
    },
    {
      type: 'warning',
      title: 'Profile "Social Media" is using default fingerprint',
      time: '1 day ago'
    }
  ];

  const handleLaunchProfile = async (profileId) => {
    try {
      await window.api.launchProfile(profileId);
    } catch (error) {
      console.error('Error launching profile:', error);
    }
  };

  const renderActiveProfiles = () => {
    const activeProfiles = profiles.filter(profile => profile.active);
    
    if (activeProfiles.length === 0) {
      return (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <div className="empty-title">No active profiles</div>
          <div className="empty-description">Launch a profile to start browsing securely</div>
          <ActionButton primary>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create Profile
          </ActionButton>
        </EmptyState>
      );
    }
    
    return (
      <ProfileList>
        {activeProfiles.map(profile => (
          <ProfileItem key={profile.id}>
            <div className="profile-info">
              <div className="profile-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <div className="profile-name">{profile.name}</div>
                <div className="profile-details">Using {profile.proxy ? profile.proxy.name : 'Direct Connection'}</div>
              </div>
            </div>
            <div className="profile-actions">
              <ActionButton>Details</ActionButton>
            </div>
          </ProfileItem>
        ))}
      </ProfileList>
    );
  };

  return (
    <DashboardContainer>
      <PageHeader>
        <h1>Dashboard</h1>
        <p>Welcome to Anti-Detect Browser. Manage your profiles, proxies and automation.</p>
      </PageHeader>
      
      <StatsGrid>
        <StatCard iconBg="rgba(77, 118, 253, 0.1)" iconColor="var(--color-accent)">
          <div className="stat-header">
            <div className="stat-title">Total Profiles</div>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{profiles.length}</div>
          <div className="stat-description">{profiles.filter(p => p.active).length} currently active</div>
        </StatCard>
        
        <StatCard iconBg="rgba(74, 222, 128, 0.1)" iconColor="#4ade80">
          <div className="stat-header">
            <div className="stat-title">Proxies</div>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{proxies.length}</div>
          <div className="stat-description">{proxies.filter(p => p.status === 'working').length} working proxies</div>
        </StatCard>
        
        <StatCard iconBg="rgba(251, 191, 36, 0.1)" iconColor="#fbbc24">
          <div className="stat-header">
            <div className="stat-title">Automation</div>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            </div>
          </div>
          <div className="stat-value">{workflows.length}</div>
          <div className="stat-description">{workflows.filter(w => w.status === 'running').length} running workflows</div>
        </StatCard>
        
        <StatCard iconBg="rgba(99, 102, 241, 0.1)" iconColor="#6366f1">
          <div className="stat-header">
            <div className="stat-title">Total Sessions</div>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
          </div>
          <div className="stat-value">
            {profiles.reduce((acc, profile) => acc + (profile.sessions || 0), 0)}
          </div>
          <div className="stat-description">Across all profiles</div>
        </StatCard>
      </StatsGrid>
      
      <SectionsGrid>
        <Section>
          <div className="section-header">
            <h2>Active Profiles</h2>
            <div className="section-actions">
              <ActionButton primary>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
                New Profile
              </ActionButton>
            </div>
          </div>
          {renderActiveProfiles()}
        </Section>
        
        <Section>
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <RecentActivitySection activities={recentActivities} />
        </Section>
      </SectionsGrid>
    </DashboardContainer>
  );
};

export default Dashboard;

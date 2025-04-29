import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ProfileManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  
  h1 {
    font-size: 1.8rem;
    font-weight: 600;
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

const SearchBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  .search-input {
    flex: 1;
    position: relative;
    
    input {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background-color: var(--color-bg-secondary);
      color: var(--color-text-primary);
      font-size: 0.95rem;
      
      &::placeholder {
        color: var(--color-text-secondary);
      }
      
      &:focus {
        outline: none;
        border-color: var(--color-accent);
      }
    }
    
    svg {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-secondary);
      width: 18px;
      height: 18px;
    }
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const ProfilesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ProfileCard = styled.div`
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const ProfileHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .profile-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    background-color: ${props => props.active ? 'rgba(74, 222, 128, 0.15)' : 'rgba(77, 118, 253, 0.15)'};
    color: ${props => props.active ? '#4ade80' : 'var(--color-accent)'};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    
    svg {
      width: 24px;
      height: 24px;
    }
  }
  
  .profile-info {
    flex: 1;
    
    .profile-name {
      font-weight: 600;
      font-size: 1.1rem;
      margin-bottom: 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${props => props.active ? '#4ade80' : '#94a3b8'};
      }
    }
    
    .profile-details {
      color: var(--color-text-secondary);
      font-size: 0.85rem;
    }
  }
`;

const ProfileBody = styled.div`
  padding: 1.25rem;
  
  .profile-attributes {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.25rem;
    
    .attribute {
      .attribute-label {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        margin-bottom: 0.25rem;
      }
      
      .attribute-value {
        font-size: 0.95rem;
        font-weight: 500;
      }
    }
  }
`;

const ProfileFooter = styled.div`
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  
  .profile-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .created-at {
    font-size: 0.8rem;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background-color: var(--color-bg-secondary);
  border-radius: 10px;
  text-align: center;
  
  svg {
    width: 64px;
    height: 64px;
    color: var(--color-text-secondary);
    opacity: 0.5;
    margin-bottom: 1.5rem;
  }
  
  .empty-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .empty-description {
    color: var(--color-text-secondary);
    font-size: 1rem;
    margin-bottom: 1.5rem;
    max-width: 400px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: var(--color-bg-primary);
  border-radius: 10px;
  width: 95%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const ModalHeader = styled.div`
  padding: 1.25rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }
  
  button {
    background: transparent;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    padding: 0.25rem;
    
    &:hover {
      color: var(--color-text-primary);
    }
    
    svg {
      width: 20px;
      height: 20px;
    }
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
  max-height: 70vh;
  overflow-y: auto;
  
  .form-group {
    margin-bottom: 1.25rem;
    
    label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--color-border);
      background-color: var(--color-bg-secondary);
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
    
    .helper-text {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }
    
    .input-group {
      display: flex;
      gap: 0.5rem;
      
      input, select {
        flex: 1;
      }
    }
  }
`;

const ModalFooter = styled.div`
  padding: 1.25rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const ProfileManager = ({ profiles = [], setProfiles, proxies = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProfile, setCurrentProfile] = useState(null);
  
  // Form state for new/edit profile
  const [formData, setFormData] = useState({
    name: '',
    userAgent: '',
    proxyId: '',
    platform: 'windows',
    screenResolution: '1920x1080',
    language: 'en-US',
    timezone: 'UTC',
    webRTC: 'real',
    canvas: 'real',
    webGL: 'real',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      name: '',
      userAgent: '',
      proxyId: '',
      platform: 'windows',
      screenResolution: '1920x1080',
      language: 'en-US',
      timezone: 'UTC',
      webRTC: 'real',
      canvas: 'real',
      webGL: 'real',
      notes: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (profile) => {
    setCurrentProfile(profile);
    setFormData({
      name: profile.name || '',
      userAgent: profile.userAgent || '',
      proxyId: profile.proxyId || '',
      platform: profile.platform || 'windows',
      screenResolution: profile.screenResolution || '1920x1080',
      language: profile.language || 'en-US',
      timezone: profile.timezone || 'UTC',
      webRTC: profile.webRTC || 'real',
      canvas: profile.canvas || 'real',
      webGL: profile.webGL || 'real',
      notes: profile.notes || ''
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentProfile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && currentProfile) {
        // Update existing profile
        const updatedProfile = await window.api.updateProfile(currentProfile.id, formData);
        setProfiles(prevProfiles => 
          prevProfiles.map(profile => 
            profile.id === updatedProfile.id ? updatedProfile : profile
          )
        );
      } else {
        // Create new profile
        const newProfile = await window.api.createProfile(formData);
        setProfiles(prevProfiles => [...prevProfiles, newProfile]);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving profile:', error);
      // Handle error (show error message)
    }
  };

  const handleDeleteProfile = async (profileId) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await window.api.deleteProfile(profileId);
        setProfiles(prevProfiles => prevProfiles.filter(profile => profile.id !== profileId));
      } catch (error) {
        console.error('Error deleting profile:', error);
        // Handle error (show error message)
      }
    }
  };

  const handleLaunchProfile = async (profileId) => {
    try {
      await window.api.launchProfile(profileId);
      // The profile status will be updated via IPC events
    } catch (error) {
      console.error('Error launching profile:', error);
      // Handle error (show error message)
    }
  };

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile => 
    profile.name && profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProfileManagerContainer>
      <PageHeader>
        <h1>Browser Profiles</h1>
        <ActionButton primary onClick={openCreateModal}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          New Profile
        </ActionButton>
      </PageHeader>
      
      <SearchBar>
        <div className="search-input">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Search profiles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <FilterButton>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filter
        </FilterButton>
      </SearchBar>
      
      {filteredProfiles.length === 0 ? (
        <EmptyState>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <div className="empty-title">No profiles found</div>
          <div className="empty-description">
            {searchTerm 
              ? `No profiles match the search term "${searchTerm}"`
              : "Create your first browser profile to start browsing securely and privately"}
          </div>
          <ActionButton primary onClick={openCreateModal}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Create First Profile
          </ActionButton>
        </EmptyState>
      ) : (
        <ProfilesGrid>
          {filteredProfiles.map(profile => (
            <ProfileCard key={profile.id}>
              <ProfileHeader active={profile.active}>
                <div className="profile-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="profile-info">
                  <div className="profile-name">
                    <div className="status-indicator"></div>
                    {profile.name}
                  </div>
                  <div className="profile-details">
                    {profile.active ? 'Active' : 'Inactive'} • {profile.platform || 'Unknown platform'}
                  </div>
                </div>
              </ProfileHeader>
              
              <ProfileBody>
                <div className="profile-attributes">
                  <div className="attribute">
                    <div className="attribute-label">User Agent</div>
                    <div className="attribute-value" title={profile.userAgent}>
                      {profile.userAgent ? profile.userAgent.substring(0, 20) + '...' : 'Default'}
                    </div>
                  </div>
                  <div className="attribute">
                    <div className="attribute-label">Proxy</div>
                    <div className="attribute-value">
                      {profile.proxyId 
                        ? proxies.find(p => p.id === profile.proxyId)?.name || 'Unknown Proxy' 
                        : 'Direct Connection'}
                    </div>
                  </div>
                  <div className="attribute">
                    <div className="attribute-label">Resolution</div>
                    <div className="attribute-value">{profile.screenResolution || '1920x1080'}</div>
                  </div>
                  <div className="attribute">
                    <div className="attribute-label">Language</div>
                    <div className="attribute-value">{profile.language || 'en-US'}</div>
                  </div>
                  <div className="attribute">
                    <div className="attribute-label">WebRTC</div>
                    <div className="attribute-value">{profile.webRTC || 'Real'}</div>
                  </div>
                  <div className="attribute">
                    <div className="attribute-label">Canvas</div>
                    <div className="attribute-value">{profile.canvas || 'Real'}</div>
                  </div>
                </div>
              </ProfileBody>
              
              <ProfileFooter>
                <div className="profile-actions">
                  <ActionButton primary onClick={() => handleLaunchProfile(profile.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Launch
                  </ActionButton>
                  <ActionButton onClick={() => openEditModal(profile)}>Edit</ActionButton>
                  <ActionButton onClick={() => handleDeleteProfile(profile.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </ActionButton>
                </div>
                <div className="created-at">
                  Created: {new Date(profile.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </ProfileFooter>
            </ProfileCard>
          ))}
        </ProfilesGrid>
      )}
      
      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <h2>{isEditing ? 'Edit Profile' : 'Create New Profile'}</h2>
              <button onClick={closeModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </ModalHeader>
            
            <ModalBody>
              <div className="form-group">
                <label htmlFor="name">Profile Name</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter profile name"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="userAgent">User Agent</label>
                <input 
                  type="text" 
                  id="userAgent" 
                  name="userAgent"
                  value={formData.userAgent}
                  onChange={handleInputChange}
                  placeholder="Enter custom user agent or leave blank for default"
                />
                <div className="helper-text">Leave blank to use the browser's default user agent</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="proxyId">Proxy</label>
                <select 
                  id="proxyId" 
                  name="proxyId"
                  value={formData.proxyId}
                  onChange={handleInputChange}
                >
                  <option value="">Direct Connection (No Proxy)</option>
                  {proxies.map(proxy => (
                    <option key={proxy.id} value={proxy.id}>{proxy.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="platform">Platform</label>
                <select 
                  id="platform" 
                  name="platform"
                  value={formData.platform}
                  onChange={handleInputChange}
                >
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                  <option value="linux">Linux</option>
                  <option value="android">Android</option>
                  <option value="ios">iOS</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="screenResolution">Screen Resolution</label>
                <select 
                  id="screenResolution" 
                  name="screenResolution"
                  value={formData.screenResolution}
                  onChange={handleInputChange}
                >
                  <option value="1920x1080">1920x1080 (Full HD)</option>
                  <option value="1366x768">1366x768 (HD)</option>
                  <option value="2560x1440">2560x1440 (Quad HD)</option>
                  <option value="3840x2160">3840x2160 (4K UHD)</option>
                  <option value="1280x720">1280x720 (720p)</option>
                  <option value="1536x864">1536x864</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="language">Language</label>
                <select 
                  id="language" 
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="de-DE">German</option>
                  <option value="fr-FR">French</option>
                  <option value="es-ES">Spanish</option>
                  <option value="it-IT">Italian</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                  <option value="ru-RU">Russian</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="timezone">Timezone</label>
                <select 
                  id="timezone" 
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EDT/EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PDT/PST)</option>
                  <option value="Europe/London">Europe/London (BST/GMT)</option>
                  <option value="Europe/Paris">Europe/Paris (CEST/CET)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                  <option value="Australia/Sydney">Australia/Sydney (AEST/AEDT)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Fingerprint Protection</label>
                <div className="input-group">
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="webRTC">WebRTC</label>
                    <select 
                      id="webRTC" 
                      name="webRTC"
                      value={formData.webRTC}
                      onChange={handleInputChange}
                    >
                      <option value="real">Real</option>
                      <option value="fake">Fake</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="canvas">Canvas</label>
                    <select 
                      id="canvas" 
                      name="canvas"
                      value={formData.canvas}
                      onChange={handleInputChange}
                    >
                      <option value="real">Real</option>
                      <option value="noise">Add Noise</option>
                      <option value="block">Block</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="webGL">WebGL</label>
                    <select 
                      id="webGL" 
                      name="webGL"
                      value={formData.webGL}
                      onChange={handleInputChange}
                    >
                      <option value="real">Real</option>
                      <option value="fake">Fake</option>
                      <option value="block">Block</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea 
                  id="notes" 
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter optional notes about this profile"
                  rows="3"
                />
              </div>
            </ModalBody>
            
            <ModalFooter>
              <ActionButton onClick={closeModal}>Cancel</ActionButton>
              <ActionButton primary onClick={handleSubmit}>
                {isEditing ? 'Update Profile' : 'Create Profile'}
              </ActionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </ProfileManagerContainer>
  );
};

export default ProfileManager;

document.addEventListener('DOMContentLoaded', function() {
  // Theme toggle
  const themeSwitch = document.getElementById('theme-switch');
  const body = document.body;
  
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    themeSwitch.checked = true;
  }
  
  // Theme toggle event
  themeSwitch?.addEventListener('change', function() {
    if (this.checked) {
      body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      // Remove active class from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      
      // Add active class to clicked nav item
      this.classList.add('active');
      
      // Update view title
      const viewTitle = document.querySelector('.view-title h2');
      if (viewTitle) {
        viewTitle.textContent = this.textContent.trim();
      }
      
      // Here you would load different content based on view
      // For now, we'll just keep the profiles view
    });
  });
  
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      tabs.forEach(t => t.classList.remove('active'));
      
      // Add active class to clicked tab
      this.classList.add('active');
      
      // Here you would load tab-specific content
    });
  });
  
  // User menu toggle
  const userProfile = document.querySelector('.user-profile');
  const userMenu = document.querySelector('.user-menu');
  
  userProfile?.addEventListener('click', function(e) {
    userMenu.classList.toggle('hidden');
    e.stopPropagation();
  });
  
  // Close user menu when clicking outside
  document.addEventListener('click', function() {
    if (userMenu && !userMenu.classList.contains('hidden')) {
      userMenu.classList.add('hidden');
    }
  });
  
  // Logout functionality
  const logoutButton = document.getElementById('logout-button');
  
  logoutButton?.addEventListener('click', function() {
    // For demo, simply redirect to login page
    window.location.href = '/login.html';
  });
  
  // Profile modal
  const addProfileButton = document.getElementById('add-profile-button');
  const profileModal = document.getElementById('profile-modal');
  const closeModalButton = document.querySelector('.close-modal');
  const cancelProfileButton = document.getElementById('cancel-profile');
  const saveProfileButton = document.getElementById('save-profile');
  const profileForm = document.getElementById('profile-form');
  
  // Open profile modal
  addProfileButton?.addEventListener('click', function() {
    profileModal.classList.remove('hidden');
  });
  
  // Close profile modal
  function closeProfileModal() {
    profileModal.classList.add('hidden');
    profileForm.reset();
  }
  
  closeModalButton?.addEventListener('click', closeProfileModal);
  cancelProfileButton?.addEventListener('click', closeProfileModal);
  
  // Close modal when clicking outside
  profileModal?.addEventListener('click', function(e) {
    if (e.target === profileModal) {
      closeProfileModal();
    }
  });
  
  // Tags input
  const tagsInput = document.getElementById('profile-tags');
  const tagsContainer = document.querySelector('.tags-container');
  const tags = new Set();
  
  // Add tag when pressing Enter
  tagsInput?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const tagValue = this.value.trim();
      if (tagValue && !tags.has(tagValue)) {
        // Add tag to set
        tags.add(tagValue);
        
        // Create tag element
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
          ${tagValue}
          <span class="remove-tag">&times;</span>
        `;
        
        // Add remove event to tag
        tagElement.querySelector('.remove-tag').addEventListener('click', function() {
          tags.delete(tagValue);
          tagElement.remove();
        });
        
        // Add tag to container
        tagsContainer.appendChild(tagElement);
        
        // Clear input
        this.value = '';
      }
    }
  });
  
  // Save profile
  saveProfileButton?.addEventListener('click', function() {
    // Check if form is valid
    if (!profileForm.checkValidity()) {
      profileForm.reportValidity();
      return;
    }
    
    // Get form data
    const profileData = {
      id: Date.now().toString(),
      name: document.getElementById('profile-name').value,
      tags: Array.from(tags),
      proxyId: document.getElementById('profile-proxy').value,
      platform: document.getElementById('profile-os').value,
      browser: document.getElementById('profile-browser').value,
      language: document.getElementById('profile-language').value,
      timezone: document.getElementById('profile-timezone').value,
      notes: document.getElementById('profile-notes').value,
      active: false,
      sessions: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    // For demo, log the profile data to console
    console.log('Profile saved:', profileData);
    
    // Here you would save the profile to the server
    // For now, just close the modal
    closeProfileModal();
    
    // Show success message
    showToast('Success', 'Hồ sơ đã được tạo thành công!', 'success');
  });
  
  // Toast notification - make it globally available
  window.showToast = function(title, message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-header">
        <strong>${title}</strong>
        <button class="close-toast">&times;</button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    
    // Add toast to body
    document.body.appendChild(toast);
    
    // Add animation class
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Auto remove toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 5000);
    
    // Close toast when clicking the close button
    toast.querySelector('.close-toast').addEventListener('click', function() {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    });
  }
  
  // Add toast styles
  const style = document.createElement('style');
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background-color: white;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(100px);
      opacity: 0;
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .toast.show {
      transform: translateY(0);
      opacity: 1;
    }
    
    .toast-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .toast-body {
      font-size: 14px;
    }
    
    .close-toast {
      background: none;
      border: none;
      font-size: 18px;
      cursor: pointer;
      color: #64748b;
    }
    
    .toast-info {
      border-left: 4px solid #3b82f6;
    }
    
    .toast-success {
      border-left: 4px solid #10b981;
    }
    
    .toast-warning {
      border-left: 4px solid #f59e0b;
    }
    
    .toast-error {
      border-left: 4px solid #ef4444;
    }
  `;
  
  document.head.appendChild(style);
  
  // Mock data loading functionality
  function loadProfiles() {
    // This would normally fetch from an API
    // For now, just return empty array
    return [];
  }
  
  function renderProfiles() {
    const profiles = loadProfiles();
    const tableContainer = document.querySelector('.profiles-table');
    const noData = document.querySelector('.no-data');
    
    if (profiles.length === 0) {
      // Show no data message
      noData.style.display = 'block';
      return;
    }
    
    // Hide no data message
    noData.style.display = 'none';
    
    // For demo purposes, we won't render any profiles
    // This would normally create rows for each profile
  }
  
  // Initial render
  renderProfiles();
});
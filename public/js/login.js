document.addEventListener('DOMContentLoaded', function() {
  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Function to switch tabs
  function switchTab(tabId) {
    // Hide all tab contents
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // Deactivate all tab buttons
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    
    // Show selected tab content and activate button
    document.getElementById(tabId + '-tab').classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
  }
  
  // Add click event to tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabId = button.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  // Tab navigation links
  document.getElementById('go-to-register')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('register');
  });
  
  document.getElementById('go-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('login');
  });
  
  document.getElementById('back-to-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('login');
  });
  
  document.querySelector('.forgot-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab('forgot');
  });
  
  // Toggle password visibility
  const toggleButtons = document.querySelectorAll('.toggle-password');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const passwordField = button.parentElement.querySelector('input');
      const type = passwordField.getAttribute('type');
      
      passwordField.setAttribute(
        'type',
        type === 'password' ? 'text' : 'password'
      );
      
      // Update icon (assuming we have two states of the icon)
      const img = button.querySelector('img');
      if (type === 'password') {
        img.setAttribute('src', 'images/eye-slash.svg');
        img.setAttribute('alt', 'Hide password');
      } else {
        img.setAttribute('src', 'images/eye.svg');
        img.setAttribute('alt', 'Show password');
      }
    });
  });
  
  // Form submissions
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const forgotForm = document.getElementById('forgot-form');
  
  loginForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // For demo purposes, just redirect to the main app with loggedIn flag
    console.log('Login attempt:', { email, password });
    window.location.href = '/?loggedIn=true';
  });
  
  registerForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;
    const referralCode = document.getElementById('register-code').value;
    
    // Password validation
    if (password !== confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    
    // For demo purposes
    console.log('Registration attempt:', { name, email, phone, password, referralCode });
    alert('Đăng ký thành công! Vui lòng đăng nhập.');
    switchTab('login');
  });
  
  forgotForm?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    
    // For demo purposes
    console.log('Password reset request for:', email);
    alert('Đã gửi hướng dẫn đặt lại mật khẩu đến email của bạn!');
    switchTab('login');
  });
});
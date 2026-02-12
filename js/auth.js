const Auth = {
  init() {
    this.createDefaultAdmin();
    this.checkAuthStatus();
  },

  createDefaultAdmin() {
    let users = Utils.getFromLocalStorage('users') || [];
    const adminExists = users.find(u => u.email === 'admin@fashionhub.com');
    
    if (!adminExists) {
      const defaultAdmin = {
        id: 'admin-001',
        name: 'Admin',
        email: 'admin@fashionhub.com',
        password: 'Admin@123',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z'
      };
      users.push(defaultAdmin);
      Utils.setToLocalStorage('users', users);
    }
  },

  register(name, email, password) {
    if (!name || !email || !password) {
      Utils.showToast('All fields are required', 'error');
      return false;
    }

    if (!Utils.validateEmail(email)) {
      Utils.showToast('Please enter a valid email', 'error');
      return false;
    }

    if (!Utils.validatePassword(password)) {
      Utils.showToast('Password must be at least 6 characters', 'error');
      return false;
    }

    let users = Utils.getFromLocalStorage('users') || [];
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      Utils.showToast('Email already registered', 'error');
      return false;
    }

    const newUser = {
      id: Utils.generateUniqueId('user'),
      name,
      email,
      password,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    Utils.setToLocalStorage('users', users);

    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    Utils.setToLocalStorage('currentUser', userWithoutPassword);

    Utils.showToast('Registration successful!', 'success');
    return true;
  },

  login(email, password, redirectToAdmin = false) {
    if (!email || !password) {
      Utils.showToast('Email and password are required', 'error');
      return false;
    }

    const users = Utils.getFromLocalStorage('users') || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      Utils.showToast('Invalid email or password', 'error');
      return false;
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    Utils.setToLocalStorage('currentUser', userWithoutPassword);

    Utils.showToast('Login successful!', 'success');
    
    if (redirectToAdmin && user.role === 'admin') {
      setTimeout(() => {
        window.location.href = '../admin/index.html';
      }, 1000);
    }
    
    return true;
  },

  logout() {
    Utils.removeFromLocalStorage('currentUser');
    Utils.showToast('Logged out successfully', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  },

  getCurrentUser() {
    return Utils.getFromLocalStorage('currentUser');
  },

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  },

  requireAuth(redirectUrl = 'login.html') {
    if (!this.isLoggedIn()) {
      Utils.showToast('Please login to continue', 'error');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
      return false;
    }
    return true;
  },

  isAdmin() {
    const currentUser = this.getCurrentUser();
    return currentUser && currentUser.role === 'admin';
  },

  requireAdmin(redirectUrl = '../login.html') {
    if (!this.isLoggedIn()) {
      Utils.showToast('Please login to continue', 'error');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
      return false;
    }

    if (!this.isAdmin()) {
      Utils.showToast('Access denied. Admin only.', 'error');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1000);
      return false;
    }

    return true;
  },

  checkAuthStatus() {
    const currentUser = this.getCurrentUser();
    const authLinks = document.querySelectorAll('[data-auth-link]');
    const userNameElements = document.querySelectorAll('[data-user-name]');

    if (currentUser) {
      authLinks.forEach(link => {
        if (link.dataset.authLink === 'logout') {
          link.style.display = 'inline-block';
        } else if (link.dataset.authLink === 'login') {
          link.style.display = 'none';
        }
      });

      userNameElements.forEach(el => {
        el.textContent = currentUser.name;
        el.style.display = 'inline-block';
      });
    } else {
      authLinks.forEach(link => {
        if (link.dataset.authLink === 'logout') {
          link.style.display = 'none';
        } else if (link.dataset.authLink === 'login') {
          link.style.display = 'inline-block';
        }
      });

      userNameElements.forEach(el => {
        el.style.display = 'none';
      });
    }
  }
};

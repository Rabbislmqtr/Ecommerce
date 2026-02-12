const AdminAuth = {
  init() {
    if (!Auth.requireAdmin()) {
      return false;
    }
    return true;
  },

  checkAdminAccess() {
    return Auth.isAdmin();
  },

  redirectIfNotAdmin() {
    if (!this.checkAdminAccess()) {
      window.location.href = '../login.html';
      return false;
    }
    return true;
  }
};

const AdminApp = {
  init() {
    if (!AdminAuth.init()) {
      return;
    }

    this.setupSidebar();
    this.setupLogout();
    this.updateAdminInfo();
  },

  setupSidebar() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.admin-nav a');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPage === href) {
        link.classList.add('active');
      }
    });
  },

  setupLogout() {
    const logoutBtn = document.getElementById('admin-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
        window.location.href = '../index.html';
      });
    }
  },

  updateAdminInfo() {
    const currentUser = Auth.getCurrentUser();
    const adminNameEl = document.getElementById('admin-name');
    if (adminNameEl && currentUser) {
      adminNameEl.textContent = currentUser.name;
    }
  },

  toggleSidebar() {
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});

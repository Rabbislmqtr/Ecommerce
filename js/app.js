document.addEventListener('DOMContentLoaded', async () => {
  Auth.init();
  Cart.init();
  Wishlist.init();

  const page = getPageName();

  switch (page) {
    case 'index.html':
      await initHomePage();
      break;
    case 'products.html':
      await initProductsPage();
      break;
    case 'product-detail.html':
      await initProductDetailPage();
      break;
    case 'cart.html':
      initCartPage();
      break;
    case 'checkout.html':
      Checkout.init();
      break;
    case 'login.html':
      initLoginPage();
      break;
    case 'register.html':
      initRegisterPage();
      break;
    case 'wishlist.html':
      await initWishlistPage();
      break;
    case 'order-confirmation.html':
      Checkout.renderOrderConfirmation();
      break;
  }

  setupLogoutButtons();
});

function getPageName() {
  const path = window.location.pathname;
  const pageName = path.substring(path.lastIndexOf('/') + 1);
  return pageName || 'index.html';
}

async function initHomePage() {
  await Products.loadProducts();
  Products.renderFeaturedProducts(8);
}

async function initProductsPage() {
  await Products.loadProducts();
  Products.renderProductGrid(Products.allProducts);
  Filters.init();
}

async function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    Utils.showToast('Product not found', 'error');
    setTimeout(() => window.location.href = 'products.html', 1500);
    return;
  }

  await Products.loadProducts();
  Products.renderProductDetail(productId);
}

function initCartPage() {
  Cart.renderCart();
}

async function initWishlistPage() {
  await Products.loadProducts();
  Wishlist.renderWishlist();
}

function initLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (Auth.login(email, password, true)) {
      const user = Auth.getCurrentUser();
      setTimeout(() => {
        if (user && user.role === 'admin') {
          window.location.href = 'admin/index.html';
        } else {
          const urlParams = new URLSearchParams(window.location.search);
          const redirect = urlParams.get('redirect') || 'index.html';
          window.location.href = redirect;
        }
      }, 1000);
    }
  });

  const registerLink = document.getElementById('go-to-register');
  if (registerLink) {
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'register.html';
    });
  }
}

function initRegisterPage() {
  const registerForm = document.getElementById('register-form');
  if (!registerForm) return;

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;

    if (password !== confirmPassword) {
      Utils.showToast('Passwords do not match', 'error');
      return;
    }

    if (Auth.register(name, email, password)) {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    }
  });

  const loginLink = document.getElementById('go-to-login');
  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'login.html';
    });
  }
}

function setupLogoutButtons() {
  const logoutButtons = document.querySelectorAll('[data-auth-link="logout"]');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      Auth.logout();
    });
  });
}

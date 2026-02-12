const Wishlist = {
  items: [],

  init() {
    this.loadWishlist();
    this.updateWishlistCount();
  },

  getStorageKey() {
    const user = Auth.getCurrentUser();
    return user ? `wishlist_${user.id}` : 'wishlist_guest';
  },

  loadWishlist() {
    this.items = Utils.getFromLocalStorage(this.getStorageKey()) || [];
  },

  saveWishlist() {
    Utils.setToLocalStorage(this.getStorageKey(), this.items);
    this.updateWishlistCount();
  },

  toggle(productId) {
    if (this.isInWishlist(productId)) {
      this.removeItem(productId);
    } else {
      this.addItem(productId);
    }
  },

  addItem(productId) {
    if (!this.items.includes(productId)) {
      this.items.push(productId);
      this.saveWishlist();
      Utils.showToast('Added to wishlist!', 'success');
      this.updateHeartIcons(productId, true);
    }
  },

  removeItem(productId) {
    this.items = this.items.filter(id => id !== productId);
    this.saveWishlist();
    Utils.showToast('Removed from wishlist', 'success');
    this.updateHeartIcons(productId, false);
    
    if (window.location.pathname.includes('wishlist.html')) {
      this.renderWishlist();
    }
  },

  isInWishlist(productId) {
    return this.items.includes(productId);
  },

  updateHeartIcons(productId, isActive) {
    const heartIcons = document.querySelectorAll(`[onclick*="Wishlist.toggle('${productId}')"] .heart-icon`);
    heartIcons.forEach(icon => {
      if (isActive) {
        icon.classList.add('active');
      } else {
        icon.classList.remove('active');
      }
    });
  },

  updateWishlistCount() {
    const wishlistCountElements = document.querySelectorAll('[data-wishlist-count]');
    const count = this.items.length;
    
    wishlistCountElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });
  },

  async renderWishlist() {
    const wishlistContainer = document.getElementById('wishlist-items');
    if (!wishlistContainer) return;

    if (this.items.length === 0) {
      wishlistContainer.innerHTML = `
        <div class="empty-wishlist">
          <h2>Your wishlist is empty</h2>
          <p>Start adding items you love to your wishlist</p>
          <a href="products.html" class="btn btn-primary">Shop Now</a>
        </div>
      `;
      return;
    }

    if (Products.allProducts.length === 0) {
      await Products.loadProducts();
    }

    const wishlistProducts = this.items
      .map(id => Products.getProductById(id))
      .filter(product => product !== undefined);

    wishlistContainer.innerHTML = `
      <div class="wishlist-grid">
        ${wishlistProducts.map(product => `
          <div class="wishlist-item">
            <div class="product-card">
              <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <button class="remove-wishlist-btn" onclick="Wishlist.removeItem('${product.id}')" aria-label="Remove from wishlist">
                  ×
                </button>
              </div>
              <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-category">${Products.formatCategory(product.category)}</p>
                <p class="product-price">${Utils.formatCurrency(product.price)}</p>
                <div class="wishlist-actions">
                  <a href="product-detail.html?id=${product.id}" class="btn btn-secondary">View Details</a>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  moveToCart(productId) {
    const product = Products.getProductById(productId);
    if (product && product.sizes.length > 0 && product.colors.length > 0) {
      window.location.href = `product-detail.html?id=${productId}`;
    }
  }
};

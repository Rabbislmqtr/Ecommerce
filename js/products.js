const Products = {
  allProducts: [],
  currentProduct: null,

  async loadProducts() {
    let products = Utils.getFromLocalStorage('products');
    
    if (!products || products.length === 0) {
      try {
        const response = await fetch('data/products.json');
        products = await response.json();
        
        products = products.map(p => ({
          ...p,
          stock: p.stock || 100,
          sku: p.sku || `SKU${p.id.replace('prod', '')}`,
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString()
        }));
        
        Utils.setToLocalStorage('products', products);
      } catch (error) {
        console.error('Error loading products:', error);
        Utils.showToast('Error loading products', 'error');
        return [];
      }
    }
    
    this.allProducts = products;
    return this.allProducts;
  },

  saveProducts() {
    Utils.setToLocalStorage('products', this.allProducts);
  },

  addProduct(product) {
    product.id = Utils.generateUniqueId('prod');
    product.createdAt = new Date().toISOString();
    product.updatedAt = new Date().toISOString();
    this.allProducts.push(product);
    this.saveProducts();
    return product;
  },

  updateProduct(id, updates) {
    const index = this.allProducts.findIndex(p => p.id === id);
    if (index > -1) {
      this.allProducts[index] = {
        ...this.allProducts[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveProducts();
      return this.allProducts[index];
    }
    return null;
  },

  deleteProduct(id) {
    this.allProducts = this.allProducts.filter(p => p.id !== id);
    this.saveProducts();
  },

  getProductById(id) {
    return this.allProducts.find(p => p.id === id);
  },

  renderProductGrid(products, containerId = 'product-grid') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!products || products.length === 0) {
      container.innerHTML = '<div class="no-products"><p>No products found</p></div>';
      return;
    }

    container.innerHTML = products.map(product => `
      <div class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrapper">
          <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
          <button class="wishlist-btn" onclick="Wishlist.toggle('${product.id}')" aria-label="Add to wishlist">
            <span class="heart-icon ${Wishlist.isInWishlist(product.id) ? 'active' : ''}">♥</span>
          </button>
        </div>
        <div class="product-info">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-category">${this.formatCategory(product.category)}</p>
          <p class="product-price">${Utils.formatCurrency(product.price)}</p>
          <a href="product-detail.html?id=${product.id}" class="btn btn-primary">View Details</a>
        </div>
      </div>
    `).join('');
  },

  renderFeaturedProducts(limit = 8) {
    const featuredProducts = this.allProducts.slice(0, limit);
    this.renderProductGrid(featuredProducts, 'featured-products');
  },

  renderProductDetail(productId) {
    const product = this.getProductById(productId);
    if (!product) {
      Utils.showToast('Product not found', 'error');
      setTimeout(() => window.location.href = 'products.html', 1500);
      return;
    }

    this.currentProduct = product;

    const productDetail = document.getElementById('product-detail');
    if (!productDetail) return;

    productDetail.innerHTML = `
      <div class="product-detail-container">
        <div class="product-images">
          <img src="${product.image}" alt="${product.name}" class="main-image" id="main-product-image">
          <div class="thumbnail-images">
            ${product.images.map((img, index) => `
              <img src="${img}" alt="${product.name} ${index + 1}" 
                   class="thumbnail ${index === 0 ? 'active' : ''}" 
                   onclick="Products.changeMainImage('${img}')">
            `).join('')}
          </div>
        </div>
        <div class="product-details-info">
          <h1 class="product-title">${product.name}</h1>
          <p class="product-category-tag">${this.formatCategory(product.category)}</p>
          <p class="product-price-large">${Utils.formatCurrency(product.price)}</p>
          <p class="product-description">${product.description}</p>
          
          <div class="product-options">
            <div class="option-group">
              <label>Select Size:</label>
              <div class="size-options" id="size-options">
                ${product.sizes.map(size => `
                  <button class="size-btn" data-size="${size}" onclick="Products.selectSize('${size}')">${size}</button>
                `).join('')}
              </div>
              <span class="error-message" id="size-error"></span>
            </div>
            
            <div class="option-group">
              <label>Select Color:</label>
              <div class="color-options" id="color-options">
                ${product.colors.map(color => `
                  <button class="color-btn" data-color="${color}" onclick="Products.selectColor('${color}')" 
                          title="${color}">
                    <span class="color-swatch" style="background-color: ${this.getColorCode(color)}"></span>
                    <span class="color-name">${color}</span>
                  </button>
                `).join('')}
              </div>
              <span class="error-message" id="color-error"></span>
            </div>

            <div class="option-group">
              <label>Quantity:</label>
              <div class="quantity-selector">
                <button onclick="Products.decrementQuantity()" class="qty-btn">-</button>
                <input type="number" id="quantity" value="1" min="1" max="10" readonly>
                <button onclick="Products.incrementQuantity()" class="qty-btn">+</button>
              </div>
            </div>
          </div>

          <div class="product-actions">
            <button class="btn btn-primary btn-large" onclick="Products.addToCartFromDetail()">
              Add to Cart
            </button>
            <button class="btn btn-secondary btn-large" onclick="Wishlist.toggle('${product.id}')">
              <span class="heart-icon ${Wishlist.isInWishlist(product.id) ? 'active' : ''}">♥</span>
              Add to Wishlist
            </button>
          </div>

          <div class="product-stock">
            ${product.inStock ? '<span class="in-stock">✓ In Stock</span>' : '<span class="out-of-stock">Out of Stock</span>'}
          </div>
        </div>
      </div>
    `;
  },

  changeMainImage(imageUrl) {
    const mainImage = document.getElementById('main-product-image');
    if (mainImage) {
      mainImage.src = imageUrl;
    }

    document.querySelectorAll('.thumbnail').forEach(thumb => {
      thumb.classList.remove('active');
    });
    event.target.classList.add('active');
  },

  selectSize(size) {
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    document.getElementById('size-error').textContent = '';
  },

  selectColor(color) {
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    event.target.closest('.color-btn').classList.add('selected');
    document.getElementById('color-error').textContent = '';
  },

  incrementQuantity() {
    const qtyInput = document.getElementById('quantity');
    if (qtyInput && parseInt(qtyInput.value) < 10) {
      qtyInput.value = parseInt(qtyInput.value) + 1;
    }
  },

  decrementQuantity() {
    const qtyInput = document.getElementById('quantity');
    if (qtyInput && parseInt(qtyInput.value) > 1) {
      qtyInput.value = parseInt(qtyInput.value) - 1;
    }
  },

  addToCartFromDetail() {
    const selectedSize = document.querySelector('.size-btn.selected');
    const selectedColor = document.querySelector('.color-btn.selected');
    const quantity = parseInt(document.getElementById('quantity').value);

    let isValid = true;

    if (!selectedSize) {
      document.getElementById('size-error').textContent = 'Please select a size';
      isValid = false;
    }

    if (!selectedColor) {
      document.getElementById('color-error').textContent = 'Please select a color';
      isValid = false;
    }

    if (!isValid) return;

    const size = selectedSize.dataset.size;
    const color = selectedColor.dataset.color;

    Cart.addItem(this.currentProduct, size, color, quantity);
  },

  formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
  },

  getColorCode(colorName) {
    const colorMap = {
      'Red': '#DC143C',
      'Blue': '#4169E1',
      'White': '#FFFFFF',
      'Black': '#000000',
      'Navy': '#000080',
      'Burgundy': '#800020',
      'Gray': '#808080',
      'Ivory': '#FFFFF0',
      'Pink': '#FFC0CB',
      'Beige': '#F5F5DC',
      'Camel': '#C19A6B',
      'Green': '#228B22',
      'Emerald': '#50C878',
      'Olive': '#808000',
      'Champagne': '#F7E7CE',
      'Gold': '#FFD700',
      'Silver': '#C0C0C0',
      'Rose Gold': '#B76E79',
      'Brown': '#8B4513',
      'Tan': '#D2B48C',
      'Light Blue': '#ADD8E6',
      'Dark Blue': '#00008B',
      'Cream': '#FFFDD0',
      'Tortoise': '#8B4513',
      'Natural': '#D4C5A9',
      'Floral': 'linear-gradient(45deg, #FF6B9D, #C44569)',
      'Geometric': 'linear-gradient(45deg, #4834DF, #341F97)',
      'Solid': '#808080',
      'Navy/White': 'linear-gradient(90deg, #000080 50%, #FFFFFF 50%)',
      'Black/White': 'linear-gradient(90deg, #000000 50%, #FFFFFF 50%)',
      'Red/White': 'linear-gradient(90deg, #DC143C 50%, #FFFFFF 50%)'
    };
    return colorMap[colorName] || '#CCCCCC';
  }
};

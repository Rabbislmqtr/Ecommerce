const Cart = {
  items: [],

  init() {
    this.loadCart();
    this.updateCartCount();
  },

  loadCart() {
    this.items = Utils.getFromLocalStorage('cart') || [];
  },

  saveCart() {
    Utils.setToLocalStorage('cart', this.items);
    this.updateCartCount();
  },

  addItem(product, size, color, quantity = 1) {
    if (!product || !size || !color) {
      Utils.showToast('Please select size and color', 'error');
      return false;
    }

    const existingItemIndex = this.items.findIndex(
      item => item.productId === product.id && item.size === size && item.color === color
    );

    if (existingItemIndex > -1) {
      this.items[existingItemIndex].quantity += quantity;
      Utils.showToast('Cart updated!', 'success');
    } else {
      const cartItem = {
        productId: product.id,
        name: product.name,
        price: product.price,
        size,
        color,
        quantity,
        image: product.image
      };
      this.items.push(cartItem);
      Utils.showToast('Added to cart!', 'success');
    }

    this.saveCart();
    return true;
  },

  removeItem(productId, size, color) {
    this.items = this.items.filter(
      item => !(item.productId === productId && item.size === size && item.color === color)
    );
    this.saveCart();
    this.renderCart();
    Utils.showToast('Item removed from cart', 'success');
  },

  updateQuantity(productId, size, color, newQuantity) {
    const item = this.items.find(
      item => item.productId === productId && item.size === size && item.color === color
    );

    if (item) {
      if (newQuantity <= 0) {
        this.removeItem(productId, size, color);
      } else if (newQuantity <= 10) {
        item.quantity = newQuantity;
        this.saveCart();
        this.renderCart();
      }
    }
  },

  getTotal() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  },

  updateCartCount() {
    const cartCountElements = document.querySelectorAll('[data-cart-count]');
    const count = this.getItemCount();
    
    cartCountElements.forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });
  },

  renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const cartSummary = document.getElementById('cart-summary');

    if (!cartContainer) return;

    if (this.items.length === 0) {
      cartContainer.innerHTML = `
        <div class="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Start shopping to add items to your cart</p>
          <a href="products.html" class="btn btn-primary">Shop Now</a>
        </div>
      `;
      if (cartSummary) {
        cartSummary.style.display = 'none';
      }
      return;
    }

    if (cartSummary) {
      cartSummary.style.display = 'block';
    }

    cartContainer.innerHTML = `
      <div class="cart-table">
        <div class="cart-table-header">
          <div class="cart-col-product">Product</div>
          <div class="cart-col-price">Price</div>
          <div class="cart-col-quantity">Quantity</div>
          <div class="cart-col-total">Total</div>
          <div class="cart-col-action">Action</div>
        </div>
        ${this.items.map(item => `
          <div class="cart-item" data-product-id="${item.productId}" data-size="${item.size}" data-color="${item.color}">
            <div class="cart-col-product">
              <img src="${item.image}" alt="${item.name}" class="cart-item-image">
              <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-meta">Size: ${item.size} | Color: ${item.color}</p>
              </div>
            </div>
            <div class="cart-col-price">${Utils.formatCurrency(item.price)}</div>
            <div class="cart-col-quantity">
              <div class="quantity-control">
                <button onclick="Cart.updateQuantity('${item.productId}', '${item.size}', '${item.color}', ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="Cart.updateQuantity('${item.productId}', '${item.size}', '${item.color}', ${item.quantity + 1})">+</button>
              </div>
            </div>
            <div class="cart-col-total">${Utils.formatCurrency(item.price * item.quantity)}</div>
            <div class="cart-col-action">
              <button class="btn-remove" onclick="Cart.removeItem('${item.productId}', '${item.size}', '${item.color}')">Remove</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    this.renderCartSummary();
  },

  renderCartSummary() {
    const summaryContainer = document.getElementById('cart-summary');
    if (!summaryContainer) return;

    const subtotal = this.getTotal();
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    summaryContainer.innerHTML = `
      <h3>Order Summary</h3>
      <div class="summary-row">
        <span>Subtotal:</span>
        <span>${Utils.formatCurrency(subtotal)}</span>
      </div>
      <div class="summary-row">
        <span>Tax (8%):</span>
        <span>${Utils.formatCurrency(tax)}</span>
      </div>
      <div class="summary-row summary-total">
        <span>Total:</span>
        <span>${Utils.formatCurrency(total)}</span>
      </div>
      <a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>
      <a href="products.html" class="btn btn-secondary btn-block">Continue Shopping</a>
    `;
  },

  clearCart() {
    this.items = [];
    this.saveCart();
  },

  isEmpty() {
    return this.items.length === 0;
  }
};

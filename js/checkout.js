const Checkout = {
  init() {
    if (!Auth.requireAuth()) {
      return;
    }

    if (Cart.isEmpty()) {
      Utils.showToast('Your cart is empty', 'error');
      setTimeout(() => window.location.href = 'products.html', 1500);
      return;
    }

    this.renderOrderSummary();
    this.setupFormValidation();
    this.prefillUserData();
  },

  prefillUserData() {
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
      const nameInput = document.getElementById('checkout-name');
      const emailInput = document.getElementById('checkout-email');
      
      if (nameInput) nameInput.value = currentUser.name;
      if (emailInput) emailInput.value = currentUser.email;
    }
  },

  renderOrderSummary() {
    const summaryContainer = document.getElementById('checkout-order-summary');
    if (!summaryContainer) return;

    const cartItems = Cart.items;
    const subtotal = Cart.getTotal();
    const tax = subtotal * 0.08;
    const shipping = 10.00;
    const total = subtotal + tax + shipping;

    summaryContainer.innerHTML = `
      <h3>Order Summary</h3>
      <div class="checkout-items">
        ${cartItems.map(item => `
          <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}" class="checkout-item-image">
            <div class="checkout-item-info">
              <h4>${item.name}</h4>
              <p>Size: ${item.size} | Color: ${item.color}</p>
              <p>Qty: ${item.quantity} × ${Utils.formatCurrency(item.price)}</p>
            </div>
            <div class="checkout-item-total">
              ${Utils.formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="checkout-summary-totals">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${Utils.formatCurrency(subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Tax (8%):</span>
          <span>${Utils.formatCurrency(tax)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${Utils.formatCurrency(shipping)}</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total:</span>
          <span>${Utils.formatCurrency(total)}</span>
        </div>
      </div>
    `;
  },

  setupFormValidation() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleCheckoutSubmit();
    });
  },

  handleCheckoutSubmit() {
    const formData = {
      name: document.getElementById('checkout-name').value.trim(),
      email: document.getElementById('checkout-email').value.trim(),
      phone: document.getElementById('checkout-phone').value.trim(),
      address: document.getElementById('checkout-address').value.trim(),
      city: document.getElementById('checkout-city').value.trim(),
      state: document.getElementById('checkout-state').value.trim(),
      zip: document.getElementById('checkout-zip').value.trim()
    };

    if (!this.validateForm(formData)) {
      return;
    }

    this.createOrder(formData);
  },

  validateForm(formData) {
    let isValid = true;
    const errors = {};

    if (!formData.name) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (!formData.email || !Utils.validateEmail(formData.email)) {
      errors.email = 'Valid email is required';
      isValid = false;
    }

    if (!formData.phone || !Utils.validatePhone(formData.phone)) {
      errors.phone = 'Valid 10-digit phone number is required';
      isValid = false;
    }

    if (!formData.address) {
      errors.address = 'Address is required';
      isValid = false;
    }

    if (!formData.city) {
      errors.city = 'City is required';
      isValid = false;
    }

    if (!formData.state) {
      errors.state = 'State is required';
      isValid = false;
    }

    if (!formData.zip || !Utils.validateZipCode(formData.zip)) {
      errors.zip = 'Valid zip code is required';
      isValid = false;
    }

    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');

    Object.keys(errors).forEach(field => {
      const errorEl = document.getElementById(`${field}-error`);
      if (errorEl) {
        errorEl.textContent = errors[field];
      }
    });

    if (!isValid) {
      Utils.showToast('Please fix the form errors', 'error');
    }

    return isValid;
  },

  createOrder(formData) {
    const currentUser = Auth.getCurrentUser();
    const cartItems = Cart.items;
    const subtotal = Cart.getTotal();
    const tax = subtotal * 0.08;
    const shipping = 10.00;
    const total = subtotal + tax + shipping;

    const order = {
      orderId: Utils.generateUniqueId('ORD'),
      userId: currentUser ? currentUser.email : 'guest',
      userName: formData.name,
      items: cartItems,
      subtotal: subtotal,
      tax: tax,
      shipping: shipping,
      total: total,
      shippingAddress: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip: formData.zip
      },
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    let orders = Utils.getFromLocalStorage('orders') || [];
    orders.push(order);
    Utils.setToLocalStorage('orders', orders);

    this.simulateEmailNotification(order);

    Cart.clearCart();

    Utils.setToLocalStorage('lastOrder', order);

    Utils.showToast('Order placed successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'order-confirmation.html';
    }, 1000);
  },

  simulateEmailNotification(order) {
    console.log('====================================');
    console.log('EMAIL NOTIFICATION (Simulated)');
    console.log('====================================');
    console.log('To:', order.shippingAddress.email);
    console.log('Subject: Order Confirmation -', order.orderId);
    console.log('');
    console.log('Dear', order.shippingAddress.name + ',');
    console.log('');
    console.log('Thank you for your order!');
    console.log('');
    console.log('Order Details:');
    console.log('Order ID:', order.orderId);
    console.log('Order Date:', Utils.formatDate(order.orderDate));
    console.log('');
    console.log('Items:');
    order.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
      console.log(`   Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}`);
      console.log(`   Price: ${Utils.formatCurrency(item.price * item.quantity)}`);
    });
    console.log('');
    console.log('Subtotal:', Utils.formatCurrency(order.subtotal));
    console.log('Tax:', Utils.formatCurrency(order.tax));
    console.log('Shipping:', Utils.formatCurrency(order.shipping));
    console.log('Total:', Utils.formatCurrency(order.total));
    console.log('');
    console.log('Shipping Address:');
    console.log(order.shippingAddress.address);
    console.log(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}`);
    console.log('Phone:', order.shippingAddress.phone);
    console.log('');
    console.log('Your order will be processed manually.');
    console.log('We will contact you shortly for payment details.');
    console.log('');
    console.log('Thank you for shopping with us!');
    console.log('====================================');
  },

  renderOrderConfirmation() {
    const lastOrder = Utils.getFromLocalStorage('lastOrder');
    if (!lastOrder) {
      window.location.href = 'index.html';
      return;
    }

    const confirmationContainer = document.getElementById('order-confirmation-details');
    if (!confirmationContainer) return;

    confirmationContainer.innerHTML = `
      <div class="confirmation-header">
        <div class="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p class="order-id">Order ID: <strong>${lastOrder.orderId}</strong></p>
        <p class="order-date">${Utils.formatDate(lastOrder.orderDate)}</p>
      </div>

      <div class="confirmation-message">
        <p>Thank you for your order, <strong>${lastOrder.userName}</strong>!</p>
        <p>We've received your order and will contact you shortly for payment details.</p>
        <p>A confirmation email has been sent to <strong>${lastOrder.shippingAddress.email}</strong></p>
      </div>

      <div class="order-summary-section">
        <h2>Order Summary</h2>
        <div class="order-items">
          ${lastOrder.items.map(item => `
            <div class="order-item">
              <img src="${item.image}" alt="${item.name}" class="order-item-image">
              <div class="order-item-details">
                <h3>${item.name}</h3>
                <p>Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</p>
                <p class="item-price">${Utils.formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="order-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${Utils.formatCurrency(lastOrder.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Tax:</span>
            <span>${Utils.formatCurrency(lastOrder.tax)}</span>
          </div>
          <div class="total-row">
            <span>Shipping:</span>
            <span>${Utils.formatCurrency(lastOrder.shipping)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${Utils.formatCurrency(lastOrder.total)}</span>
          </div>
        </div>
      </div>

      <div class="shipping-info-section">
        <h2>Shipping Address</h2>
        <p><strong>${lastOrder.shippingAddress.name}</strong></p>
        <p>${lastOrder.shippingAddress.address}</p>
        <p>${lastOrder.shippingAddress.city}, ${lastOrder.shippingAddress.state} ${lastOrder.shippingAddress.zip}</p>
        <p>Phone: ${Utils.formatPhoneNumber(lastOrder.shippingAddress.phone)}</p>
        <p>Email: ${lastOrder.shippingAddress.email}</p>
      </div>

      <div class="confirmation-actions">
        <a href="products.html" class="btn btn-primary">Continue Shopping</a>
        <a href="index.html" class="btn btn-secondary">Back to Home</a>
      </div>
    `;
  }
};

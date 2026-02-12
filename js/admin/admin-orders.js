const AdminOrders = {
  orders: [],
  filteredOrders: [],

  init() {
    this.loadOrders();
    this.renderOrderTable();
    this.setupFilters();
  },

  loadOrders() {
    this.orders = Utils.getFromLocalStorage('orders') || [];
    this.orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    this.filteredOrders = [...this.orders];
  },

  renderOrderTable() {
    const tbody = document.getElementById('orders-table-body');
    if (!tbody) return;

    if (this.filteredOrders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No orders found</td></tr>';
      return;
    }

    tbody.innerHTML = this.filteredOrders.map(order => `
      <tr onclick="AdminOrders.viewOrderDetail('${order.orderId}')" style="cursor: pointer;">
        <td>${order.orderId}</td>
        <td>${Utils.formatDate(order.orderDate)}</td>
        <td>${order.userName}</td>
        <td>${order.items.length}</td>
        <td>${Utils.formatCurrency(order.total)}</td>
        <td>
          <span class="status-badge status-${order.status || 'pending'}">
            ${this.formatStatus(order.status || 'pending')}
          </span>
        </td>
        <td>
          <span class="payment-badge ${order.paymentStatus === 'paid' ? 'payment-paid' : 'payment-pending'}">
            ${order.paymentStatus || 'Pending'}
          </span>
        </td>
      </tr>
    `).join('');
  },

  formatStatus(status) {
    const statusMap = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  },

  setupFilters() {
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterOrders());
    }

    const searchInput = document.getElementById('order-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce(() => this.filterOrders(), 300));
    }
  },

  filterOrders() {
    const statusFilter = document.getElementById('status-filter')?.value;
    const searchTerm = document.getElementById('order-search')?.value.toLowerCase();

    this.filteredOrders = this.orders.filter(order => {
      const matchesStatus = !statusFilter || statusFilter === 'all' || order.status === statusFilter;
      const matchesSearch = !searchTerm ||
        order.orderId.toLowerCase().includes(searchTerm) ||
        order.userName.toLowerCase().includes(searchTerm) ||
        order.shippingAddress.email.toLowerCase().includes(searchTerm);

      return matchesStatus && matchesSearch;
    });

    this.renderOrderTable();
  },

  viewOrderDetail(orderId) {
    window.location.href = `order-detail.html?id=${orderId}`;
  },

  loadOrderDetail(orderId) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (!order) {
      Utils.showToast('Order not found', 'error');
      window.location.href = 'orders.html';
      return null;
    }
    return order;
  },

  renderOrderDetail(order) {
    const container = document.getElementById('order-detail-container');
    if (!container) return;

    container.innerHTML = `
      <div class="order-detail-header">
        <h2>Order ${order.orderId}</h2>
        <div class="order-actions">
          <button class="btn btn-secondary" onclick="InvoiceGenerator.generateInvoice('${order.orderId}')">
            Generate Invoice
          </button>
        </div>
      </div>

      <div class="order-detail-grid">
        <div class="order-info-card">
          <h3>Customer Information</h3>
          <p><strong>Name:</strong> ${order.userName}</p>
          <p><strong>Email:</strong> ${order.shippingAddress.email}</p>
          <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
        </div>

        <div class="order-info-card">
          <h3>Shipping Address</h3>
          <p>${order.shippingAddress.address}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
        </div>

        <div class="order-info-card">
          <h3>Order Status</h3>
          <select id="order-status-select" class="form-control">
            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
          <button class="btn btn-primary" style="margin-top: 10px;" onclick="AdminOrders.updateOrderStatus('${order.orderId}')">
            Update Status
          </button>
        </div>

        <div class="order-info-card">
          <h3>Payment Status</h3>
          <select id="payment-status-select" class="form-control">
            <option value="pending" ${order.paymentStatus === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="paid" ${order.paymentStatus === 'paid' ? 'selected' : ''}>Paid</option>
          </select>
          <button class="btn btn-primary" style="margin-top: 10px;" onclick="AdminOrders.updatePaymentStatus('${order.orderId}')">
            Update Payment
          </button>
        </div>
      </div>

      <div class="order-items-section">
        <h3>Order Items</h3>
        <table class="order-items-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Size</th>
              <th>Color</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>
                  <div class="item-with-image">
                    <img src="${item.image}" alt="${item.name}" class="item-thumb">
                    <span>${item.name}</span>
                  </div>
                </td>
                <td>${item.size}</td>
                <td>${item.color}</td>
                <td>${item.quantity}</td>
                <td>${Utils.formatCurrency(item.price)}</td>
                <td>${Utils.formatCurrency(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="order-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${Utils.formatCurrency(order.subtotal)}</span>
        </div>
        <div class="summary-row">
          <span>Tax:</span>
          <span>${Utils.formatCurrency(order.tax)}</span>
        </div>
        <div class="summary-row">
          <span>Shipping:</span>
          <span>${Utils.formatCurrency(order.shipping)}</span>
        </div>
        <div class="summary-row summary-total">
          <span>Total:</span>
          <span>${Utils.formatCurrency(order.total)}</span>
        </div>
      </div>

      <div class="order-notes-section">
        <h3>Admin Notes</h3>
        <textarea id="order-notes" class="form-control" rows="4">${order.notes || ''}</textarea>
        <button class="btn btn-primary" style="margin-top: 10px;" onclick="AdminOrders.saveNotes('${order.orderId}')">
          Save Notes
        </button>
      </div>
    `;
  },

  updateOrderStatus(orderId) {
    const statusSelect = document.getElementById('order-status-select');
    const newStatus = statusSelect.value;

    const orders = Utils.getFromLocalStorage('orders') || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex > -1) {
      orders[orderIndex].status = newStatus;
      
      if (!orders[orderIndex].statusHistory) {
        orders[orderIndex].statusHistory = [];
      }
      orders[orderIndex].statusHistory.push({
        status: newStatus,
        date: new Date().toISOString(),
        by: Auth.getCurrentUser().name
      });

      Utils.setToLocalStorage('orders', orders);
      Utils.showToast('Order status updated successfully', 'success');
    }
  },

  updatePaymentStatus(orderId) {
    const paymentSelect = document.getElementById('payment-status-select');
    const newPaymentStatus = paymentSelect.value;

    const orders = Utils.getFromLocalStorage('orders') || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex > -1) {
      orders[orderIndex].paymentStatus = newPaymentStatus;
      Utils.setToLocalStorage('orders', orders);
      Utils.showToast('Payment status updated successfully', 'success');
    }
  },

  saveNotes(orderId) {
    const notesTextarea = document.getElementById('order-notes');
    const notes = notesTextarea.value;

    const orders = Utils.getFromLocalStorage('orders') || [];
    const orderIndex = orders.findIndex(o => o.orderId === orderId);

    if (orderIndex > -1) {
      orders[orderIndex].notes = notes;
      Utils.setToLocalStorage('orders', orders);
      Utils.showToast('Notes saved successfully', 'success');
    }
  }
};

const AdminAnalytics = {
  init() {
    this.loadData();
    this.renderDashboardStats();
    this.renderCharts();
    this.renderRecentOrders();
  },

  loadData() {
    this.orders = Utils.getFromLocalStorage('orders') || [];
    this.products = Utils.getFromLocalStorage('products') || [];
    this.users = Utils.getFromLocalStorage('users') || [];
  },

  calculateStats() {
    const totalRevenue = this.orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = this.orders.length;
    const totalProducts = this.products.length;
    const totalCustomers = this.users.filter(u => u.role !== 'admin').length;

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
  },

  renderDashboardStats() {
    const stats = this.calculateStats();

    const statsContainer = document.getElementById('dashboard-stats');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3>Total Revenue</h3>
          <p class="stat-value">${Utils.formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3>Total Orders</h3>
          <p class="stat-value">${stats.totalOrders}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛍️</div>
        <div class="stat-content">
          <h3>Total Products</h3>
          <p class="stat-value">${stats.totalProducts}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>Total Customers</h3>
          <p class="stat-value">${stats.totalCustomers}</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">💳</div>
        <div class="stat-content">
          <h3>Average Order</h3>
          <p class="stat-value">${Utils.formatCurrency(stats.averageOrderValue)}</p>
        </div>
      </div>
    `;
  },

  renderCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }

    this.renderRevenueChart();
    this.renderCategoryChart();
  },

  renderRevenueChart() {
    const canvas = document.getElementById('revenue-chart');
    if (!canvas) return;

    const last7Days = this.getLast7DaysData();

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: last7Days.labels,
        datasets: [{
          label: 'Revenue',
          data: last7Days.revenue,
          borderColor: '#4A90E2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '$' + value
            }
          }
        }
      }
    });
  },

  renderCategoryChart() {
    const canvas = document.getElementById('category-chart');
    if (!canvas) return;

    const categoryData = this.getCategorySales();

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: categoryData.labels,
        datasets: [{
          data: categoryData.values,
          backgroundColor: [
            '#4A90E2',
            '#50C878',
            '#FF6B9D',
            '#FFB84D',
            '#9B59B6'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  },

  getLast7DaysData() {
    const labels = [];
    const revenue = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

      const dayRevenue = this.orders
        .filter(o => o.orderDate.startsWith(dateStr))
        .reduce((sum, o) => sum + o.total, 0);
      
      revenue.push(dayRevenue);
    }

    return { labels, revenue };
  },

  getCategorySales() {
    const categorySales = {};

    this.orders.forEach(order => {
      order.items.forEach(item => {
        const product = this.products.find(p => p.id === item.productId);
        if (product) {
          const category = product.category;
          categorySales[category] = (categorySales[category] || 0) + (item.price * item.quantity);
        }
      });
    });

    return {
      labels: Object.keys(categorySales).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)),
      values: Object.values(categorySales)
    };
  },

  renderRecentOrders() {
    const container = document.getElementById('recent-orders');
    if (!container) return;

    const recentOrders = this.orders.slice(0, 10);

    if (recentOrders.length === 0) {
      container.innerHTML = '<p class="text-center">No orders yet</p>';
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${recentOrders.map(order => `
            <tr onclick="window.location.href='order-detail.html?id=${order.orderId}'" style="cursor: pointer;">
              <td>${order.orderId}</td>
              <td>${order.userName}</td>
              <td>${new Date(order.orderDate).toLocaleDateString()}</td>
              <td>${Utils.formatCurrency(order.total)}</td>
              <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  exportToCSV() {
    const csv = this.generateCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  generateCSV() {
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Items', 'Total', 'Status', 'Payment'];
    const rows = this.orders.map(order => [
      order.orderId,
      new Date(order.orderDate).toLocaleDateString(),
      order.userName,
      order.shippingAddress.email,
      order.items.length,
      order.total,
      order.status || 'pending',
      order.paymentStatus || 'pending'
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
};

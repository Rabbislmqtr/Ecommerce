const InvoiceGenerator = {
  generateInvoice(orderId) {
    const orders = Utils.getFromLocalStorage('orders') || [];
    const order = orders.find(o => o.orderId === orderId);

    if (!order) {
      Utils.showToast('Order not found', 'error');
      return;
    }

    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = this.createInvoiceHTML(order);
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    setTimeout(() => {
      invoiceWindow.print();
    }, 250);
  },

  createInvoiceHTML(order) {
    const settings = Utils.getFromLocalStorage('siteSettings') || {};
    const siteName = settings.siteName || 'FashionHub';
    const contactEmail = settings.contactEmail || 'support@fashionhub.com';
    const contactPhone = settings.contactPhone || '(555) 123-4567';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${order.orderId}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .invoice-container { max-width: 800px; margin: 0 auto; }
          .invoice-header { text-align: center; margin-bottom: 40px; }
          .invoice-header h1 { color: #D4A5A5; font-size: 36px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-section { flex: 1; }
          .invoice-section h3 { margin-bottom: 10px; color: #666; }
          .invoice-section p { margin: 5px 0; }
          .invoice-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .invoice-table th, .invoice-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          .invoice-table th { background-color: #f5f5f5; font-weight: bold; }
          .invoice-totals { text-align: right; margin-top: 20px; }
          .invoice-totals .total-row { display: flex; justify-content: flex-end; margin: 8px 0; }
          .invoice-totals .total-label { width: 150px; text-align: right; padding-right: 20px; }
          .invoice-totals .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
          .invoice-footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>${siteName}</h1>
            <p>${contactEmail} | ${contactPhone}</p>
          </div>

          <div style="text-align: right; margin-bottom: 20px;">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${Utils.formatDate(order.orderDate)}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus === 'paid' ? 'PAID' : 'PENDING'}</p>
          </div>

          <div class="invoice-info">
            <div class="invoice-section">
              <h3>Bill To:</h3>
              <p><strong>${order.shippingAddress.name}</strong></p>
              <p>${order.shippingAddress.email}</p>
              <p>${order.shippingAddress.phone}</p>
            </div>

            <div class="invoice-section">
              <h3>Ship To:</h3>
              <p>${order.shippingAddress.address}</p>
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}</p>
            </div>
          </div>

          <table class="invoice-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.size}</td>
                  <td>${item.color}</td>
                  <td>${item.quantity}</td>
                  <td>${Utils.formatCurrency(item.price)}</td>
                  <td>${Utils.formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="invoice-totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span>${Utils.formatCurrency(order.subtotal)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax:</span>
              <span>${Utils.formatCurrency(order.tax)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Shipping:</span>
              <span>${Utils.formatCurrency(order.shipping)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total:</span>
              <span>${Utils.formatCurrency(order.total)}</span>
            </div>
          </div>

          <div class="invoice-footer">
            <p>Payment Method: Manual (${order.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'})</p>
            <p style="margin-top: 20px;">Thank you for your business!</p>
            <p>For any questions, please contact us at ${contactEmail}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

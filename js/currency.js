const Currency = {
  // Exchange rates relative to USD (1 USD = X in other currencies)
  exchangeRates: {
    USD: 1,
    BDT: 119.50,  // 1 USD = 119.50 BDT
    INR: 83.20    // 1 USD = 83.20 INR
  },

  // Currency symbols
  symbols: {
    USD: '$',
    BDT: '৳',
    INR: '₹'
  },

  // Currency names
  names: {
    USD: 'US Dollar',
    BDT: 'Bangladeshi Taka',
    INR: 'Indian Rupee'
  },

  currentCurrency: 'USD',

  init() {
    this.loadCurrency();
    this.updateCurrencySelectDropdown();
    this.setupCurrencyChangeListener();
  },

  updateCurrencySelectDropdown() {
    const selectElement = document.getElementById('currency-select');
    if (selectElement) {
      selectElement.value = this.currentCurrency;
    }
  },

  loadCurrency() {
    const saved = Utils.getFromLocalStorage('selectedCurrency');
    if (saved && this.exchangeRates[saved]) {
      this.currentCurrency = saved;
    } else {
      this.currentCurrency = 'USD';
      this.saveCurrency();
    }
  },

  saveCurrency() {
    Utils.setToLocalStorage('selectedCurrency', this.currentCurrency);
  },

  setCurrency(currency) {
    if (this.exchangeRates[currency]) {
      this.currentCurrency = currency;
      this.saveCurrency();
      this.notifyCurrencyChange();
      return true;
    }
    return false;
  },

  getCurrency() {
    return this.currentCurrency;
  },

  getSymbol(currency = this.currentCurrency) {
    return this.symbols[currency] || '$';
  },

  getName(currency = this.currentCurrency) {
    return this.names[currency] || 'US Dollar';
  },

  // Convert price from USD to selected currency
  convertPrice(priceInUsd, targetCurrency = this.currentCurrency) {
    if (!this.exchangeRates[targetCurrency]) {
      targetCurrency = 'USD';
    }
    return priceInUsd * this.exchangeRates[targetCurrency];
  },

  // Format price with current currency
  formatPrice(priceInUsd, currency = this.currentCurrency) {
    const convertedPrice = this.convertPrice(priceInUsd, currency);
    const symbol = this.getSymbol(currency);

    // Different formatter options based on currency
    let formatter;
    switch (currency) {
      case 'BDT':
        formatter = new Intl.NumberFormat('bn-BD', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        break;
      case 'INR':
        formatter = new Intl.NumberFormat('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
        break;
      case 'USD':
      default:
        formatter = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
    }

    const formattedNumber = formatter.format(convertedPrice);
    return `${symbol}${formattedNumber}`;
  },

  // Get all available currencies
  getAllCurrencies() {
    return Object.keys(this.exchangeRates);
  },

  // Notify all listeners of currency change
  notifyCurrencyChange() {
    this.updateCurrencySelectDropdown();
    window.dispatchEvent(new CustomEvent('currencyChanged', {
      detail: { currency: this.currentCurrency }
    }));
  },

  // Listen for currency changes
  setupCurrencyChangeListener() {
    window.addEventListener('currencyChanged', (e) => {
      this.reloadPrices();
    });
  },

  // Reload all prices on the page
  reloadPrices() {
    // Re-render products
    if (typeof Products !== 'undefined' && Products.allProducts && Products.allProducts.length > 0) {
      const page = getPageName?.() || '';
      if (page === 'index.html') {
        Products.renderFeaturedProducts();
      } else if (page === 'products.html') {
        Products.renderProductGrid(Products.allProducts);
      } else if (page === 'product-detail.html') {
        Products.renderProductDetail(Products.currentProduct?.id);
      }
    }

    // Re-render cart
    if (typeof Cart !== 'undefined' && Cart.items && Cart.items.length > 0) {
      Cart.renderCart();
    }

    // Re-render checkout
    if (typeof Checkout !== 'undefined') {
      const page = getPageName?.() || '';
      if (page === 'checkout.html') {
        Checkout.renderOrderSummary();
      }
    }
  }
};

// Initialize currency on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    Currency.init();
  });
} else {
  Currency.init();
}

const AdminSettings = {
  settings: {},

  init() {
    this.loadSettings();
    this.populateForm();
    this.setupFormHandlers();
  },

  loadSettings() {
    this.settings = Utils.getFromLocalStorage('siteSettings') || this.getDefaultSettings();
  },

  getDefaultSettings() {
    return {
      siteName: 'FashionHub',
      logo: '',
      contactEmail: 'support@fashionhub.com',
      contactPhone: '(555) 123-4567',
      address: '123 Fashion St, New York, NY 10001',
      shippingFee: 10.00,
      freeShippingThreshold: 50.00,
      taxRate: 0.08,
      currency: 'USD',
      currencySymbol: '$',
      heroTitle: 'Discover Your Style',
      heroDescription: 'Explore our latest collection of women\'s fashion',
      featuredProductsCount: 8
    };
  },

  populateForm() {
    document.getElementById('site-name').value = this.settings.siteName;
    document.getElementById('contact-email').value = this.settings.contactEmail;
    document.getElementById('contact-phone').value = this.settings.contactPhone;
    document.getElementById('address').value = this.settings.address;
    document.getElementById('shipping-fee').value = this.settings.shippingFee;
    document.getElementById('free-shipping-threshold').value = this.settings.freeShippingThreshold;
    document.getElementById('tax-rate').value = (this.settings.taxRate * 100).toFixed(0);
    document.getElementById('currency-symbol').value = this.settings.currencySymbol;
    document.getElementById('hero-title').value = this.settings.heroTitle;
    document.getElementById('hero-description').value = this.settings.heroDescription;
    document.getElementById('featured-count').value = this.settings.featuredProductsCount;

    if (this.settings.logo) {
      const logoPreview = document.getElementById('logo-preview');
      if (logoPreview) {
        logoPreview.src = this.settings.logo;
        logoPreview.style.display = 'block';
      }
    }
  },

  setupFormHandlers() {
    const form = document.getElementById('settings-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    const logoInput = document.getElementById('logo-upload');
    if (logoInput) {
      logoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const base64 = await ImageUpload.convertToBase64(file);
            this.settings.logo = base64;
            
            const logoPreview = document.getElementById('logo-preview');
            if (logoPreview) {
              logoPreview.src = base64;
              logoPreview.style.display = 'block';
            }
          } catch (error) {
            Utils.showToast(error.message, 'error');
          }
        }
      });
    }
  },

  saveSettings() {
    this.settings.siteName = document.getElementById('site-name').value;
    this.settings.contactEmail = document.getElementById('contact-email').value;
    this.settings.contactPhone = document.getElementById('contact-phone').value;
    this.settings.address = document.getElementById('address').value;
    this.settings.shippingFee = parseFloat(document.getElementById('shipping-fee').value);
    this.settings.freeShippingThreshold = parseFloat(document.getElementById('free-shipping-threshold').value);
    this.settings.taxRate = parseFloat(document.getElementById('tax-rate').value) / 100;
    this.settings.currencySymbol = document.getElementById('currency-symbol').value;
    this.settings.heroTitle = document.getElementById('hero-title').value;
    this.settings.heroDescription = document.getElementById('hero-description').value;
    this.settings.featuredProductsCount = parseInt(document.getElementById('featured-count').value);

    Utils.setToLocalStorage('siteSettings', this.settings);
    Utils.showToast('Settings saved successfully!', 'success');
  }
};

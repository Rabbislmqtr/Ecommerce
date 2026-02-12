const Filters = {
  activeFilters: {
    categories: [],
    sizes: [],
    colors: [],
    priceRange: { min: 0, max: 200 },
    searchTerm: '',
    sortBy: 'default'
  },

  init() {
    this.setupFilterListeners();
    this.updatePriceDisplay();
  },

  setupFilterListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.activeFilters.searchTerm = e.target.value.toLowerCase();
        this.applyFilters();
      }, 300));
    }

    const categoryCheckboxes = document.querySelectorAll('[data-filter="category"]');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.toggleFilter('categories', e.target.value, e.target.checked);
      });
    });

    const sizeCheckboxes = document.querySelectorAll('[data-filter="size"]');
    sizeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.toggleFilter('sizes', e.target.value, e.target.checked);
      });
    });

    const colorCheckboxes = document.querySelectorAll('[data-filter="color"]');
    colorCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        this.toggleFilter('colors', e.target.value, e.target.checked);
      });
    });

    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin && priceMax) {
      priceMin.addEventListener('input', (e) => {
        this.activeFilters.priceRange.min = parseFloat(e.target.value);
        this.updatePriceDisplay();
        this.applyFilters();
      });

      priceMax.addEventListener('input', (e) => {
        this.activeFilters.priceRange.max = parseFloat(e.target.value);
        this.updatePriceDisplay();
        this.applyFilters();
      });
    }

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeFilters.sortBy = e.target.value;
        this.applyFilters();
      });
    }

    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => this.clearAllFilters());
    }
  },

  toggleFilter(filterType, value, isChecked) {
    if (isChecked) {
      if (!this.activeFilters[filterType].includes(value)) {
        this.activeFilters[filterType].push(value);
      }
    } else {
      this.activeFilters[filterType] = this.activeFilters[filterType].filter(v => v !== value);
    }
    this.applyFilters();
  },

  applyFilters() {
    let filteredProducts = [...Products.allProducts];

    if (this.activeFilters.searchTerm) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(this.activeFilters.searchTerm) ||
        product.description.toLowerCase().includes(this.activeFilters.searchTerm)
      );
    }

    if (this.activeFilters.categories.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        this.activeFilters.categories.includes(product.category)
      );
    }

    if (this.activeFilters.sizes.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.sizes.some(size => this.activeFilters.sizes.includes(size))
      );
    }

    if (this.activeFilters.colors.length > 0) {
      filteredProducts = filteredProducts.filter(product =>
        product.colors.some(color => this.activeFilters.colors.includes(color))
      );
    }

    filteredProducts = filteredProducts.filter(product =>
      product.price >= this.activeFilters.priceRange.min &&
      product.price <= this.activeFilters.priceRange.max
    );

    filteredProducts = this.sortProducts(filteredProducts);

    Products.renderProductGrid(filteredProducts);
    this.updateFilterCount();
  },

  sortProducts(products) {
    switch (this.activeFilters.sortBy) {
      case 'price-low-high':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return products.sort((a, b) => b.price - a.price);
      case 'name-az':
        return products.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-za':
        return products.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return products;
    }
  },

  updatePriceDisplay() {
    const priceMinDisplay = document.getElementById('price-min-display');
    const priceMaxDisplay = document.getElementById('price-max-display');
    
    if (priceMinDisplay) {
      priceMinDisplay.textContent = Utils.formatCurrency(this.activeFilters.priceRange.min);
    }
    
    if (priceMaxDisplay) {
      priceMaxDisplay.textContent = Utils.formatCurrency(this.activeFilters.priceRange.max);
    }
  },

  updateFilterCount() {
    const filterCountEl = document.getElementById('active-filter-count');
    if (!filterCountEl) return;

    const count = this.activeFilters.categories.length +
                  this.activeFilters.sizes.length +
                  this.activeFilters.colors.length +
                  (this.activeFilters.searchTerm ? 1 : 0);

    if (count > 0) {
      filterCountEl.textContent = `${count} filter${count !== 1 ? 's' : ''} active`;
      filterCountEl.style.display = 'inline-block';
    } else {
      filterCountEl.style.display = 'none';
    }
  },

  clearAllFilters() {
    this.activeFilters = {
      categories: [],
      sizes: [],
      colors: [],
      priceRange: { min: 0, max: 200 },
      searchTerm: '',
      sortBy: 'default'
    };

    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const priceMin = document.getElementById('price-min');
    const priceMax = document.getElementById('price-max');
    if (priceMin) priceMin.value = 0;
    if (priceMax) priceMax.value = 200;

    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = 'default';

    this.updatePriceDisplay();
    this.applyFilters();
    Utils.showToast('Filters cleared', 'success');
  }
};

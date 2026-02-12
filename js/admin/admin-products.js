const AdminProducts = {
  products: [],
  currentPage: 1,
  itemsPerPage: 20,

  async init() {
    await this.loadProducts();
    this.renderProductTable();
    this.setupEventListeners();
  },

  async loadProducts() {
    await Products.loadProducts();
    this.products = Products.allProducts;
  },

  renderProductTable() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    if (this.products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center">No products found</td></tr>';
      return;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    const paginatedProducts = this.products.slice(start, end);

    tbody.innerHTML = paginatedProducts.map(product => `
      <tr>
        <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
        <td>${product.name}</td>
        <td>${Products.formatCategory(product.category)}</td>
        <td>${Utils.formatCurrency(product.price)}</td>
        <td>${product.stock || 0}</td>
        <td>
          <span class="status-badge ${product.inStock ? 'status-active' : 'status-inactive'}">
            ${product.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </td>
        <td>
          <button class="btn-sm btn-edit" onclick="AdminProducts.editProduct('${product.id}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="AdminProducts.deleteProduct('${product.id}')">Delete</button>
        </td>
      </tr>
    `).join('');

    this.renderPagination();
  },

  renderPagination() {
    const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl || totalPages <= 1) return;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" onclick="AdminProducts.goToPage(${i})">${i}</button>`;
    }
    paginationEl.innerHTML = html;
  },

  goToPage(page) {
    this.currentPage = page;
    this.renderProductTable();
  },

  setupEventListeners() {
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.searchProducts(e.target.value);
      }, 300));
    }
  },

  searchProducts(term) {
    if (!term) {
      this.products = Products.allProducts;
    } else {
      this.products = Products.allProducts.filter(p =>
        p.name.toLowerCase().includes(term.toLowerCase()) ||
        p.sku.toLowerCase().includes(term.toLowerCase())
      );
    }
    this.currentPage = 1;
    this.renderProductTable();
  },

  editProduct(id) {
    window.location.href = `edit-product.html?id=${id}`;
  },

  async deleteProduct(id) {
    const product = Products.getProductById(id);
    if (!product) return;

    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    Products.deleteProduct(id);
    await this.loadProducts();
    this.renderProductTable();
    Utils.showToast('Product deleted successfully', 'success');
  },

  async handleAddProduct(formData) {
    try {
      const newProduct = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description,
        sizes: formData.sizes,
        colors: formData.colors,
        image: formData.image,
        images: formData.images || [formData.image],
        stock: parseInt(formData.stock),
        sku: formData.sku,
        inStock: formData.inStock !== false
      };

      Products.addProduct(newProduct);
      Utils.showToast('Product added successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'products.html';
      }, 1000);
    } catch (error) {
      Utils.showToast('Error adding product', 'error');
      console.error(error);
    }
  },

  async handleEditProduct(id, formData) {
    try {
      const updates = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description,
        sizes: formData.sizes,
        colors: formData.colors,
        stock: parseInt(formData.stock),
        sku: formData.sku,
        inStock: formData.inStock !== false
      };

      if (formData.image) {
        updates.image = formData.image;
      }
      if (formData.images && formData.images.length > 0) {
        updates.images = formData.images;
      }

      Products.updateProduct(id, updates);
      Utils.showToast('Product updated successfully!', 'success');
      setTimeout(() => {
        window.location.href = 'products.html';
      }, 1000);
    } catch (error) {
      Utils.showToast('Error updating product', 'error');
      console.error(error);
    }
  }
};

// Inventory Management System - JavaScript

class InventoryManager {
    constructor() {
        this.products = [];
        this.apiUrl = 'api.php';
        this.loadFromServer();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Form submission
        const productForm = document.getElementById('productForm');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addProduct();
            });
        }

        const editForm = document.getElementById('editForm');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProduct();
            });
        }

        // Search and filter
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterProducts());
        }
        
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterProducts());
        }

        // Modal close buttons
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal('editModal'));
        }
        
        const cancelEdit = document.getElementById('cancelEdit');
        if (cancelEdit) {
            cancelEdit.addEventListener('click', () => this.closeModal('editModal'));
        }
        
        const cancelDelete = document.getElementById('cancelDelete');
        if (cancelDelete) {
            cancelDelete.addEventListener('click', () => this.closeModal('deleteModal'));
        }
        
        const confirmDelete = document.getElementById('confirmDelete');
        if (confirmDelete) {
            confirmDelete.addEventListener('click', () => this.deleteProduct());
        }

        // Reports
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportToCSV());
        }
        
        const printBtn = document.getElementById('printBtn');
        if (printBtn) {
            printBtn.addEventListener('click', () => window.print());
        }

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    switchView(viewName) {
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Show selected view
        document.getElementById(viewName).classList.add('active');
        
        // Activate the corresponding nav button
        document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

        // Update content based on view
        if (viewName === 'products') {
            this.displayAllProducts();
        } else if (viewName === 'low-stock') {
            this.displayLowStockItems();
        } else if (viewName === 'reports') {
            this.generateReports();
        } else if (viewName === 'dashboard') {
            this.updateDashboard();
        }
    }

    addProduct() {
        const product = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            sku: document.getElementById('productSKU').value,
            price: parseFloat(document.getElementById('productPrice').value),
            quantity: parseInt(document.getElementById('productQuantity').value),
            minStock: parseInt(document.getElementById('productMinStock').value),
            description: document.getElementById('productDescription').value,
            supplier: document.getElementById('productSupplier').value,
            dateAdded: new Date().toLocaleDateString()
        };

        // Send to server
        fetch(`${this.apiUrl}?action=addProduct`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('productForm').reset();
                alert('Product added successfully!');
                this.loadFromServer();
                this.switchView('dashboard');
            } else {
                alert('Error: ' + (data.error || 'Failed to add product'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding product: ' + error.message);
        });
    }

    displayAllProducts() {
        const tbody = document.getElementById('productsBody');
        const noProducts = document.getElementById('noProducts');

        if (this.products.length === 0) {
            tbody.innerHTML = '';
            noProducts.style.display = 'block';
            return;
        }

        noProducts.style.display = 'none';
        tbody.innerHTML = this.products.map(product => `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.sku}</td>
                <td>${product.category}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>${product.minStock}</td>
                <td>${this.getStockStatus(product)}</td>
                <td>₹${(product.price * product.quantity).toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="inventoryManager.openEditModal(${product.id})">Edit</button>
                        <button class="btn-delete" onclick="inventoryManager.openDeleteModal(${product.id})">Delete</button>
                        <button class="btn-add-stock" onclick="inventoryManager.quickAddStock(${product.id})">+Stock</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    filterProducts() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;

        const filtered = this.products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.sku.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryFilter || product.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        const tbody = document.getElementById('productsBody');
        const noProducts = document.getElementById('noProducts');

        if (filtered.length === 0) {
            tbody.innerHTML = '';
            noProducts.style.display = 'block';
            return;
        }

        noProducts.style.display = 'none';
        tbody.innerHTML = filtered.map(product => `
            <tr>
                <td><strong>${product.name}</strong></td>
                <td>${product.sku}</td>
                <td>${product.category}</td>
                <td>₹${product.price.toFixed(2)}</td>
                <td>${product.quantity}</td>
                <td>${product.minStock}</td>
                <td>${this.getStockStatus(product)}</td>
                <td>₹${(product.price * product.quantity).toFixed(2)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="inventoryManager.openEditModal(${product.id})">Edit</button>
                        <button class="btn-delete" onclick="inventoryManager.openDeleteModal(${product.id})">Delete</button>
                        <button class="btn-add-stock" onclick="inventoryManager.quickAddStock(${product.id})">+Stock</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    displayLowStockItems() {
        const lowStock = this.products.filter(p => p.quantity <= p.minStock);
        const container = document.getElementById('lowStockList');
        const noLowStock = document.getElementById('noLowStock');

        if (lowStock.length === 0) {
            container.innerHTML = '';
            noLowStock.style.display = 'block';
            return;
        }

        noLowStock.style.display = 'none';
        container.innerHTML = lowStock.map(product => `
            <div class="product-card">
                <h4>${product.name}</h4>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Current Stock:</strong> ${product.quantity}</p>
                <p><strong>Min Level:</strong> ${product.minStock}</p>
                <p><strong>Shortage:</strong> ${product.minStock - product.quantity} units</p>
                <p class="price">₹${product.price.toFixed(2)}</p>
                <button class="btn btn-primary" onclick="inventoryManager.quickAddStock(${product.id})">Add Stock</button>
            </div>
        `).join('');
    }

    openEditModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductSKU').value = product.sku;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductQuantity').value = product.quantity;
        document.getElementById('editProductMinStock').value = product.minStock;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductSupplier').value = product.supplier;

        this.openModal('editModal');
    }

    updateProduct() {
        const productId = parseInt(document.getElementById('editProductId').value);
        const product = {
            id: productId,
            name: document.getElementById('editProductName').value,
            category: document.getElementById('editProductCategory').value,
            sku: document.getElementById('editProductSKU').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            quantity: parseInt(document.getElementById('editProductQuantity').value),
            minStock: parseInt(document.getElementById('editProductMinStock').value),
            description: document.getElementById('editProductDescription').value,
            supplier: document.getElementById('editProductSupplier').value
        };

        // Send to server
        fetch(`${this.apiUrl}?action=updateProduct`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(product)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.closeModal('editModal');
                alert('Product updated successfully!');
                this.loadFromServer();
            } else {
                alert('Error: ' + (data.error || 'Failed to update product'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating product: ' + error.message);
        });
    }

    openDeleteModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        document.getElementById('editProductId').value = productId;
        document.getElementById('deleteProductName').textContent = product.name;
        this.openModal('deleteModal');
    }

    deleteProduct() {
        const productId = parseInt(document.getElementById('editProductId').value);

        // Send to server
        fetch(`${this.apiUrl}?action=deleteProduct`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: productId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.closeModal('deleteModal');
                alert('Product deleted successfully!');
                this.loadFromServer();
            } else {
                alert('Error: ' + (data.error || 'Failed to delete product'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting product: ' + error.message);
        });
    }

    quickAddStock(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        const quantity = prompt(`Add stock for "${product.name}" (Current: ${product.quantity}):\n\nEnter quantity to add:`, '0');
        
        if (quantity === null) return;

        const addedQty = parseInt(quantity);
        if (isNaN(addedQty) || addedQty < 0) {
            alert('Please enter a valid positive number');
            return;
        }

        // Update on server
        const updatedProduct = { ...product, quantity: product.quantity + addedQty };
        fetch(`${this.apiUrl}?action=updateProduct`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProduct)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(`Added ${addedQty} units. New quantity: ${updatedProduct.quantity}`);
                this.loadFromServer();
            } else {
                alert('Error: ' + (data.error || 'Failed to update stock'));
            }
        })
        .catch(error => console.error('Error:', error));
    }

    getStockStatus(product) {
        if (product.quantity === 0) {
            return '<span class="stock-status out-of-stock">Out of Stock</span>';
        } else if (product.quantity <= product.minStock) {
            return '<span class="stock-status low-stock">Low Stock</span>';
        } else {
            return '<span class="stock-status in-stock">In Stock</span>';
        }
    }

    updateDashboard() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const lowStockCount = this.products.filter(p => p.quantity <= p.minStock).length;
        const totalQuantity = this.products.reduce((sum, p) => sum + p.quantity, 0);

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = '₹' + totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2});
        document.getElementById('lowStockCount').textContent = lowStockCount;
        document.getElementById('totalQuantity').textContent = totalQuantity;

        // Display recent products
        const recent = this.products.slice(-4).reverse();
        const container = document.getElementById('recentProductsList');
        
        if (recent.length === 0) {
            container.innerHTML = '<p class="no-data">No products yet. Add your first product!</p>';
            return;
        }

        container.innerHTML = recent.map(product => `
            <div class="product-card">
                <h4>${product.name}</h4>
                <p><strong>SKU:</strong> ${product.sku}</p>
                <p><strong>Quantity:</strong> ${product.quantity}</p>
                <p class="price">₹${product.price.toFixed(2)}</p>
                <span class="stock-status ${product.quantity === 0 ? 'out-of-stock' : product.quantity <= product.minStock ? 'low-stock' : 'in-stock'}">
                    ${product.quantity === 0 ? 'Out of Stock' : product.quantity <= product.minStock ? 'Low Stock' : 'In Stock'}
                </span>
            </div>
        `).join('');
    }

    generateReports() {
        const summary = document.getElementById('reportsSummary');
        const categoryBreakdown = document.getElementById('categoryBreakdown');

        // Summary report
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const totalQuantity = this.products.reduce((sum, p) => sum + p.quantity, 0);
        const lowStockItems = this.products.filter(p => p.quantity <= p.minStock).length;
        const outOfStock = this.products.filter(p => p.quantity === 0).length;
        const avgValue = totalProducts > 0 ? totalValue / totalProducts : 0;

        summary.innerHTML = `
            <div class="report-row">
                <strong>Total Products:</strong>
                <span>${totalProducts}</span>
            </div>
            <div class="report-row">
                <strong>Total Inventory Value:</strong>
                <span>₹${totalValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="report-row">
                <strong>Total Units in Stock:</strong>
                <span>${totalQuantity}</span>
            </div>
            <div class="report-row">
                <strong>Average Stock Value:</strong>
                <span>₹${avgValue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
            <div class="report-row">
                <strong>Low Stock Items:</strong>
                <span>${lowStockItems}</span>
            </div>
            <div class="report-row">
                <strong>Out of Stock Items:</strong>
                <span>${outOfStock}</span>
            </div>
        `;

        // Category breakdown
        const categories = {};
        this.products.forEach(product => {
            if (!categories[product.category]) {
                categories[product.category] = {
                    count: 0,
                    value: 0,
                    quantity: 0
                };
            }
            categories[product.category].count++;
            categories[product.category].value += product.price * product.quantity;
            categories[product.category].quantity += product.quantity;
        });

        categoryBreakdown.innerHTML = Object.entries(categories).map(([category, data]) => `
            <div class="report-row">
                <strong>${category}</strong>
                <span>
                    Products: ${data.count} | Units: ${data.quantity} | Value: ₹${data.value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
            </div>
        `).join('');

        if (Object.keys(categories).length === 0) {
            categoryBreakdown.innerHTML = '<p class="no-data">No products to report on.</p>';
        }
    }

    exportToCSV() {
        if (this.products.length === 0) {
            alert('No products to export!');
            return;
        }

        let csv = 'Product Name,SKU,Category,Price,Quantity,Min Stock,Description,Supplier,Total Value,Date Added\n';
        
        this.products.forEach(product => {
            const totalValue = product.price * product.quantity;
            csv += `"${product.name}","${product.sku}","${product.category}",${product.price},${product.quantity},${product.minStock},"${product.description}","${product.supplier}",${totalValue},"${product.dateAdded}"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }

    saveToStorage() {
        // No longer needed - saving happens on server
    }

    loadFromServer() {
        fetch(`${this.apiUrl}?action=getProducts`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.products = data.products || [];
                    this.updateDashboard();
                    this.displayAllProducts();
                } else {
                    console.error('Failed to load products');
                }
            })
            .catch(error => console.error('Error loading products:', error));
    }
}

// Initialize the inventory manager when page loads
let inventoryManager;
document.addEventListener('DOMContentLoaded', () => {
    inventoryManager = new InventoryManager();
});

/**
 * Tiffin Shop Billing PWA - Main Application Script
 * Pure Vanilla JavaScript (ES6+)
 * No frameworks, no backend, no database, no paid dependencies
 */

// ============================================================================
// Application State and Configuration
// ============================================================================

class TiffinBillingApp {
    constructor() {
        // App state
        this.state = {
            cart: [],
            currentBill: null,
            isOnline: navigator.onLine,
            theme: 'light',
            settings: this.getDefaultSettings(),
            bills: [],
            menuItems: this.getDefaultMenuItems()
        };

        // DOM Elements cache
        this.elements = {};

        // Initialize the application
        this.init();
    }

    // ========================================================================
    // Initialization Methods
    // ========================================================================

    /**
     * Initialize the application
     */
    init() {
        this.cacheElements();
        this.loadFromStorage();
        this.bindEvents();
        this.renderMenuItems();
        this.renderCart();
        this.updateUI();
        this.setupServiceWorker();
        this.setupOfflineDetection();
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        // Main sections
        this.elements = {
            // Views
            billingView: document.getElementById('billingView'),
            paymentView: document.getElementById('paymentView'),
            historyView: document.getElementById('historyView'),
            settingsView: document.getElementById('settingsView'),

            // Navigation
            navButtons: document.querySelectorAll('.nav-btn'),

            // Food grid and cart
            foodGrid: document.getElementById('foodGrid'),
            cartItems: document.getElementById('cartItems'),
            itemCount: document.getElementById('itemCount'),
            subtotal: document.getElementById('subtotal'),
            taxAmount: document.getElementById('taxAmount'),
            totalAmount: document.getElementById('totalAmount'),
            taxPercentage: document.getElementById('taxPercentage'),

            // Buttons
            clearCartBtn: document.getElementById('clearCartBtn'),
            generateBillBtn: document.getElementById('generateBillBtn'),

            // Payment section
            upiId: document.getElementById('upiId'),
            updateUpiBtn: document.getElementById('updateUpiBtn'),
            upiQrCode: document.getElementById('upiQrCode'),
            cashAmount: document.getElementById('cashAmount'),
            changeAmount: document.getElementById('changeAmount'),
            confirmUpiBtn: document.getElementById('confirmUpiBtn'),
            confirmCashBtn: document.getElementById('confirmCashBtn'),
            editBillBtn: document.getElementById('editBillBtn'),
            printReceiptBtn: document.getElementById('printReceiptBtn'),
            backToBillingBtn: document.getElementById('backToBillingBtn'),

            // History section
            startDate: document.getElementById('startDate'),
            endDate: document.getElementById('endDate'),
            paymentMethodFilter: document.getElementById('paymentMethodFilter'),
            searchBills: document.getElementById('searchBills'),
            applyFiltersBtn: document.getElementById('applyFiltersBtn'),
            resetFiltersBtn: document.getElementById('resetFiltersBtn'),
            historyList: document.getElementById('historyList'),
            todaySales: document.getElementById('todaySales'),
            todayBills: document.getElementById('todayBills'),
            monthSales: document.getElementById('monthSales'),
            monthBills: document.getElementById('monthBills'),
            avgBill: document.getElementById('avgBill'),
            topItem: document.getElementById('topItem'),
            topItemQty: document.getElementById('topItemQty'),

            // Settings section
            settingsShopName: document.getElementById('settingsShopName'),
            settingsShopAddress: document.getElementById('settingsShopAddress'),
            settingsTax: document.getElementById('settingsTax'),
            settingsDefaultUpi: document.getElementById('settingsDefaultUpi'),
            menuItemsList: document.getElementById('menuItemsList'),
            newItemEnglish: document.getElementById('newItemEnglish'),
            newItemTamil: document.getElementById('newItemTamil'),
            newItemPrice: document.getElementById('newItemPrice'),
            newItemImage: document.getElementById('newItemImage'),
            addNewItemBtn: document.getElementById('addNewItemBtn'),
            saveShopSettings: document.getElementById('saveShopSettings'),
            exportJsonBtn: document.getElementById('exportJsonBtn'),
            exportCsvBtn: document.getElementById('exportCsvBtn'),
            importDataBtn: document.getElementById('importDataBtn'),
            resetTodayBtn: document.getElementById('resetTodayBtn'),
            resetAllBtn: document.getElementById('resetAllBtn'),
            storageUsed: document.getElementById('storageUsed'),
            totalBillsCount: document.getElementById('totalBillsCount'),
            lastBackup: document.getElementById('lastBackup'),
            checkUpdatesBtn: document.getElementById('checkUpdatesBtn'),

            // Theme toggle
            themeToggle: document.getElementById('themeToggle'),
            offlineIndicator: document.getElementById('offlineIndicator'),

            // Toast and modal containers
            toastContainer: document.getElementById('toastContainer'),
            modalContainer: document.getElementById('modalContainer')
        };
    }

    /**
     * Load data from localStorage
     */
    loadFromStorage() {
        try {
            // Load settings
            const savedSettings = localStorage.getItem('tiffinShopSettings');
            if (savedSettings) {
                this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
            }

            // Load menu items
            const savedMenu = localStorage.getItem('tiffinShopMenu');
            if (savedMenu) {
                this.state.menuItems = JSON.parse(savedMenu);

                // FIX: Update images for specific items to use local assets
                // This ensures old online URLs in localStorage are replaced
                const localImageUpdates = {
                    'dosa': 'asset/dosa.jpg',
                    'pongal': 'asset/pongal.jpg',
                    'poori': 'asset/poori.jpg',
                    'chapathi': 'asset/chappathi.jpg'
                };

                this.state.menuItems.forEach(item => {
                    if (localImageUpdates[item.id]) {
                        item.image = localImageUpdates[item.id];
                    }
                });
            }

            // Load bills history
            const savedBills = localStorage.getItem('tiffinShopBills');
            if (savedBills) {
                this.state.bills = JSON.parse(savedBills);
            }

            // Load theme
            const savedTheme = localStorage.getItem('tiffinShopTheme');
            if (savedTheme) {
                this.state.theme = savedTheme;
                document.documentElement.setAttribute('data-theme', savedTheme);
            }

            this.showToast('App data loaded successfully', 'success');
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.showToast('Error loading saved data', 'error');
        }
    }

    /**
     * Save data to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('tiffinShopSettings', JSON.stringify(this.state.settings));
            localStorage.setItem('tiffinShopMenu', JSON.stringify(this.state.menuItems));
            localStorage.setItem('tiffinShopBills', JSON.stringify(this.state.bills));
            localStorage.setItem('tiffinShopTheme', this.state.theme);

            // Update storage usage display
            this.updateStorageInfo();
        } catch (error) {
            console.error('Error saving to storage:', error);
            this.showToast('Storage error: Could not save data', 'error');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation
        this.elements.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Cart actions
        this.elements.clearCartBtn.addEventListener('click', () => this.clearCart());
        this.elements.generateBillBtn.addEventListener('click', () => this.generateBill());

        // Payment actions
        this.elements.updateUpiBtn.addEventListener('click', () => this.updateUpiQr());
        this.elements.cashAmount.addEventListener('input', () => this.calculateChange());
        this.elements.confirmUpiBtn.addEventListener('click', () => this.completePayment('upi'));
        this.elements.confirmCashBtn.addEventListener('click', () => this.completePayment('cash'));
        this.elements.editBillBtn.addEventListener('click', () => this.editBill());
        this.elements.printReceiptBtn.addEventListener('click', () => this.printReceipt());
        this.elements.backToBillingBtn.addEventListener('click', () => this.backToBilling());

        // History actions
        this.elements.applyFiltersBtn.addEventListener('click', () => this.applyFilters());
        this.elements.resetFiltersBtn.innerHTML = 'Clear Filters';
        this.elements.resetFiltersBtn.addEventListener('click', () => this.resetFilters());

        // Settings actions
        this.elements.saveShopSettings.addEventListener('click', () => this.saveShopSettings());
        this.elements.addNewItemBtn.addEventListener('click', () => this.addNewMenuItem());
        this.elements.exportJsonBtn.addEventListener('click', () => this.exportData('json'));
        this.elements.exportCsvBtn.addEventListener('click', () => this.exportData('csv'));
        this.elements.importDataBtn.addEventListener('click', () => this.importData());
        this.elements.resetTodayBtn.addEventListener('click', () => this.resetData('today'));
        this.elements.resetAllBtn.addEventListener('click', () => this.resetData('all'));
        this.elements.checkUpdatesBtn.addEventListener('click', () => this.checkForUpdates());

        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Populate settings form
        this.populateSettingsForm();

        // Initialize date filters
        this.initializeDateFilters();

        // Handle browser back button
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.view) {
                this.switchView(event.state.view, false);
            }
        });

        // Initialize router based on current URL hash
        const initialView = location.hash ? location.hash.substring(1) : 'billing';
        if (location.hash) {
            this.switchView(initialView, false); // Don't push state for initial load
            history.replaceState({ view: initialView }, '', `#${initialView}`);
        } else {
            history.replaceState({ view: 'billing' }, '', '#billing');
        }
    }

    // ========================================================================
    // Default Data
    // ========================================================================

    /**
     * Get default settings
     */
    getDefaultSettings() {
        return {
            shopName: 'Tiffin Shop',
            shopAddress: 'Chennai, Tamil Nadu',
            taxPercentage: 5,
            defaultUpiId: 'shop@upi',
            currency: '₹'
        };
    }

    /**
     * Get default menu items with Unsplash images
     */
    /**
  * Get default menu items with correct Unsplash images
  */
    /**
     * Get default menu items with reliable image URLs
     */
    getDefaultMenuItems() {
        return [
            {
                id: 'idly',
                english: 'Idly',
                tamil: 'இட்லி',
                price: 30,
                image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'dosa',
                english: 'Dosa',
                tamil: 'தோசை',
                price: 40,
                image: 'asset/dosa.jpg'
            },
            {
                id: 'masala-dosa',
                english: 'Masala Dosa',
                tamil: 'மசாலா தோசை',
                price: 60,
                image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'pongal',
                english: 'Pongal',
                tamil: 'பொங்கல்',
                price: 40,
                image: 'asset/pongal.jpg'
            },
            {
                id: 'poori',
                english: 'Poori',
                tamil: 'பூரி',
                price: 50,
                image: 'asset/poori.jpg'
            },
            {
                id: 'vada',
                english: 'Vada',
                tamil: 'வடை',
                price: 25,
                image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
            },
            {
                id: 'chapathi',
                english: 'Chapathi',
                tamil: 'சப்பாத்தி',
                price: 35,
                image: 'asset/chappathi.jpg'
            }
        ];
    }

    // ========================================================================
    // Menu Items Management
    // ========================================================================

    /**
     * Render menu items to the food grid
     */
    renderMenuItems() {
        this.elements.foodGrid.innerHTML = '';

        this.state.menuItems.forEach(item => {
            const itemElement = this.createMenuItemElement(item);
            this.elements.foodGrid.appendChild(itemElement);
        });
    }

    /**
     * Create a menu item element
     */
    createMenuItemElement(item) {
        const div = document.createElement('div');
        div.className = 'food-item';
        div.dataset.id = item.id;

        div.innerHTML = `
            <img src="${item.image}" alt="${item.english}" class="food-item-image" loading="lazy">
            <div class="food-item-content">
                <div class="food-item-name">${item.english}</div>
                <div class="food-item-tamil">${item.tamil}</div>
                <div class="food-item-price">
                    <span>${this.state.settings.currency}${item.price}</span>
                    <button class="food-item-add" aria-label="Add ${item.english} to cart">+</button>
                </div>
            </div>
        `;

        // Add event listener
        div.querySelector('.food-item-add').addEventListener('click', (e) => {
            e.stopPropagation();
            this.addToCart(item);
        });

        // Whole card is clickable
        div.addEventListener('click', () => this.addToCart(item));

        return div;
    }

    /**
     * Render menu items in settings
     */
    renderSettingsMenuItems() {
        this.elements.menuItemsList.innerHTML = '';

        this.state.menuItems.forEach(item => {
            const itemElement = this.createSettingsMenuItemElement(item);
            this.elements.menuItemsList.appendChild(itemElement);
        });
    }

    /**
     * Create a menu item element for settings
     */
    createSettingsMenuItemElement(item) {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.dataset.id = item.id;

        div.innerHTML = `
            <img src="${item.image}" alt="${item.english}" class="menu-item-image" loading="lazy">
            <div class="menu-item-details">
                <div class="menu-item-name">
                    <strong>${item.english}</strong> - ${item.tamil}
                </div>
                <div class="menu-item-price-input-group">
                    <label>Price (₹): </label>
                    <input type="number" class="menu-item-price-input" value="${item.price}" min="1" step="5">
                </div>
            </div>
            <button class="menu-item-remove" aria-label="Remove ${item.english}">🗑️</button>
        `;

        // Add event listeners
        const priceInput = div.querySelector('.menu-item-price-input');
        priceInput.addEventListener('change', (e) => {
            this.updateMenuItemPrice(item.id, parseFloat(e.target.value));
        });

        const removeBtn = div.querySelector('.menu-item-remove');
        removeBtn.addEventListener('click', () => {
            this.removeMenuItem(item.id);
        });

        return div;
    }

    /**
     * Update menu item price
     */
    updateMenuItemPrice(itemId, newPrice) {
        const itemIndex = this.state.menuItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            this.state.menuItems[itemIndex].price = newPrice;
            this.saveToStorage();
            this.renderMenuItems();
            this.showToast('Price updated successfully', 'success');
        }
    }

    /**
     * Remove menu item
     */
    removeMenuItem(itemId) {
        if (this.state.menuItems.length <= 1) {
            this.showToast('Cannot remove the last menu item', 'error');
            return;
        }

        if (confirm('Are you sure you want to remove this item?')) {
            this.state.menuItems = this.state.menuItems.filter(item => item.id !== itemId);
            this.saveToStorage();
            this.renderMenuItems();
            this.renderSettingsMenuItems();
            this.showToast('Item removed successfully', 'success');
        }
    }

    /**
     * Add new menu item
     */
    addNewMenuItem() {
        const english = this.elements.newItemEnglish.value.trim();
        const tamil = this.elements.newItemTamil.value.trim();
        const price = parseFloat(this.elements.newItemPrice.value);
        const image = this.elements.newItemImage.value.trim() ||
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop';

        // Validation
        if (!english || !tamil || isNaN(price) || price <= 0) {
            this.showToast('Please fill all fields correctly', 'error');
            return;
        }

        // Create new item
        const newItem = {
            id: english.toLowerCase().replace(/\s+/g, '-'),
            english,
            tamil,
            price,
            image
        };

        // Check for duplicates
        if (this.state.menuItems.some(item => item.id === newItem.id)) {
            this.showToast('Item with this name already exists', 'error');
            return;
        }

        // Add to menu
        this.state.menuItems.push(newItem);
        this.saveToStorage();

        // Clear form
        this.elements.newItemEnglish.value = '';
        this.elements.newItemTamil.value = '';
        this.elements.newItemPrice.value = '';
        this.elements.newItemImage.value = '';

        // Update UI
        this.renderMenuItems();
        this.renderSettingsMenuItems();
        this.showToast('Item added successfully', 'success');
    }

    // ========================================================================
    // Cart Management
    // ========================================================================

    /**
     * Add item to cart
     */
    addToCart(menuItem) {
        const existingItem = this.state.cart.find(item => item.id === menuItem.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.state.cart.push({
                ...menuItem,
                quantity: 1
            });
        }

        this.renderCart();
        this.updateCartSummary();
        this.showToast(`${menuItem.english} added to cart`, 'success');
    }

    /**
     * Remove item from cart
     */
    removeFromCart(itemId) {
        this.state.cart = this.state.cart.filter(item => item.id !== itemId);
        this.renderCart();
        this.updateCartSummary();
    }

    /**
     * Update item quantity in cart
     */
    updateCartQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            this.removeFromCart(itemId);
            return;
        }

        const cartItem = this.state.cart.find(item => item.id === itemId);
        if (cartItem) {
            cartItem.quantity = newQuantity;
            this.renderCart();
            this.updateCartSummary();
        }
    }

    /**
     * Clear the entire cart
     */
    clearCart() {
        if (this.state.cart.length === 0) return;

        if (confirm('Are you sure you want to clear the cart?')) {
            this.state.cart = [];
            this.renderCart();
            this.updateCartSummary();
            this.showToast('Cart cleared', 'success');
        }
    }

    /**
     * Render cart items
     */
    renderCart() {
        if (this.state.cart.length === 0) {
            this.elements.cartItems.innerHTML = `
                <div class="empty-cart">
                    <p>Your cart is empty</p>
                    <p class="empty-cart-hint">Tap on menu items to add them</p>
                </div>
            `;
            return;
        }

        let html = '';

        this.state.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-name">${item.english}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease" aria-label="Decrease quantity">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase" aria-label="Increase quantity">+</button>
                    </div>
                    <div class="cart-item-price">${this.state.settings.currency}${item.price}</div>
                    <div class="cart-item-total">${this.state.settings.currency}${itemTotal}</div>
                    <button class="cart-item-remove" aria-label="Remove item">🗑️</button>
                </div>
            `;
        });

        this.elements.cartItems.innerHTML = html;

        // Add event listeners to cart items
        this.elements.cartItems.querySelectorAll('.cart-item').forEach(itemElement => {
            const itemId = itemElement.dataset.id;

            // Decrease button
            itemElement.querySelector('.decrease').addEventListener('click', () => {
                const cartItem = this.state.cart.find(item => item.id === itemId);
                if (cartItem) {
                    this.updateCartQuantity(itemId, cartItem.quantity - 1);
                }
            });

            // Increase button
            itemElement.querySelector('.increase').addEventListener('click', () => {
                const cartItem = this.state.cart.find(item => item.id === itemId);
                if (cartItem) {
                    this.updateCartQuantity(itemId, cartItem.quantity + 1);
                }
            });

            // Remove button
            itemElement.querySelector('.cart-item-remove').addEventListener('click', () => {
                this.removeFromCart(itemId);
            });
        });
    }

    /**
     * Update cart summary
     */
    updateCartSummary() {
        const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * (this.state.settings.taxPercentage / 100);
        const total = subtotal + tax;

        // Update UI
        this.elements.itemCount.textContent = `(${this.state.cart.length} items)`;
        this.elements.subtotal.textContent = `${this.state.settings.currency}${subtotal.toFixed(2)}`;
        this.elements.taxAmount.textContent = `${this.state.settings.currency}${tax.toFixed(2)}`;
        this.elements.totalAmount.textContent = `${this.state.settings.currency}${total.toFixed(2)}`;
        this.elements.taxPercentage.textContent = this.state.settings.taxPercentage;

        // Update button states
        this.elements.clearCartBtn.disabled = this.state.cart.length === 0;
        this.elements.generateBillBtn.disabled = this.state.cart.length === 0;

        // Save cart to session storage for persistence
        sessionStorage.setItem('currentCart', JSON.stringify(this.state.cart));
    }

    // ========================================================================
    // Billing and Payment
    // ========================================================================

    /**
     * Generate a new bill
     */
    generateBill() {
        if (this.state.cart.length === 0) {
            this.showToast('Cart is empty', 'error');
            return;
        }

        // Calculate totals
        const subtotal = this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * (this.state.settings.taxPercentage / 100);
        const total = subtotal + tax;

        // Generate bill ID
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const billNumber = this.state.bills.filter(bill =>
            bill.id.startsWith(`BILL-${dateStr}`)
        ).length + 1;

        const billId = `BILL-${dateStr}-${billNumber.toString().padStart(3, '0')}`;

        // Create bill object (without payment details yet)
        this.state.currentBill = {
            id: billId,
            date: now.toISOString(),
            items: JSON.parse(JSON.stringify(this.state.cart)), // Deep copy
            subtotal,
            tax,
            total,
            paymentMethod: null,
            paymentStatus: 'pending'
        };

        // Switch to payment view
        this.switchView('payment');

        // Update payment view
        this.updatePaymentView();

        // Generate UPI QR code
        this.updateUpiQr();

        this.showToast('Bill generated successfully', 'success');
    }

    /**
     * Update payment view with bill details
     */
    updatePaymentView() {
        if (!this.state.currentBill) return;

        // Update bill ID
        document.getElementById('currentBillId').textContent = this.state.currentBill.id;

        // Update bill summary
        const summaryHtml = `
            <div class="bill-summary-content">
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${this.state.settings.currency}${this.state.currentBill.subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (${this.state.settings.taxPercentage}%):</span>
                    <span>${this.state.settings.currency}${this.state.currentBill.tax.toFixed(2)}</span>
                </div>
                <div class="summary-row total-row">
                    <span>Total:</span>
                    <span>${this.state.settings.currency}${this.state.currentBill.total.toFixed(2)}</span>
                </div>
                <div class="bill-items">
                    <h4>Items:</h4>
                    ${this.state.currentBill.items.map(item => `
                        <div class="bill-item">
                            <span>${item.english} x${item.quantity}</span>
                            <span>${this.state.settings.currency}${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        document.getElementById('billSummaryContent').innerHTML = summaryHtml;

        // Update cash input placeholder
        this.elements.cashAmount.placeholder = `Enter amount (Total: ${this.state.settings.currency}${this.state.currentBill.total.toFixed(2)})`;
        this.elements.cashAmount.value = '';
        this.elements.changeAmount.textContent = `${this.state.settings.currency}0.00`;
    }

    /**
     * Update UPI QR code
     */
    updateUpiQr() {
        if (!this.state.currentBill) return;

        const upiId = this.elements.upiId.value.trim() || this.state.settings.defaultUpiId;
        const amount = this.state.currentBill.total;
        const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(this.state.settings.shopName)}&am=${amount}&cu=INR&tn=Bill: ${this.state.currentBill.id}`;

        // Clear previous QR code
        this.elements.upiQrCode.innerHTML = '';

        // Generate new QR code
        QRCode.toCanvas(this.elements.upiQrCode, upiUrl, {
            width: 180,
            height: 180,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, function (error) {
            if (error) console.error('QR Code generation error:', error);
        });
    }

    /**
     * Calculate change for cash payment
     */
    calculateChange() {
        if (!this.state.currentBill) return;

        const cashAmount = parseFloat(this.elements.cashAmount.value) || 0;
        const total = this.state.currentBill.total;
        const change = cashAmount - total;

        this.elements.changeAmount.textContent = `${this.state.settings.currency}${Math.max(0, change).toFixed(2)}`;

        // Update button state
        this.elements.confirmCashBtn.disabled = cashAmount < total;
    }

    /**
     * Complete payment
     */
    completePayment(method) {
        if (!this.state.currentBill) return;

        let paymentDetails = {};

        if (method === 'cash') {
            const cashAmount = parseFloat(this.elements.cashAmount.value);
            if (!cashAmount || cashAmount < this.state.currentBill.total) {
                this.showToast('Please enter sufficient cash amount', 'error');
                return;
            }

            paymentDetails = {
                method: 'cash',
                cashReceived: cashAmount,
                changeGiven: cashAmount - this.state.currentBill.total
            };
        } else if (method === 'upi') {
            paymentDetails = {
                method: 'upi',
                upiId: this.elements.upiId.value.trim() || this.state.settings.defaultUpiId
            };
        }

        // Update bill with payment details
        this.state.currentBill.paymentMethod = paymentDetails.method;
        this.state.currentBill.paymentDetails = paymentDetails;
        this.state.currentBill.paymentStatus = 'completed';
        this.state.currentBill.completedAt = new Date().toISOString();

        // Add to bills history
        this.state.bills.unshift(this.state.currentBill);

        // Save to storage
        this.saveToStorage();

        // Show success message
        this.showToast(`Payment completed via ${method.toUpperCase()}`, 'success');

        // Show receipt options
        this.showReceiptOptions();
    }

    /**
     * Show receipt options after payment
     */
    showReceiptOptions() {
        const modalHtml = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Payment Successful!</h3>
                    <button class="modal-close" aria-label="Close">×</button>
                </div>
                <div class="modal-body">
                    <p>Bill ${this.state.currentBill.id} has been completed successfully.</p>
                    <p>Total Amount: <strong>${this.state.settings.currency}${this.state.currentBill.total.toFixed(2)}</strong></p>
                    <p>Payment Method: <strong>${this.state.currentBill.paymentMethod.toUpperCase()}</strong></p>
                    <div class="modal-actions">
                        <button id="printNowBtn" class="btn btn-primary">Print Receipt</button>
                        <button id="newBillBtn" class="btn btn-secondary">New Bill</button>
                    </div>
                </div>
            </div>
        `;

        this.showModal(modalHtml);

        // Add event listeners
        setTimeout(() => {
            document.getElementById('printNowBtn').addEventListener('click', () => {
                this.printReceipt();
                this.closeModal();
                this.resetForNewBill();
            });

            document.getElementById('newBillBtn').addEventListener('click', () => {
                this.closeModal();
                this.resetForNewBill();
            });

            document.querySelector('.modal-close').addEventListener('click', () => {
                this.closeModal();
                this.resetForNewBill();
            });
        }, 100);
    }

    /**
     * Edit current bill (go back to billing)
     */
    editBill() {
        if (confirm('Go back to edit the bill? Current payment information will be lost.')) {
            this.backToBilling();
        }
    }

    /**
     * Print receipt
     */
    printReceipt() {
        if (!this.state.currentBill) return;

        const printContent = document.getElementById('printContent');
        const now = new Date(this.state.currentBill.completedAt || new Date());

        const receiptHtml = `
            <div class="receipt">
                <div class="receipt-header">
                    <h2>${this.state.settings.shopName}</h2>
                    <p>${this.state.settings.shopAddress}</p>
                    <p>${now.toLocaleDateString()} ${now.toLocaleTimeString()}</p>
                </div>
                <div class="receipt-body">
                    <div class="receipt-info">
                        <p><strong>Bill ID:</strong> ${this.state.currentBill.id}</p>
                        <p><strong>Payment Method:</strong> ${this.state.currentBill.paymentMethod.toUpperCase()}</p>
                    </div>
                    <table class="receipt-items">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.state.currentBill.items.map(item => `
                                <tr>
                                    <td>${item.english}</td>
                                    <td>${item.quantity}</td>
                                    <td>${this.state.settings.currency}${item.price}</td>
                                    <td>${this.state.settings.currency}${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="receipt-totals">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>${this.state.settings.currency}${this.state.currentBill.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span>Tax (${this.state.settings.taxPercentage}%):</span>
                            <span>${this.state.settings.currency}${this.state.currentBill.tax.toFixed(2)}</span>
                        </div>
                        <div class="total-row grand-total">
                            <span>Grand Total:</span>
                            <span>${this.state.settings.currency}${this.state.currentBill.total.toFixed(2)}</span>
                        </div>
                        ${this.state.currentBill.paymentMethod === 'cash' ? `
                            <div class="total-row">
                                <span>Cash Received:</span>
                                <span>${this.state.settings.currency}${this.state.currentBill.paymentDetails.cashReceived.toFixed(2)}</span>
                            </div>
                            <div class="total-row">
                                <span>Change:</span>
                                <span>${this.state.settings.currency}${this.state.currentBill.paymentDetails.changeGiven.toFixed(2)}</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="receipt-footer">
                        <p>Thank you for your business!</p>
                        <p>Visit again!</p>
                    </div>
                </div>
            </div>
        `;

        printContent.innerHTML = receiptHtml;

        // Add print styles
        const style = document.createElement('style');
        style.innerHTML = `
            .receipt {
                width: 80mm;
                margin: 0 auto;
                font-family: monospace;
                font-size: 12px;
                padding: 10px;
            }
            .receipt-header {
                text-align: center;
                margin-bottom: 15px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
            }
            .receipt-header h2 {
                margin: 0;
                font-size: 16px;
            }
            .receipt-items {
                width: 100%;
                border-collapse: collapse;
                margin: 10px 0;
            }
            .receipt-items th,
            .receipt-items td {
                padding: 4px;
                text-align: left;
                border-bottom: 1px dashed #ccc;
            }
            .receipt-totals {
                margin: 15px 0;
                border-top: 2px solid #000;
                padding-top: 10px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 4px 0;
            }
            .grand-total {
                font-weight: bold;
                font-size: 14px;
                margin-top: 8px;
                border-top: 1px solid #000;
                padding-top: 8px;
            }
            .receipt-footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 1px dashed #000;
                font-style: italic;
            }
            @media print {
                body * {
                    visibility: hidden;
                }
                .receipt,
                .receipt * {
                    visibility: visible;
                }
                .receipt {
                    position: absolute;
                    left: 0;
                    top: 0;
                }
            }
        `;
        printContent.appendChild(style);

        // Trigger print
        setTimeout(() => {
            window.print();
        }, 100);
    }

    /**
     * Go back to billing view
     */
    backToBilling() {
        this.switchView('billing');
        this.state.currentBill = null;
    }

    /**
     * Reset for new bill
     */
    resetForNewBill() {
        this.state.cart = [];
        this.state.currentBill = null;
        this.renderCart();
        this.updateCartSummary();
        this.switchView('billing');
    }

    // ========================================================================
    // History and Analytics
    // ========================================================================

    /**
     * Initialize date filters
     */
    initializeDateFilters() {
        const today = new Date().toISOString().split('T')[0];
        const firstDayOfMonth = new Date();
        firstDayOfMonth.setDate(1);
        const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];

        this.elements.startDate.value = firstDayStr;
        this.elements.endDate.value = today;

        // Update history on initialization
        this.updateHistory();
    }

    /**
     * Apply filters to history
     */
    applyFilters() {
        this.updateHistory();
    }

    /**
     * Reset filters
     */
    resetFilters() {
        this.initializeDateFilters();
        this.elements.paymentMethodFilter.value = 'all';
        this.elements.searchBills.value = '';
        this.updateHistory();
    }

    /**
     * Update history view
     */
    updateHistory() {
        const filteredBills = this.filterBills();
        this.renderHistoryList(filteredBills);
        this.updateDashboard();
        this.updateCharts(filteredBills);
    }

    /**
     * Filter bills based on criteria
     */
    filterBills() {
        let filtered = [...this.state.bills];

        // Date range filter
        const startDate = this.elements.startDate.value;
        const endDate = this.elements.endDate.value;

        if (startDate && endDate) {
            filtered = filtered.filter(bill => {
                const billDate = bill.date.split('T')[0];
                return billDate >= startDate && billDate <= endDate;
            });
        }

        // Payment method filter
        const paymentMethod = this.elements.paymentMethodFilter.value;
        if (paymentMethod !== 'all') {
            filtered = filtered.filter(bill => bill.paymentMethod === paymentMethod);
        }

        // Search filter
        const searchTerm = this.elements.searchBills.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(bill =>
                bill.id.toLowerCase().includes(searchTerm)
            );
        }

        return filtered;
    }

    /**
     * Render history list
     */
    renderHistoryList(bills) {
        if (bills.length === 0) {
            this.elements.historyList.innerHTML = `
                <div class="empty-history">
                    <p>No bills found for the selected filters</p>
                </div>
            `;
            return;
        }

        let html = '';

        bills.forEach(bill => {
            const date = new Date(bill.date);
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            html += `
                <div class="history-item" data-id="${bill.id}">
                    <div class="history-item-header">
                        <span class="history-item-id">${bill.id}</span>
                        <span class="history-item-date">${formattedDate} ${formattedTime}</span>
                    </div>
                    <div class="history-item-details">
                        <span class="history-item-method">${bill.paymentMethod.toUpperCase()}</span>
                        <span class="history-item-total">${this.state.settings.currency}${bill.total.toFixed(2)}</span>
                    </div>
                    <button class="history-item-expand" aria-label="View details">
                        <span class="expand-icon">▼</span>
                        Details
                    </button>
                    <div class="history-item-content">
                        <div class="bill-details">
                            <p><strong>Items:</strong></p>
                            <ul>
                                ${bill.items.map(item => `
                                    <li>${item.english} x${item.quantity} = ${this.state.settings.currency}${(item.price * item.quantity).toFixed(2)}</li>
                                `).join('')}
                            </ul>
                            <p><strong>Subtotal:</strong> ${this.state.settings.currency}${bill.subtotal.toFixed(2)}</p>
                            <p><strong>Tax:</strong> ${this.state.settings.currency}${bill.tax.toFixed(2)}</p>
                            <p><strong>Total:</strong> ${this.state.settings.currency}${bill.total.toFixed(2)}</p>
                            ${bill.paymentMethod === 'cash' ? `
                                <p><strong>Cash Received:</strong> ${this.state.settings.currency}${bill.paymentDetails.cashReceived.toFixed(2)}</p>
                                <p><strong>Change Given:</strong> ${this.state.settings.currency}${bill.paymentDetails.changeGiven.toFixed(2)}</p>
                            ` : `
                                <p><strong>UPI ID:</strong> ${bill.paymentDetails.upiId}</p>
                            `}
                        </div>
                    </div>
                </div>
            `;
        });

        this.elements.historyList.innerHTML = html;

        // Add expand/collapse functionality
        this.elements.historyList.querySelectorAll('.history-item-expand').forEach(btn => {
            btn.addEventListener('click', function () {
                const item = this.closest('.history-item');
                item.classList.toggle('expanded');
                this.querySelector('.expand-icon').textContent =
                    item.classList.contains('expanded') ? '▲' : '▼';
            });
        });
    }

    /**
     * Update dashboard statistics
     */
    updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const currentMonth = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0');

        // Filter bills
        const todayBills = this.state.bills.filter(bill =>
            bill.date.split('T')[0] === today
        );

        const monthBills = this.state.bills.filter(bill =>
            bill.date.startsWith(currentMonth)
        );

        // Calculate statistics
        const todaySales = todayBills.reduce((sum, bill) => sum + bill.total, 0);
        const monthSales = monthBills.reduce((sum, bill) => sum + bill.total, 0);
        const avgBill = this.state.bills.length > 0 ?
            this.state.bills.reduce((sum, bill) => sum + bill.total, 0) / this.state.bills.length : 0;

        // Find most sold item
        const itemSales = {};
        this.state.bills.forEach(bill => {
            bill.items.forEach(item => {
                if (!itemSales[item.english]) {
                    itemSales[item.english] = 0;
                }
                itemSales[item.english] += item.quantity;
            });
        });

        let topItem = '-';
        let topItemQty = 0;

        Object.entries(itemSales).forEach(([item, qty]) => {
            if (qty > topItemQty) {
                topItem = item;
                topItemQty = qty;
            }
        });

        // Update UI
        this.elements.todaySales.textContent = `${this.state.settings.currency}${todaySales.toFixed(2)}`;
        this.elements.todayBills.textContent = `${todayBills.length} bills`;
        this.elements.monthSales.textContent = `${this.state.settings.currency}${monthSales.toFixed(2)}`;
        this.elements.monthBills.textContent = `${monthBills.length} bills`;
        this.elements.avgBill.textContent = `${this.state.settings.currency}${avgBill.toFixed(2)}`;
        this.elements.topItem.textContent = topItem;
        this.elements.topItemQty.textContent = `${topItemQty} sold`;
    }

    /**
     * Update charts
     */
    updateCharts(bills) {
        this.updateSalesChart(bills);
        this.updatePaymentChart(bills);
    }

    /**
     * Update sales chart
     */
    updateSalesChart(bills) {
        // Group by date
        const salesByDate = {};
        bills.forEach(bill => {
            const date = bill.date.split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = 0;
            }
            salesByDate[date] += bill.total;
        });

        const dates = Object.keys(salesByDate).sort();
        const maxSale = Math.max(...Object.values(salesByDate), 1);

        // Create bars
        let barsHtml = '';
        dates.forEach(date => {
            const sale = salesByDate[date];
            const height = (sale / maxSale) * 100;
            const shortDate = date.split('-').slice(1).join('/'); // MM/DD format

            barsHtml += `
                <div class="bar-chart-bar" 
                     style="height: ${height}%"
                     data-value="${this.state.settings.currency}${sale.toFixed(0)}"
                     title="${date}: ${this.state.settings.currency}${sale.toFixed(2)}">
                    <div class="bar-label">${shortDate}</div>
                </div>
            `;
        });

        document.querySelector('.bar-chart-bars').innerHTML = barsHtml;
    }

    /**
     * Update payment chart
     */
    updatePaymentChart(bills) {
        const upiCount = bills.filter(bill => bill.paymentMethod === 'upi').length;
        const cashCount = bills.filter(bill => bill.paymentMethod === 'cash').length;
        const total = bills.length;

        if (total === 0) {
            document.querySelector('.pie-chart').style.background =
                'conic-gradient(var(--bg-secondary) 0% 100%)';
            return;
        }

        const upiPercentage = (upiCount / total) * 100;
        const cashPercentage = (cashCount / total) * 100;

        document.querySelector('.pie-chart').style.background =
            `conic-gradient(var(--color-primary) 0% ${upiPercentage}%, var(--color-secondary) 0% 100%)`;
    }

    // ========================================================================
    // Settings Management
    // ========================================================================

    /**
     * Populate settings form
     */
    populateSettingsForm() {
        this.elements.settingsShopName.value = this.state.settings.shopName;
        this.elements.settingsShopAddress.value = this.state.settings.shopAddress;
        this.elements.settingsTax.value = this.state.settings.taxPercentage;
        this.elements.settingsDefaultUpi.value = this.state.settings.defaultUpiId;

        // Render menu items in settings
        this.renderSettingsMenuItems();

        // Update storage info
        this.updateStorageInfo();
    }

    /**
     * Save shop settings
     */
    saveShopSettings() {
        const newSettings = {
            shopName: this.elements.settingsShopName.value.trim(),
            shopAddress: this.elements.settingsShopAddress.value.trim(),
            taxPercentage: parseFloat(this.elements.settingsTax.value),
            defaultUpiId: this.elements.settingsDefaultUpi.value.trim()
        };

        // Validation
        if (!newSettings.shopName || !newSettings.shopAddress ||
            isNaN(newSettings.taxPercentage) || newSettings.taxPercentage < 0) {
            this.showToast('Please fill all fields correctly', 'error');
            return;
        }

        // Update settings
        this.state.settings = { ...this.state.settings, ...newSettings };
        this.saveToStorage();

        // Update UI
        document.getElementById('shopName').textContent = this.state.settings.shopName;
        document.getElementById('shopAddress').textContent = this.state.settings.shopAddress;
        this.updateCartSummary();

        this.showToast('Settings saved successfully', 'success');
    }

    /**
     * Update storage usage info
     */
    updateStorageInfo() {
        let totalSize = 0;

        // Calculate approximate storage usage
        ['tiffinShopSettings', 'tiffinShopMenu', 'tiffinShopBills', 'tiffinShopTheme'].forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += new Blob([data]).size;
            }
        });

        // Convert to KB
        const sizeKB = (totalSize / 1024).toFixed(2);
        this.elements.storageUsed.textContent = `${sizeKB} KB`;

        // Update bills count
        this.elements.totalBillsCount.textContent = this.state.bills.length;

        // Update last backup
        const lastBackup = localStorage.getItem('tiffinShopLastBackup');
        this.elements.lastBackup.textContent = lastBackup || 'Never';
    }

    /**
     * Export data
     */
    exportData(format) {
        const exportData = {
            settings: this.state.settings,
            menuItems: this.state.menuItems,
            bills: this.state.bills,
            exportDate: new Date().toISOString()
        };

        let dataStr, fileName, mimeType;

        if (format === 'json') {
            dataStr = JSON.stringify(exportData, null, 2);
            fileName = `tiffin-shop-backup-${new Date().toISOString().split('T')[0]}.json`;
            mimeType = 'application/json';
        } else if (format === 'csv') {
            // Create CSV for this month's bills
            const now = new Date();
            const currentMonth = now.getFullYear() + '-' + (now.getMonth() + 1).toString().padStart(2, '0');
            const monthBills = this.state.bills.filter(bill =>
                bill.date.startsWith(currentMonth)
            );

            let csv = 'Bill ID,Date,Time,Items,Subtotal,Tax,Total,Payment Method\n';

            monthBills.forEach(bill => {
                const date = new Date(bill.date);
                const dateStr = date.toLocaleDateString();
                const timeStr = date.toLocaleTimeString();
                const itemsStr = bill.items.map(item =>
                    `${item.english} x${item.quantity}`
                ).join('; ');

                csv += `"${bill.id}","${dateStr}","${timeStr}","${itemsStr}",${bill.subtotal},${bill.tax},${bill.total},${bill.paymentMethod}\n`;
            });

            dataStr = csv;
            fileName = `tiffin-shop-sales-${currentMonth}.csv`;
            mimeType = 'text/csv';
        }

        // Create download link
        const blob = new Blob([dataStr], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Update last backup time
        localStorage.setItem('tiffinShopLastBackup', new Date().toLocaleString());
        this.updateStorageInfo();

        this.showToast(`Data exported as ${format.toUpperCase()}`, 'success');
    }

    /**
     * Import data
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);

                    if (confirm('This will replace all current data. Are you sure?')) {
                        if (importedData.settings) this.state.settings = importedData.settings;
                        if (importedData.menuItems) this.state.menuItems = importedData.menuItems;
                        if (importedData.bills) this.state.bills = importedData.bills;

                        this.saveToStorage();
                        this.populateSettingsForm();
                        this.renderMenuItems();
                        this.updateHistory();

                        this.showToast('Data imported successfully', 'success');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    this.showToast('Invalid backup file', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    /**
     * Reset data
     */
    resetData(type) {
        let message = '';

        if (type === 'today') {
            const today = new Date().toISOString().split('T')[0];
            this.state.bills = this.state.bills.filter(bill =>
                !bill.date.startsWith(today)
            );
            message = 'Today\'s bills have been reset';
        } else if (type === 'all') {
            if (confirm('This will delete ALL data including settings and menu. Are you absolutely sure?')) {
                localStorage.clear();
                location.reload();
                return;
            }
        }

        this.saveToStorage();
        this.updateHistory();
        this.showToast(message, 'success');
    }

    // ========================================================================
    // UI Utilities
    // ========================================================================

    /**
     * Switch between views
     */
    switchView(viewName, pushState = true) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(view => {
            view.classList.remove('active');
        });

        // Show selected view
        document.getElementById(`${viewName}View`).classList.add('active');

        // Update navigation buttons
        this.elements.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update specific views if needed
        // Defer heavy rendering to allow UI to update immediately
        requestAnimationFrame(() => {
            if (viewName === 'history') {
                this.updateHistory();
            } else if (viewName === 'settings') {
                this.populateSettingsForm();
            }
        });

        // Update UI
        this.updateUI();

        // Push state to history
        if (pushState) {
            history.pushState({ view: viewName }, '', `#${viewName}`);
        }
    }

    /**
     * Update UI based on state
     */
    updateUI() {
        // Update shop info in header
        document.getElementById('shopName').textContent = this.state.settings.shopName;
        document.getElementById('shopAddress').textContent = this.state.settings.shopAddress;

        // Update theme icon
        const themeIcon = document.querySelector('.theme-icon');
        themeIcon.textContent = this.state.theme === 'dark' ? '☀️' : '🌙';
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const themes = ['light', 'dark', 'high-contrast'];
        const currentIndex = themes.indexOf(this.state.theme);
        const nextIndex = (currentIndex + 1) % themes.length;

        this.state.theme = themes[nextIndex];
        document.documentElement.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('tiffinShopTheme', this.state.theme);

        this.updateUI();
        this.showToast(`${this.state.theme} theme activated`, 'success');
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${this.getToastIcon(type)}</span>
            <div class="toast-content">
                <div class="toast-title">${this.getToastTitle(type)}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close">×</button>
        `;

        this.elements.toastContainer.appendChild(toast);

        // Add close button event
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }

    /**
     * Get toast icon based on type
     */
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get toast title based on type
     */
    getToastTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || titles.info;
    }

    /**
     * Show modal
     */
    showModal(html) {
        this.elements.modalContainer.innerHTML = html;
        this.elements.modalContainer.classList.add('active');

        // Close on backdrop click
        this.elements.modalContainer.addEventListener('click', (e) => {
            if (e.target === this.elements.modalContainer) {
                this.closeModal();
            }
        });
    }

    /**
     * Close modal
     */
    closeModal() {
        this.elements.modalContainer.classList.remove('active');
        this.elements.modalContainer.innerHTML = '';
    }

    /**
     * Check for updates
     */
    checkForUpdates() {
        this.showToast('You have the latest version', 'info');
    }

    // ========================================================================
    // PWA and Offline Features
    // ========================================================================

    /**
     * Setup service worker
     */
    setupServiceWorker() {
        // Service worker is registered in the HTML file
        // Additional service worker logic can be added here
    }

    /**
     * Setup offline detection
     */
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.elements.offlineIndicator.classList.remove('offline');
            this.elements.offlineIndicator.querySelector('.offline-text').textContent = 'Online';
            this.showToast('You are back online', 'success');
        });

        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.elements.offlineIndicator.classList.add('offline');
            this.elements.offlineIndicator.querySelector('.offline-text').textContent = 'Offline';
            this.showToast('You are offline. App will continue to work locally.', 'warning');
        });

        // Initial check
        this.state.isOnline = navigator.onLine;
        if (!this.state.isOnline) {
            this.elements.offlineIndicator.classList.add('offline');
            this.elements.offlineIndicator.querySelector('.offline-text').textContent = 'Offline';
        }
    }
}

// ============================================================================
// Initialize the Application
// ============================================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and initialize the app
    window.tiffinApp = new TiffinBillingApp();

    // Add any additional initialization here

    // Example: Load cart from session storage
    const savedCart = sessionStorage.getItem('currentCart');
    if (savedCart) {
        try {
            window.tiffinApp.state.cart = JSON.parse(savedCart);
            window.tiffinApp.renderCart();
            window.tiffinApp.updateCartSummary();
        } catch (e) {
            console.error('Error loading cart from session:', e);
        }
    }
});

// ============================================================================
// Service Worker File (sw.js) - to be created separately
// ============================================================================

// Note: The service worker file needs to be created separately.
// Here's a basic template for sw.js:

/*
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open('tiffin-shop-v1').then(cache => {
            return cache.addAll([
                './',
                './index.html',
                './style.css',
                './script.js',
                'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js'
            ]);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
*/

// ============================================================================
// Manifest File (manifest.json) - to be created separately
// ============================================================================

/*
{
    "name": "Tiffin Shop Billing",
    "short_name": "Tiffin Bill",
    "description": "Offline billing app for roadside tiffin shops",
    "start_url": "./",
    "display": "standalone",
    "background_color": "#0d6efd",
    "theme_color": "#0d6efd",
    "orientation": "portrait-primary",
    "icons": [
        {
            "src": "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🥘</text></svg>",
            "sizes": "192x192",
            "type": "image/svg+xml"
        }
    ]
}
*/
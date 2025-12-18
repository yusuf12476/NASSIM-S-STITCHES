/*
 * Nassim's Stitches - Cart Functionality
 * This script handles adding items to the cart, updating quantities,
 * removing items, and displaying cart data on the cart and checkout pages.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Core Cart Functions ---

    /**
     * Adds a product to the cart. This function is exposed globally.
     * @param {object} product - The product to add.
     */
    window.addToCart = (product) => {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        saveCart(cart);
        showToast(`${product.name} has been added to your cart!`);
    };

    /**
     * Clears all items from the cart. This function is exposed globally.
     */
    window.clearCart = () => {
        localStorage.removeItem('nassimStitchesCart');
        localStorage.removeItem('orderDetails');
        updateCartCount();
    };

    const cartCountElements = document.querySelectorAll('.cart-count');

    // --- Helper Functions ---

    /**
     * Retrieves the cart from localStorage.
     * @returns {Array} The cart items.
     */
    const getCart = () => {
        return JSON.parse(localStorage.getItem('nassimStitchesCart')) || [];
    };

    /**
     * Saves the cart to localStorage.
     * @param {Array} cart - The cart items to save.
     */
    const saveCart = (cart) => {
        localStorage.setItem('nassimStitchesCart', JSON.stringify(cart));
        updateCartCount();
    };

    /**
     * Updates the cart count display in the header.
     */
    const updateCartCount = () => {
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(el => {
            if (totalItems > 0) {
                el.textContent = totalItems;
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        });
    };

    /**
     * Displays a toast notification.
     * @param {string} message - The message to display.
     */
    const showToast = (message) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        container.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Animate out and remove
        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 3000);
    };

    /**
     * Updates the quantity of an item in the cart.
     * @param {string} productId - The ID of the product to update.
     * @param {number} quantity - The new quantity.
     */
    const updateQuantity = (productId, quantity) => {
        let cart = getCart();
        if (quantity < 1) {
            cart = cart.filter(item => item.id !== productId);
        } else {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity = quantity;
            }
        }
        saveCart(cart);
        initCartPage(); // Re-render the cart page
    };

    /**
     * Removes an item from the cart.
     * @param {string} productId - The ID of the product to remove.
     */
    const removeItemFromCart = (productId) => {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart); // Save cart first
        initCartPage(); // Then re-render the cart page
        showToast('Item removed from cart.');
    };    
    /**
     * Initializes the checkout page functionality by rendering the order summary.
     */
    const initCheckoutPage = () => {
        const summaryContainer = document.getElementById('order-summary-items');
        const subtotalEl = document.getElementById('order-subtotal');
        const totalEl = document.getElementById('order-total');
        const placeOrderBtn = document.getElementById('place-order-btn');
        const orderSummaryInput = document.getElementById('order-summary-input');

        if (!summaryContainer) return; // Only run if we are on the checkout page

        const cart = getCart();
        summaryContainer.innerHTML = '';
        let subtotal = 0;
        let summaryText = '';

        if (cart.length === 0) {
            summaryContainer.innerHTML = '<p>Your cart is empty. Please add items to your cart before checking out.</p>';
            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
                placeOrderBtn.classList.add('btn-disabled');
            }
            if (subtotalEl) subtotalEl.textContent = `Ksh 0`;
            if (totalEl) totalEl.textContent = `Ksh 0`;
            return;
        }

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'summary-item';
            itemDiv.innerHTML = `
                <span>${item.name} &times; ${item.quantity}</span>
                <span>Ksh ${itemTotal.toLocaleString()}</span>
            `;
            summaryContainer.appendChild(itemDiv);
            summaryText += `${item.name} x ${item.quantity} - Ksh ${itemTotal.toLocaleString()}\n`;
        });

        if (subtotalEl) subtotalEl.textContent = `Ksh ${subtotal.toLocaleString()}`;
        if (totalEl) totalEl.textContent = `Ksh ${subtotal.toLocaleString()}`;
        if (orderSummaryInput) {
            orderSummaryInput.value = `Order Total: Ksh ${subtotal.toLocaleString()}\n\nItems:\n${summaryText}`;
        }
        if (placeOrderBtn) {
            placeOrderBtn.disabled = false;
            placeOrderBtn.classList.remove('btn-disabled');
        }
    };

    /**
     * Initializes the cart page by finding elements and rendering items.
     */
    const initCartPage = () => {
        const cartItemsContainer = document.querySelector('.cart-table tbody');
        if (!cartItemsContainer) return; // Only run if we are on the cart page

        // Select elements within this function's scope
        const cartSubtotalElement = document.getElementById('cart-subtotal');
        const cartTotalElement = document.getElementById('cart-total');
        const checkoutBtn = document.querySelector('.checkout-btn');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotalContainer = document.querySelector('.cart-totals');

        const cart = getCart();
        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartTotalContainer) cartTotalContainer.style.display = 'none';
            if (checkoutBtn) checkoutBtn.classList.add('btn-disabled');
            return;
        }

        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartTotalContainer) cartTotalContainer.style.display = 'block';

        let subtotal = 0;

        cart.forEach(item => {
            const itemSubtotal = item.price * item.quantity;
            subtotal += itemSubtotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.img}" alt="${item.name}" class="cart-item-image"></td>
                <td>${item.name}</td>
                <td>Ksh ${item.price.toLocaleString()}</td>
                <td><input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" data-id="${item.id}"></td>
                <td>Ksh ${itemSubtotal.toLocaleString()}</td>
                <td><button class="cart-remove-btn" data-id="${item.id}" aria-label="Remove ${item.name}">&times;</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });

        if (cartSubtotalElement) cartSubtotalElement.textContent = `Ksh ${subtotal.toLocaleString()}`;
        if (cartTotalElement) cartTotalElement.textContent = `Ksh ${subtotal.toLocaleString()}`;
        if (checkoutBtn) checkoutBtn.classList.remove('btn-disabled');

        // Add event listeners for new elements
        document.querySelectorAll('.cart-item-quantity').forEach(input => {
            input.addEventListener('change', (e) => {
                const newQuantity = parseInt(e.target.value, 10);
                updateQuantity(e.target.dataset.id, newQuantity);
            });
        });

        // --- Remove Item Modal Logic ---
        const removeModal = document.getElementById('remove-confirm-modal');
        if (!removeModal) return; // Exit if modal isn't on this page

        const confirmRemoveBtn = document.getElementById('confirm-remove-btn');
        const cancelRemoveBtn = document.getElementById('cancel-remove-btn');
        const closeRemoveModalBtn = removeModal.querySelector('.close-button');
        let productIdToRemove = null;

        const openRemoveModal = (productId) => {
            productIdToRemove = productId;
            removeModal.classList.add('show');
        };

        const closeRemoveModal = () => {
            productIdToRemove = null;
            removeModal.classList.remove('show');
        };

        document.querySelectorAll('.cart-remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                openRemoveModal(e.currentTarget.dataset.id);
            });
        });

        confirmRemoveBtn.addEventListener('click', () => {
            if (productIdToRemove) {
                removeItemFromCart(productIdToRemove);
            }
            closeRemoveModal();
        });

        cancelRemoveBtn.addEventListener('click', closeRemoveModal);
        closeRemoveModalBtn.addEventListener('click', closeRemoveModal);
    };

    // --- Initializations ---

    updateCartCount();
    initCartPage();
    initCheckoutPage();
});
document.addEventListener('DOMContentLoaded', function() {
    renderCart();
});

function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cartItems');
    const subtotal = document.getElementById('subtotal');
    const total = document.getElementById('total');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <span>🛒</span>
                <h3>Your cart is empty</h3>
                <p>Browse our collection and find something you'll love.</p>
                <a href="/products.html" class="btn-primary">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    let cartTotal = 0;
    
    container.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.qty;
        cartTotal += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    ${item.variant ? `<span class="cart-item-variant">${item.variant}</span>` : ''}
                    <span class="cart-item-price">Rs. ${item.price.toLocaleString()} × ${item.qty}</span>
                </div>
                <div class="cart-item-actions">
                    <button onclick="updateCartItem(${index}, -1)" class="qty-btn">−</button>
                    <span class="qty-display">${item.qty}</span>
                    <button onclick="updateCartItem(${index}, 1)" class="qty-btn">+</button>
                    <button onclick="removeCartItem(${index})" class="remove-btn">✕</button>
                </div>
                <div class="cart-item-total">
                    Rs. ${itemTotal.toLocaleString()}
                </div>
            </div>
        `;
    }).join('');
    
    const shipping = cartTotal >= 2000 ? 0 : 200;
    const grandTotal = cartTotal + shipping;
    
    subtotal.textContent = `Rs. ${cartTotal.toLocaleString()}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'Free' : `Rs. ${shipping}`;
    total.textContent = `Rs. ${grandTotal.toLocaleString()}`;
}

function updateCartItem(index, change) {
    let cart = getCart();
    if (!cart[index]) return;
    
    cart[index].qty += change;
    if (cart[index].qty < 1) {
        cart.splice(index, 1);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function removeCartItem(index) {
    let cart = getCart();
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    showToast('Item removed from cart');
}



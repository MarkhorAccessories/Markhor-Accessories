// ===== CONFIGURATION =====
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXH53aGzWPaUzApf2Rg-t7wkyDbaxqJYQCTCT7T4Nk2q-c7-OmI9S3L3qK0eqDxjk6Bw/exec'
const WA_NUMBER = '923121784537';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    loadOrderSummary();
    setupForm();
    updateCartCount();
});

// ===== LOAD ORDER SUMMARY =====
function loadOrderSummary() {
    const cart = getCart();
    const container = document.getElementById('orderSummaryItems');
    const totalEl = document.getElementById('orderTotal');
    
    console.log('Cart items:', cart); // Debug ke liye
    
    if (!cart || cart.length === 0) {
        container.innerHTML = `
            <div class="empty-summary">
                <p>Your cart is empty.</p>
                <a href="/products.html" class="btn-view">Shop Now</a>
            </div>
        `;
        totalEl.textContent = 'Rs. 0';
        return;
    }
    
    let total = 0;
    container.innerHTML = cart.map(function(item) {
        const itemTotal = item.price * item.qty;
        total += itemTotal;
        return `
            <div class="summary-item">
                <span>${item.name} × ${item.qty}</span>
                <span>Rs. ${itemTotal.toLocaleString()}</span>
            </div>
        `;
    }).join('');
    
    totalEl.textContent = 'Rs. ' + total.toLocaleString();
}

// ===== CART FUNCTIONS =====
function getCart() {
    const cart = localStorage.getItem('cart');
    if (!cart) return [];
    try {
        return JSON.parse(cart);
    } catch(e) {
        return [];
    }
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce(function(sum, item) {
        return sum + (item.price * item.qty);
    }, 0);
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce(function(sum, item) {
        return sum + item.qty;
    }, 0);
    document.querySelectorAll('#cart-count').forEach(function(el) {
        el.textContent = count;
    });
}

// ===== FORM SETUP =====
function setupForm() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    
    // Payment option selection
    document.querySelectorAll('.payment-option').forEach(function(option) {
        option.addEventListener('click', function() {
            document.querySelectorAll('.payment-option').forEach(function(o) {
                o.classList.remove('active');
            });
            this.classList.add('active');
            this.querySelector('input[type="radio"]').checked = true;
        });
    });
    
    form.addEventListener('submit', handleSubmit);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const cart = getCart();
    if (!cart || cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    
    const form = e.target;
    const formData = new FormData(form);
    
    const customer = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        whatsapp: formData.get('whatsapp'),
        city: formData.get('city'),
        address: formData.get('address'),
        notes: formData.get('notes') || '',
        payment: formData.get('payment') || 'COD'
    };
    
    if (!customer.name || !customer.phone || !customer.whatsapp || !customer.city || !customer.address) {
        showToast('Please fill in all required fields');
        return;
    }
    
    const payload = {
        items: cart,
        customer: customer
    };
    
    try {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;
        
        console.log('Sending to:', SCRIPT_URL);
        console.log('Payload:', payload);
        
        // ===== CORS FIX: mode and headers =====
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',  // ← IMPORTANT
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        // ===== no-cors mode mein response.json() kaam nahi karega =====
        // Isliye hum assume karte hain ke order save ho gaya
        
        // Order successful (assume)
        form.style.display = 'none';
        document.querySelector('.order-summary').style.display = 'none';
        document.getElementById('orderSuccess').style.display = 'block';
        
        const orderId = 'MK' + Date.now();
        document.getElementById('orderIdDisplay').textContent = orderId;
        
        const msg = 'Hi Markhor Accessories! I just placed order ' + orderId + '.\n\nCustomer: ' + customer.name + '\nPhone: ' + customer.phone + '\nWhatsApp: ' + customer.whatsapp + '\nCity: ' + customer.city + '\nAddress: ' + customer.address + '\n\nItems: ' + cart.map(function(i) { return i.name + ' x' + i.qty; }).join(', ') + '\nTotal: Rs. ' + getCartTotal() + '\nPayment: ' + customer.payment;
        
        // WhatsApp button on success page
const waBtn = document.getElementById('whatsappSuccessBtn');
if (waBtn) {
    waBtn.href = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}
        
        clearCart();
        updateCartCount();
        
        showToast('Order placed successfully! 🎉');
        
    } catch (error) {
        console.error('Order error:', error);
        showToast('Something went wrong. Please try again or contact us on WhatsApp.');
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Place Order ✨';
        submitBtn.disabled = false;
    }
}

// ===== TOAST =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}
// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Update Cart Count
    updateCartCount();

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });
});

// ===== CART FUNCTIONS =====
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#cart-count').forEach(el => {
        el.textContent = count;
    });
}

function addToCart(productId, name, price, qty = 1, variant = null) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(item => item.id === productId && item.variant === variant);
    
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ id: productId, name, price, qty, variant });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show feedback
    showToast('Added to cart! 🛒');
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartCount();
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
}

// ===== TOAST NOTIFICATION =====
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ===== PRODUCT CARD RENDERER =====
function renderProductCard(product) {
    return `
        <div class="product-card" data-id="${product.id}" data-category="${product.category}">
            ${product.badge ? `<span class="product-badge ${product.badge.toLowerCase()}">${product.badge}</span>` : ''}
            <div class="product-image">
                <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">
                    <span class="current">Rs. ${product.price.toLocaleString()}</span>
                    ${product.compareAtPrice ? `<span class="original">Rs. ${product.compareAtPrice.toLocaleString()}</span>` : ''}
                </div>
                <div class="product-actions">
                    <a href="/product.html?slug=${product.slug}" class="btn-view">View Details</a>
                    <button onclick="addToCart('${product.id}', '${product.name}', ${product.price})" class="btn-add">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// ===== FILTER AND SORT =====
function filterProducts(products, category) {
    if (category === 'all') return products;
    return products.filter(p => p.category === category);
}

function sortProducts(products, sortType) {
    const sorted = [...products];
    switch(sortType) {
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}
// ===== SEARCH FUNCTION =====
function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
    }
}

// Enter key se search
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
});
// ===== FLOATING WHATSAPP BUTTON =====
function addWhatsAppButton() {
    // Check if button already exists
    if (document.querySelector('.whatsapp-float')) return;
    
    const button = document.createElement('a');
    button.href = 'https://wa.me/923121784537?text=Hi%20Markhor%20Accessories!%20I%20have%20a%20question%20about%20your%20products.';
    button.className = 'whatsapp-float';
    button.target = '_blank';
    button.rel = 'noopener noreferrer';
    button.setAttribute('aria-label', 'Chat on WhatsApp');
    button.innerHTML = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span class="whatsapp-tooltip">Chat with us! 💬</span>
    `;
    document.body.appendChild(button);
}

// Call on every page
document.addEventListener('DOMContentLoaded', addWhatsAppButton);
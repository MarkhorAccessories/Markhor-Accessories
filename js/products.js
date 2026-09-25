document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/data/products.json');
        const products = await response.json();
        
        const grid = document.getElementById('productsGrid');
        const resultsCount = document.getElementById('resultsCount');
        let currentCategory = 'all';
        let currentSort = 'default';
        
        // ===== RENDER PRODUCTS =====
        function renderProducts() {
            let filtered = products;
            
            if (currentCategory !== 'all') {
                filtered = filtered.filter(p => p.category === currentCategory);
            }
            
            let sorted = [...filtered];
            switch(currentSort) {
                case 'price-low':
                    sorted.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    sorted.sort((a, b) => b.price - a.price);
                    break;
                default:
                    break;
            }
            
            if (filtered.length === products.length) {
                resultsCount.textContent = `Showing all ${products.length} products`;
            } else {
                resultsCount.textContent = `Showing ${filtered.length} of ${products.length} products`;
            }
            
            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="no-results">
                        <h3>No products found in this category</h3>
                    </div>
                `;
                return;
            }
            
            grid.innerHTML = filtered.map(product => `
                <div class="product-card" data-id="${product.id}" onclick="window.location.href='/product.html?slug=${product.slug}'" style="cursor:pointer;">
                    ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                    <div class="product-image">
                        <img src="${product.images[0]}" alt="${product.name} - Buy Online in Pakistan | Markhor Accessories" loading="lazy" />
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="product-price">
                            <span class="current">Rs ${product.price.toLocaleString()}</span>
                            ${product.compareAtPrice ? `<span class="original">Rs ${product.compareAtPrice.toLocaleString()}</span>` : ''}
                        </div>
                        <div class="product-actions">
                            <a href="/product.html?slug=${product.slug}" class="btn-view" onclick="event.stopPropagation()">View</a>
                            <button onclick="event.stopPropagation(); addToCart('${product.id}', '${product.name}', ${product.price}, 1)" class="btn-add">Add to Cart</button>
                            <button onclick="event.stopPropagation(); orderNow('${product.id}', '${product.name}', ${product.price})" class="btn-order">Order Now</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // ===== CATEGORY FILTER =====
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentCategory = this.dataset.category;
                renderProducts();
            });
        });
        
        // ===== SORT =====
        document.getElementById('sortProducts').addEventListener('change', function() {
            currentSort = this.value;
            renderProducts();
        });
        
        // ===== SEARCH =====
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length > 0) {
                grid.innerHTML = filtered.map(product => `
                    <div class="product-card" data-id="${product.id}" onclick="window.location.href='/product.html?slug=${product.slug}'" style="cursor:pointer;">
                        ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
                        <div class="product-image">
                            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
                        </div>
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <div class="product-price">
                                <span class="current">Rs ${product.price.toLocaleString()}</span>
                                ${product.compareAtPrice ? `<span class="original">Rs ${product.compareAtPrice.toLocaleString()}</span>` : ''}
                            </div>
                            <div class="product-actions">
                                <a href="/product.html?slug=${product.slug}" class="btn-view" onclick="event.stopPropagation()">View</a>
                                <button onclick="event.stopPropagation(); addToCart('${product.id}', '${product.name}', ${product.price}, 1)" class="btn-add">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `).join('');
                resultsCount.textContent = `Showing ${filtered.length} results for "${searchQuery}"`;
                return;
            } else {
                grid.innerHTML = `<div class="no-results"><h3>No results found for "${searchQuery}"</h3></div>`;
                resultsCount.textContent = `No results found`;
                return;
            }
        }
        
        renderProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = `
            <div class="no-results">
                <h3>⚠️ Unable to load products. Please refresh.</h3>
            </div>
        `;
    }
});

// ===== SEARCH FUNCTION =====
function searchProducts() {
    const query = document.getElementById('searchInput').value.trim();
    if (query) {
        window.location.href = `/products.html?search=${encodeURIComponent(query)}`;
    }
}

// ===== ORDER NOW FUNCTION =====
function orderNow(productId, productName, productPrice) {
    localStorage.removeItem('cart');
    addToCart(productId, productName, productPrice, 1);
    window.location.href = '/checkout.html';
}

// ========================================
// ===== WHATSAPP SHARE =====
// ========================================

function setupWhatsAppShare(product) {
    const container = document.getElementById('whatsappShareContainer');
    const btn = document.getElementById('whatsappShareBtn');
    if (!btn || !container) return;
    
    const message = `Hi Markhor Accessories! I'm interested in this product:\n\n📦 *${product.name}*\n💰 Price: Rs. ${product.price.toLocaleString()}\n📝 Description: ${product.description.substring(0, 100)}...\n\nCan you please share more details?`;
    
    btn.href = `https://wa.me/923121784537?text=${encodeURIComponent(message)}`;
    container.style.display = 'block';
}

// ========================================
// ===== PRODUCT DETAIL PAGE =====
// ========================================

if (document.getElementById('productDetail')) {
    document.addEventListener('DOMContentLoaded', async function() {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');
        
        if (!slug) {
            document.getElementById('productDetail').innerHTML = `
                <div class="no-results">
                    <h3>No product selected</h3>
                </div>
            `;
            return;
        }
        
        try {
            const response = await fetch('/data/products.json');
            const products = await response.json();
            const product = products.find(p => p.slug === slug);
            
            if (!product) {
                document.getElementById('productDetail').innerHTML = `
                    <div class="no-results">
                        <h3>Product not found</h3>
                    </div>
                `;
                return;
            }
            
            renderProductDetail(product);
            
        } catch (error) {
            console.error('Error loading product:', error);
            document.getElementById('productDetail').innerHTML = `
                <div class="no-results">
                    <h3>⚠️ Unable to load product. Please refresh.</h3>
                </div>
            `;
        }
    });
}

// ===== RENDER PRODUCT DETAIL =====
function renderProductDetail(product) {
    document.title = `${product.name} - Price in Pakistan | Markhor Accessories`;
    
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    const featuresHtml = product.features ? product.features.map(f => 
        `<li>${f}</li>`
    ).join('') : '';
    
    let galleryHTML = '';
    if (product.images && product.images.length > 0) {
        galleryHTML = `
            <div class="product-gallery-main">
                <img id="mainProductImage" src="${product.images[0]}" alt="${product.name} - Premium Quality | Markhor Accessories Pakistan" />
            </div>
        `;
        
        if (product.images.length > 1) {
            galleryHTML += `
                <div class="product-gallery-thumbnails">
                    ${product.images.map((img, index) => `
                        <img src="${img}" alt="${product.name} - ${index + 1}" 
                             class="thumbnail ${index === 0 ? 'active' : ''}" 
                             onclick="changeMainImage('${img}', this)" />
                    `).join('')}
                </div>
            `;
        }
    }
    
    container.innerHTML = `
        <div class="product-gallery">
            ${galleryHTML}
        </div>
        <div class="product-detail-info">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}
            <h1>${product.name}</h1>
            <div class="product-detail-price">
                <span class="current">Rs. ${product.price.toLocaleString()}</span>
                ${product.compareAtPrice ? `<span class="original">Rs. ${product.compareAtPrice.toLocaleString()}</span>` : ''}
            </div>
            <div class="product-rating">
                <span>★★★★★</span>
                <span class="rating-count">(4.9)</span>
            </div>
            <p class="product-description">${product.description}</p>
            ${product.features ? `
                <div class="product-features">
                    <h4>Features</h4>
                    <ul>${featuresHtml}</ul>
                </div>
            ` : ''}
            
            <div class="product-quantity">
                <label>Quantity</label>
                <div class="quantity-selector">
                    <button onclick="changeQuantity(-1)">−</button>
                    <input type="number" id="productQty" value="1" min="1" max="10" />
                    <button onclick="changeQuantity(1)">+</button>
                </div>
            </div>
            
            <div class="product-detail-actions">
                <button onclick="handleAddToCart()" class="btn-primary">
                    Add to Cart 🛒
                </button>
                <button onclick="handleBuyNow()" class="btn-secondary" style="background:var(--gold); color:#17202A; padding:12px 28px; border-radius:8px; border:2px solid var(--gold-dark); font-weight:700; font-size:0.95rem; cursor:pointer; transition:0.3s; font-family:'Inter',sans-serif; flex:1;">
                    Buy Now ⚡
                </button>
            </div>
            <div class="product-trust-badges">
                <span>✅ 100% Authentic</span>
                <span>📦 Free Shipping on all products</span>
                <span>🔄 7-Day Returns</span>
            </div>
        </div>
    `;
    
    setupWhatsAppShare(product);
    loadReviews(product.id);
    setupReviewForm(product.id);
    
    fetch('/data/products.json')
        .then(r => r.json())
        .then(allProducts => {
            loadRelatedProducts(allProducts, product);
        })
        .catch(err => console.error('Error loading related products:', err));
}

// ========================================
// ===== HANDLE ADD TO CART =====
// ========================================

function handleAddToCart() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const qty = getSelectedQuantity();
    
    if (!slug) {
        showToast('Product not found!');
        return;
    }
    
    fetch('/data/products.json')
        .then(r => r.json())
        .then(products => {
            const product = products.find(p => p.slug === slug);
            if (product) {
                addToCart(product.id, product.name, product.price, qty);
                showToast('Added to cart! 🛒');
            } else {
                showToast('Product not found!');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            showToast('Something went wrong!');
        });
}

// ========================================
// ===== HANDLE BUY NOW =====
// ========================================

function handleBuyNow() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const qty = getSelectedQuantity();
    
    if (!slug) {
        showToast('Product not found!');
        return;
    }
    
    fetch('/data/products.json')
        .then(r => r.json())
        .then(products => {
            const product = products.find(p => p.slug === slug);
            if (product) {
                addToCart(product.id, product.name, product.price, qty);
                window.location.href = '/checkout.html';
            } else {
                showToast('Product not found!');
            }
        })
        .catch(err => {
            console.error('Error:', err);
            showToast('Something went wrong!');
        });
}

// ========================================
// ===== RELATED PRODUCTS =====
// ========================================

function loadRelatedProducts(products, currentProduct) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;
    
    const related = products
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    if (related.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px;">No related products found.</p>';
        return;
    }
    
    container.innerHTML = related.map(product => `
        <div class="recommendation-card" onclick="window.location.href='/product.html?slug=${product.slug}'" style="cursor:pointer;">
            <img src="${product.images[0]}" alt="${product.name}" loading="lazy" />
            <h4>${product.name}</h4>
            <span>Rs. ${product.price.toLocaleString()}</span>
            <a href="/product.html?slug=${product.slug}" class="btn-view" onclick="event.stopPropagation()">View</a>
        </div>
    `).join('');
}

// ========================================
// ===== REVIEWS SYSTEM =====
// ========================================

function loadReviews(productId) {
    const reviews = JSON.parse(localStorage.getItem('reviews_' + productId) || '[]');
    const container = document.getElementById('reviewsContainer');
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="no-reviews">
                <span>📝</span>
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const date = new Date(review.date).toLocaleDateString('en-PK', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        return `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-name">${review.name}</span>
                    <span class="review-stars">${stars}</span>
                    <span class="review-date">${date}</span>
                </div>
                <p class="review-text">${review.text}</p>
                <span class="review-verified">✓ Verified Purchase</span>
            </div>
        `;
    }).join('');
}

function saveReview(productId, name, rating, text) {
    const reviews = JSON.parse(localStorage.getItem('reviews_' + productId) || '[]');
    reviews.push({
        name: name,
        rating: parseInt(rating),
        text: text,
        date: Date.now()
    });
    localStorage.setItem('reviews_' + productId, JSON.stringify(reviews));
    loadReviews(productId);
}

function setupReviewForm(productId) {
    const form = document.getElementById('reviewForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('reviewName').value.trim();
        const rating = document.getElementById('reviewRating').value;
        const text = document.getElementById('reviewText').value.trim();
        
        if (!name || !text) {
            alert('Please fill in all fields.');
            return;
        }
        
        saveReview(productId, name, rating, text);
        form.reset();
        showToast('Review submitted successfully! 🎉');
    });
}

// ===== CHANGE MAIN IMAGE =====
function changeMainImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('mainProductImage');
    if (mainImage) {
        mainImage.src = imageSrc;
    }
    
    document.querySelectorAll('.thumbnail').forEach(el => {
        el.classList.remove('active');
    });
    
    if (thumbnailElement) {
        thumbnailElement.classList.add('active');
    }
}

// ========================================
// ===== QUANTITY FUNCTIONS =====
// ========================================

function changeQuantity(change) {
    const input = document.getElementById('productQty');
    if (!input) return;
    
    let currentVal = parseInt(input.value) || 1;
    let newVal = currentVal + change;
    
    if (newVal < 1) newVal = 1;
    if (newVal > 10) newVal = 10;
    
    input.value = newVal;
}

function getSelectedQuantity() {
    const input = document.getElementById('productQty');
    if (!input) return 1;
    return parseInt(input.value) || 1;
}
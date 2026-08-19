(async () => {
  const res = await fetch('/data/products.json');
  const products = await res.json();
  const grid = document.getElementById('products-grid');
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy" />
      <h4>${p.name}</h4>
      <div>Rs. ${p.price}</div>
      <a href="/product.html?slug=${p.slug}" class="btn-sm">View</a>
    `;
    grid.appendChild(card);
  });
})();
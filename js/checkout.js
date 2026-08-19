// TODO: Replace with your Google Apps Script Web App URL
const SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL';

document.getElementById('checkout-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart.length) return alert('Cart is empty');

  const payload = {
    items: cart,
    customer: {
      name: form.name.value,
      phone: form.phone.value,
      whatsapp: form.whatsapp.value,
      city: form.city.value,
      address: form.address.value,
      notes: form.notes.value
    }
  };

  try {
    const res = await fetch(SCRIPT_URL, { method: 'POST', body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Failed');
    form.style.display = 'none';
    const success = document.getElementById('success');
    success.style.display = 'block';
    const orderId = 'MK' + Date.now();
    const msg = `Hi, I placed order ${orderId}:\n${cart.map(i=>`${i.name} x${i.qty}`).join(', ')}\nName: ${form.name.value}\nCity: ${form.city.value}\nAddress: ${form.address.value}`;
    const waNumber = '923000000000'; // replace with your WhatsApp number (last 4 digits confirm karo)
    document.getElementById('wa-link').href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    localStorage.removeItem('cart');
  } catch (err) {
    alert('Order failed. Please try again or WhatsApp us.');
  }
});
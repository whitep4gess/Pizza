const body = document.body;
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const cartButton = document.querySelector('.cart-button');
const cartDrawer = document.querySelector('.cart-drawer');
const cartOverlay = document.querySelector('.drawer-overlay');
const cartItems = document.querySelector('.cart-items');
const cartCount = document.querySelector('.cart-count');
const cartTotal = document.querySelector('.cart-total strong');
const toast = document.querySelector('.toast');
const modal = document.querySelector('.reservation-modal');
const reservationForm = document.querySelector('.reservation-form');
const successPanel = document.querySelector('.reservation-success');
let cart = [];
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function closeMobileMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Otwórz menu');
  mobileMenu.classList.remove('is-open');
}

menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!open));
  menuToggle.setAttribute('aria-label', open ? 'Otwórz menu' : 'Zamknij menu');
  mobileMenu.classList.toggle('is-open', !open);
});

mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));

window.addEventListener('scroll', () => {
  header.classList.toggle('is-sticky', window.scrollY > 120);
}, { passive: true });

document.querySelectorAll('.filter-button').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.filter-button').forEach(item => item.classList.remove('is-active'));
    button.classList.add('is-active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.pizza-card').forEach(card => {
      const visible = filter === 'all' || card.dataset.category.split(' ').includes(filter);
      card.classList.toggle('is-hidden', !visible);
    });
  });
});

function openCart() {
  cartOverlay.hidden = false;
  requestAnimationFrame(() => cartOverlay.classList.add('is-visible'));
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  body.classList.add('no-scroll');
  setTimeout(() => document.querySelector('.drawer-close').focus(), 120);
}

function closeCart() {
  cartOverlay.classList.remove('is-visible');
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  body.classList.remove('no-scroll');
  setTimeout(() => { cartOverlay.hidden = true; }, 300);
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartCount.textContent = count;
  cartTotal.textContent = `${total} zł`;

  if (!cart.length) {
    cartItems.innerHTML = '<div class="cart-empty"><div><span>○</span><p>Twój koszyk jest pusty.<br>Dodaj pizzę prosto z pieca.</p></div></div>';
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <article class="cart-item">
      <div>
        <h3>${item.name}</h3>
        <div class="quantity">
          <button type="button" data-cart-action="minus" data-index="${index}" aria-label="Zmniejsz liczbę ${item.name}">−</button>
          <span>${item.qty}</span>
          <button type="button" data-cart-action="plus" data-index="${index}" aria-label="Zwiększ liczbę ${item.name}">+</button>
        </div>
      </div>
      <strong>${item.price * item.qty} zł</strong>
    </article>
  `).join('');
}

document.querySelectorAll('.add-button').forEach(button => {
  button.addEventListener('click', () => {
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const existing = cart.find(item => item.name === name);
    if (existing) existing.qty += 1;
    else cart.push({ name, price, qty: 1 });
    renderCart();
    showToast(`${name} dodana do koszyka`);
  });
});

cartItems.addEventListener('click', event => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const index = Number(button.dataset.index);
  if (button.dataset.cartAction === 'plus') cart[index].qty += 1;
  else cart[index].qty -= 1;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  renderCart();
});

cartButton.addEventListener('click', openCart);
document.querySelector('.drawer-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
document.querySelector('.checkout-button').addEventListener('click', () => {
  if (!cart.length) showToast('Najpierw dodaj pizzę do koszyka');
  else showToast('Zamówienie gotowe do finalizacji');
});

document.querySelectorAll('.reservation-trigger').forEach(button => {
  button.addEventListener('click', () => {
    closeMobileMenu();
    reservationForm.hidden = false;
    document.querySelector('.modal-intro').hidden = false;
    successPanel.hidden = true;
    modal.showModal();
  });
});

document.querySelector('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', event => {
  if (event.target === modal) modal.close();
});

reservationForm.addEventListener('submit', event => {
  event.preventDefault();
  reservationForm.hidden = true;
  document.querySelector('.modal-intro').hidden = true;
  successPanel.hidden = false;
  setTimeout(() => {
    modal.close();
    reservationForm.reset();
    reservationForm.hidden = false;
    document.querySelector('.modal-intro').hidden = false;
    successPanel.hidden = true;
  }, 2600);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && cartDrawer.classList.contains('is-open')) closeCart();
});

const dateInput = document.querySelector('input[type="date"]');
dateInput.min = new Date().toISOString().split('T')[0];
renderCart();


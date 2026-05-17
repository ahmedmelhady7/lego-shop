// ============================================
// LEGO 3D LANDING PAGE - MAIN JAVASCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initMobileMenu();
  initCartFunctionality();
  init3DTiltEffect();
  initSmoothScroll();
  initFloatingBricksParallax();
});

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Add staggered delay for grid items
        const siblings = entry.target.parentElement.querySelectorAll('.animate-on-scroll');
        siblings.forEach((sibling, index) => {
          sibling.style.transitionDelay = `${index * 0.1}s`;
        });
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
    });
    
    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuBtn.textContent = '☰';
      });
    });
  }
}

// ============================================
// CART FUNCTIONALITY
// ============================================
function initCartFunctionality() {
  const cart = [];
  const cartCountElement = document.querySelector('.cart-count');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const cartSidebar = document.getElementById('cart-sidebar');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartBtn = document.querySelector('.cart-btn');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartEmptyEl = document.getElementById('cart-empty');
  const cartSummaryEl = document.getElementById('cart-summary');
  const cartSubtotalEl = document.getElementById('cart-subtotal');
  const cartShippingEl = document.getElementById('cart-shipping');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

  // Open / Close cart drawer
  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (cartBtn) cartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  // Update cart badge count
  function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if (cartCountElement) {
      cartCountElement.textContent = totalItems;
      cartCountElement.style.transform = 'scale(1.3)';
      setTimeout(() => { cartCountElement.style.transform = 'scale(1)'; }, 200);
    }
  }

  // Update cart summary totals
  function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const shippingCost = subtotal >= 75 ? 0 : 9.99;

    if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if (cartShippingEl) cartShippingEl.textContent = shippingCost === 0 ? 'Free ✨' : `$${shippingCost.toFixed(2)}`;
    if (cartTotalEl) cartTotalEl.textContent = `$${(subtotal + shippingCost).toFixed(2)}`;
  }

  // Render cart items into the sidebar
  function renderCart() {
    // Remove existing dynamic item elements
    cartItemsContainer.querySelectorAll('.cart-item').forEach(el => el.remove());

    if (cart.length === 0) {
      cartEmptyEl.style.display = 'flex';
      cartSummaryEl.style.display = 'none';
    } else {
      cartEmptyEl.style.display = 'none';
      cartSummaryEl.style.display = 'block';

      cart.forEach((item) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
          <span class="cart-item-emoji">${item.emoji}</span>
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
          </div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn minus" data-id="${item.id}">−</button>
            <span class="cart-qty-value">${item.qty}</span>
            <button class="cart-qty-btn plus" data-id="${item.id}">+</button>
          </div>
          <button class="cart-item-remove" data-id="${item.id}">🗑️</button>
        `;
        // Insert before the empty-state div
        cartItemsContainer.insertBefore(itemEl, cartEmptyEl);
      });

      // Attach event listeners for quantity buttons and remove buttons
      cartItemsContainer.querySelectorAll('.cart-qty-btn.minus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.id);
          const item = cart.find(i => i.id === id);
          if (item) {
            item.qty--;
            if (item.qty <= 0) cart.splice(cart.indexOf(item), 1);
            updateCartCount();
            updateCartSummary();
            renderCart();
          }
        });
      });

      cartItemsContainer.querySelectorAll('.cart-qty-btn.plus').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.id);
          const item = cart.find(i => i.id === id);
          if (item) {
            item.qty++;
            updateCartCount();
            updateCartSummary();
            renderCart();
          }
        });
      });

      cartItemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = Number(btn.dataset.id);
          const idx = cart.findIndex(i => i.id === id);
          if (idx !== -1) cart.splice(idx, 1);
          updateCartCount();
          updateCartSummary();
          renderCart();
        });
      });
    }

    updateCartSummary();
  }

  // Map each "Add to Cart" button to its product data
  addToCartButtons.forEach((button, index) => {
    const product = products[index];
    if (!product) return;

    button.addEventListener('click', (e) => {
      e.preventDefault();

      // Check if item already in cart
      const existing = cart.find(i => i.id === product.id);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          emoji: product.emoji,
          qty: 1
        });
      }

      updateCartCount();
      renderCart();

      // Button animation
      button.textContent = '✓ Added!';
      button.style.background = 'linear-gradient(135deg, #237841 0%, #1a5c2f 100%)';
      setTimeout(() => {
        button.innerHTML = '🛒 Add to Cart';
        button.style.background = '';
      }, 1200);

      // Create floating brick animation
      createFloatingBrickEffect(button);
    });
  });

  // Checkout button
  if (cartCheckoutBtn) {
    cartCheckoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      cartCheckoutBtn.textContent = '✅ Order Placed!';
      cartCheckoutBtn.style.background = 'linear-gradient(135deg, #237841 0%, #1a5c2f 100%)';
      setTimeout(() => {
        cart.length = 0;
        updateCartCount();
        renderCart();
        closeCart();
        cartCheckoutBtn.textContent = 'Proceed to Checkout 🚀';
        cartCheckoutBtn.style.background = '';
      }, 1500);
    });
  }

  // Initial render
  renderCart();
}

function createFloatingBrickEffect(element) {
  const rect = element.getBoundingClientRect();
  const brick = document.createElement('div');
  brick.className = 'flying-brick';
  brick.innerHTML = '🧱';
  brick.style.cssText = `
    position: fixed;
    left: ${rect.left}px;
    top: ${rect.top}px;
    font-size: 2rem;
    pointer-events: none;
    z-index: 9999;
    transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  `;
  document.body.appendChild(brick);

  // Animate to cart
  const cartBtn = document.querySelector('.cart-btn');
  if (cartBtn) {
    const cartRect = cartBtn.getBoundingClientRect();
    requestAnimationFrame(() => {
      brick.style.left = `${cartRect.left}px`;
      brick.style.top = `${cartRect.top}px`;
      brick.style.transform = 'scale(0.3)';
      brick.style.opacity = '0';
    });
  }

  setTimeout(() => brick.remove(), 800);
}

// ============================================
// 3D TILT EFFECT
// ============================================
function init3DTiltEffect() {
  const cards = document.querySelectorAll('.product-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
  });
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============================================
// FLOATING BRICKS PARALLAX
// ============================================
function initFloatingBricksParallax() {
  const bricks = document.querySelectorAll('.brick');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    bricks.forEach((brick, index) => {
      const speed = 0.1 + (index * 0.05);
      brick.style.transform = `translateY(${scrolled * speed}px)`;
    });
  });
  
  // Mouse parallax for hero section
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      
      bricks.forEach((brick, index) => {
        const speed = 0.02 + (index * 0.01);
        const x = (clientX - centerX) * speed;
        const y = (clientY - centerY) * speed;
        brick.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (window.scrollY > 50) {
    navbar.style.background = 'rgba(26, 26, 46, 0.98)';
    navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
  } else {
    navbar.style.background = 'rgba(26, 26, 46, 0.9)';
    navbar.style.boxShadow = 'none';
  }
});

// ============================================
// PRODUCT DATA (for dynamic loading)
// ============================================
const products = [
  {
    id: 1,
    name: "Star Wars Millennium Falcon",
    category: "Star Wars",
    price: 849.99,
    pieces: 7541,
    age: "16+",
    badge: "bestseller",
    emoji: "🚀"
  },
  {
    id: 2,
    name: "Technic Bugatti Chiron",
    category: "Technic",
    price: 349.99,
    pieces: 3599,
    age: "16+",
    badge: "new",
    emoji: "🏎️"
  },
  {
    id: 3,
    name: "Harry Potter Hogwarts Castle",
    category: "Harry Potter",
    price: 469.99,
    originalPrice: 549.99,
    pieces: 6020,
    age: "16+",
    badge: "sale",
    emoji: "🏰"
  },
  {
    id: 4,
    name: "Creator Expert Flower Bouquet",
    category: "Creator",
    price: 59.99,
    pieces: 756,
    age: "18+",
    badge: "new",
    emoji: "💐"
  },
  {
    id: 5,
    name: "City Space Exploration",
    category: "City",
    price: 129.99,
    pieces: 1422,
    age: "8+",
    badge: null,
    emoji: "🛸"
  },
  {
    id: 6,
    name: "Architecture The White House",
    category: "Architecture",
    price: 99.99,
    pieces: 1483,
    age: "18+",
    badge: null,
    emoji: "🏛️"
  }
];

console.log('🧱 LEGO Landing Page Loaded Successfully!');

/*=================================
  MODERN EQUALITY ARCHIVE SCRIPT
  Clean, modular JavaScript with ES6+
===================================*/

'use strict';

// ==========================
// UTILITY FUNCTIONS
// ==========================
const select = (selector, parent = document) => parent.querySelector(selector);
const selectAll = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const debounce = (func, delay = 250) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const throttle = (func, limit = 250) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ==========================
// PROGRESS BAR
// ==========================
class ProgressBar {
  constructor(element) {
    this.element = element;
    this.init();
  }

  init() {
    window.addEventListener('scroll', throttle(() => this.update(), 100));
    this.update();
  }

  update() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    this.element.style.width = `${Math.min(progress, 100)}%`;
    this.element.setAttribute('aria-valuenow', Math.floor(progress));
  }
}

// ==========================
// NAVIGATION
// ==========================
class Navigation {
  constructor() {
    this.nav = select('.nav');
    this.toggle = select('.nav__toggle');
    this.menu = select('.nav__menu');
    this.links = selectAll('.nav__link');
    this.lastScroll = 0;
    
    this.init();
  }

  init() {
    this.toggle?.addEventListener('click', () => this.toggleMenu());
    this.links.forEach(link => {
      link.addEventListener('click', (e) => this.handleLinkClick(e, link));
    });
    
    window.addEventListener('scroll', throttle(() => this.handleScroll(), 100));
    window.addEventListener('scroll', debounce(() => this.updateActiveLink(), 100));
  }

  toggleMenu() {
    const isExpanded = this.toggle.getAttribute('aria-expanded') === 'true';
    this.toggle.setAttribute('aria-expanded', !isExpanded);
    this.menu.classList.toggle('active');
    
    // Animate hamburger
    const spans = selectAll('span', this.toggle);
    spans.forEach((span, i) => {
      if (!isExpanded) {
        if (i === 0) span.style.transform = 'rotate(45deg) translateY(10px)';
        if (i === 1) span.style.opacity = '0';
        if (i === 2) span.style.transform = 'rotate(-45deg) translateY(-10px)';
      } else {
        span.style.transform = '';
        span.style.opacity = '';
      }
    });
  }

  handleLinkClick(e, link) {
    const href = link.getAttribute('href');
    if (!href.startsWith('#')) return;
    
    e.preventDefault();
    const target = select(href);
    
    if (target) {
      const offsetTop = target.offsetTop - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
      
      // Close mobile menu
      if (this.menu.classList.contains('active')) {
        this.toggleMenu();
      }
    }
  }

  handleScroll() {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 80) {
      this.nav.classList.remove('hidden');
    } else if (currentScroll > this.lastScroll && currentScroll > 100) {
      this.nav.classList.add('hidden');
    } else if (currentScroll < this.lastScroll) {
      this.nav.classList.remove('hidden');
    }
    
    this.lastScroll = currentScroll;
  }

  updateActiveLink() {
    const sections = selectAll('section[id]');
    const scrollPos = window.pageYOffset + 100;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        this.links.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
        });
      }
    });
  }
}

// ==========================
// INTERSECTION OBSERVER
// ==========================
class ScrollAnimator {
  constructor() {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, this.options);

    const elements = selectAll('.section-header, .stat-card, .champion, .timeline__item, .info-card, .action-card');
    
    elements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }
}

// ==========================
// STATISTICS COUNTER
// ==========================
class StatsCounter {
  constructor() {
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const numberElement = select('.stat-card__number', entry.target);
          if (numberElement && !numberElement.dataset.animated) {
            this.animateNumber(numberElement);
            numberElement.dataset.animated = 'true';
            observer.unobserve(entry.target);
          }
        }
      });
    }, { threshold: 0.5 });

    selectAll('.stat-card').forEach(card => observer.observe(card));
  }

  animateNumber(element) {
    const text = element.textContent.trim();
    const suffix = text.match(/[%¢M]/)?.[0] || '';
    const target = parseInt(text);
    
    if (isNaN(target)) return;
    
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target + suffix;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current) + suffix;
      }
    }, 16);
  }
}

// ==========================
// SAFETY MAP (LEAFLET)
// ==========================
class SafetyMap {
  constructor() {
    this.mapElement = select('#safety-map');
    if (!this.mapElement || typeof L === 'undefined') return;
    
    this.init();
  }

  init() {
    // Initialize map
    this.map = L.map('safety-map', {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8,
      scrollWheelZoom: false
    });

    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd'
    }).addTo(this.map);

    this.addMarkers();
  }

  addMarkers() {
    const data = {
      safe: [
        { name: 'Canada', coords: [56.1304, -106.3468] },
        { name: 'Netherlands', coords: [52.1326, 5.2913] },
        { name: 'Spain', coords: [40.4637, -3.7492] },
        { name: 'Germany', coords: [51.1657, 10.4515] },
        { name: 'United Kingdom', coords: [55.3781, -3.4360] },
        { name: 'New Zealand', coords: [-40.9006, 174.8860] },
        { name: 'Sweden', coords: [60.1282, 18.6435] },
        { name: 'Norway', coords: [60.4720, 8.4689] },
        { name: 'Denmark', coords: [56.2639, 9.5018] },
        { name: 'France', coords: [46.2276, 2.2137] },
        { name: 'Belgium', coords: [50.5039, 4.4699] },
        { name: 'Portugal', coords: [39.3999, -8.2245] },
        { name: 'Iceland', coords: [64.9631, -19.0208] },
        { name: 'Finland', coords: [61.9241, 25.7482] },
        { name: 'Australia', coords: [-25.2744, 133.7751] }
      ],
      moderate: [
        { name: 'United States', coords: [37.0902, -95.7129] },
        { name: 'Brazil', coords: [-14.2350, -51.9253] },
        { name: 'Argentina', coords: [-38.4161, -63.6167] },
        { name: 'South Africa', coords: [-30.5595, 22.9375] },
        { name: 'Mexico', coords: [23.6345, -102.5528] },
        { name: 'Japan', coords: [36.2048, 138.2529] },
        { name: 'South Korea', coords: [35.9078, 127.7669] }
      ],
      caution: [
        { name: 'India', coords: [20.5937, 78.9629] },
        { name: 'China', coords: [35.8617, 104.1954] },
        { name: 'Turkey', coords: [38.9637, 35.2433] },
        { name: 'Egypt', coords: [26.8206, 30.8025] },
        { name: 'Morocco', coords: [31.7917, -7.0926] },
        { name: 'Kenya', coords: [-0.0236, 37.9062] }
      ],
      danger: [
        { name: 'Iran', coords: [32.4279, 53.6880] },
        { name: 'Saudi Arabia', coords: [23.8859, 45.0792] },
        { name: 'Yemen', coords: [15.5527, 48.5164] },
        { name: 'Afghanistan', coords: [33.9391, 67.7100] },
        { name: 'Somalia', coords: [5.1521, 46.1996] },
        { name: 'Nigeria', coords: [9.0820, 8.6753] },
        { name: 'Uganda', coords: [1.3733, 32.2903] },
        { name: 'Russia', coords: [61.5240, 105.3188] }
      ]
    };

    const colors = {
      safe: '#27AE60',
      moderate: '#F39C12',
      caution: '#E67E22',
      danger: '#C84B31'
    };

    Object.entries(data).forEach(([level, countries]) => {
      countries.forEach(country => {
        L.circleMarker(country.coords, {
          radius: 6,
          fillColor: colors[level],
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        })
        .bindPopup(`<strong>${country.name}</strong><br>Status: ${level}`)
        .addTo(this.map);
      });
    });
  }
}

// ==========================
// MODAL
// ==========================
class Modal {
  constructor() {
    this.modal = select('#modal');
    this.openBtn = select('#join-btn');
    this.closeBtn = select('#modal-close');
    this.closeX = select('.modal__close');
    this.overlay = select('.modal__overlay');
    
    this.init();
  }

  init() {
    if (!this.modal) return;
    
    this.openBtn?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.closeX?.addEventListener('click', () => this.close());
    this.overlay?.addEventListener('click', () => this.close());
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.getAttribute('aria-hidden') === 'false') {
        this.close();
      }
    });
  }

  open() {
    this.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    this.trapFocus();
  }

  close() {
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    this.openBtn?.focus();
  }

  trapFocus() {
    const focusable = selectAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      this.modal
    );
    
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    
    const handleTab = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    
    this.modal.addEventListener('keydown', handleTab);
  }
}

// ==========================
// SMOOTH SCROLL
// ==========================
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    selectAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        
        if (href === '#' || href === '#hero') {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        
        const target = select(href);
        if (target) {
          e.preventDefault();
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({ top: offsetTop, behavior: 'smooth' });
        }
      });
    });
  }
}

// ==========================
// VIDEO BUTTON
// ==========================
class VideoLauncher {
  constructor() {
    this.button = select('#video-btn');
    this.video = select('.video-player');

    if (!this.button || !this.video) return;

    this.init();
  }

  init() {
    this.button.addEventListener('click', () => {
      const playPromise = this.video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {});
      }
    });
  }
}

// ==========================
// PERFORMANCE OPTIMIZATIONS
// ==========================
class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      }, { rootMargin: '50px' });

      selectAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.style.scrollBehavior = 'auto';
    }
  }
}

// ==========================
// INITIALIZATION
// ==========================
class App {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }

  initializeComponents() {
    // Initialize all components
    new ProgressBar(select('.progress-bar'));
    new Navigation();
    new ScrollAnimator();
    new StatsCounter();
    new SafetyMap();
    new Modal();
    new SmoothScroll();
    new VideoLauncher();
    new PerformanceOptimizer();
    
    // Add loaded class for CSS
    document.body.classList.add('loaded');
    
    // Console message
    this.logWelcomeMessage();
  }

  logWelcomeMessage() {
    console.log(
      '%c✨ Equality Archive',
      'font-size: 24px; font-weight: bold; color: #2C5F2D; font-family: "Playfair Display", serif;'
    );
    console.log(
      '%cA modern, accessible website documenting the journey toward global equality.',
      'font-size: 12px; color: #4A4A4A; font-family: Inter, sans-serif;'
    );
    console.log(
      '%cBuilt with care, designed for all.',
      'font-size: 12px; color: #D4A574; font-family: Inter, sans-serif; font-style: italic;'
    );
  }
}

// ==========================
// START APPLICATION
// ==========================
new App();

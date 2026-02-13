// ==============================================
// UTILITY FUNCTIONS
// ==============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// ==============================================
// READING PROGRESS BAR
// ==============================================

const updateReadingProgress = () => {
    const progressBar = $('.reading-progress');
    if (!progressBar) return;
    
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100;
    
    progressBar.style.width = `${Math.min(scrollPercentage, 100)}%`;
};

window.addEventListener('scroll', updateReadingProgress);
updateReadingProgress();

// ==============================================
// NAVIGATION
// ==============================================

const navbar = $('.navbar');
const navToggle = $('.nav-toggle');
const navMenu = $('.nav-menu');
const navLinks = $$('.nav-link');

// Mobile menu toggle
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        
        // Animate toggle button
        navToggle.querySelectorAll('span').forEach((span, index) => {
            if (!isExpanded) {
                if (index === 0) span.style.transform = 'rotate(45deg) translateY(8px)';
                if (index === 1) span.style.opacity = '0';
                if (index === 2) span.style.transform = 'rotate(-45deg) translateY(-8px)';
            } else {
                span.style.transform = '';
                span.style.opacity = '';
            }
        });
    });
}

// Smooth scroll for navigation links
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
            e.preventDefault();
            const target = $(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                    navToggle.querySelectorAll('span').forEach(span => {
                        span.style.transform = '';
                        span.style.opacity = '';
                    });
                }
            }
        }
    });
});

// Active navigation link on scroll
const updateActiveNav = () => {
    const sections = $$('section[id]');
    const scrollPos = window.pageYOffset + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
};

window.addEventListener('scroll', debounce(updateActiveNav, 100));
updateActiveNav();

// Hide/show navbar on scroll
let lastScroll = 0;
const handleNavbarScroll = () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 80) {
        navbar.classList.remove('hidden');
    } else if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.classList.add('hidden');
    } else if (currentScroll < lastScroll) {
        navbar.classList.remove('hidden');
    }
    
    lastScroll = currentScroll;
};

window.addEventListener('scroll', debounce(handleNavbarScroll, 50));

// ==============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ==============================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe sections for fade-in animations
const animatedSections = $$('.section-header, .stat-card, .champion-card, .timeline-item, .info-card, .action-card');
animatedSections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(30px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(section);
});

// ==============================================
// SAFETY MAP (LEAFLET)
// ==============================================

const initSafetyMap = () => {
    const mapElement = $('#safety-map');
    if (!mapElement || typeof L === 'undefined') return;
    
    // Initialize map
    const map = L.map('safety-map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 8,
        scrollWheelZoom: false
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    // LGBTQ+ Safety Data
    const safetyData = {
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
    
    // Color mapping
    const colors = {
        safe: '#27AE60',
        moderate: '#F39C12',
        caution: '#E67E22',
        danger: '#C84B31'
    };
    
    // Add markers
    Object.keys(safetyData).forEach(category => {
        safetyData[category].forEach(location => {
            const marker = L.circleMarker(location.coords, {
                radius: 8,
                fillColor: colors[category],
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);
            
            // Popup content
            const categoryNames = {
                safe: 'Safe - Full legal protections',
                moderate: 'Moderate - Some protections',
                caution: 'Caution - Limited rights',
                danger: 'Danger - Criminalized/Persecuted'
            };
            
            marker.bindPopup(`
                <div style="font-family: 'Instrument Sans', sans-serif; padding: 8px;">
                    <strong style="font-size: 16px; color: #1A1A1A;">${location.name}</strong><br>
                    <span style="font-size: 14px; color: ${colors[category]}; font-weight: 600;">${categoryNames[category]}</span>
                </div>
            `);
            
            // Pulse animation on hover
            marker.on('mouseover', function() {
                this.setRadius(12);
            });
            marker.on('mouseout', function() {
                this.setRadius(8);
            });
        });
    });
    
    // Enable scroll zoom after clicking on map
    map.once('focus', () => {
        map.scrollWheelZoom.enable();
    });
    
    // Disable scroll zoom when mouse leaves map
    mapElement.addEventListener('mouseleave', () => {
        map.scrollWheelZoom.disable();
    });
};

// Initialize map when it becomes visible
const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            initSafetyMap();
            mapObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

const mapElement = $('#safety-map');
if (mapElement) {
    mapObserver.observe(mapElement);
}

// ==============================================
// MODAL
// ==============================================

const modal = $('#movement-modal');
const openModalBtn = $('#join-movement');
const closeModalBtn = $('#close-modal');
const modalOverlay = $('.modal-overlay');

const openModal = () => {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (firstElement) firstElement.focus();
    
    // Trap focus within modal
    const trapFocus = (e) => {
        if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    };
    
    modal.addEventListener('keydown', trapFocus);
};

const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // Return focus to trigger button
    if (openModalBtn) openModalBtn.focus();
};

if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeModal();
    }
});

// ==============================================
// SMOOTH SCROLL FOR ALL ANCHOR LINKS
// ==============================================

$$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '#top') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const target = $(href);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ==============================================
// STATS COUNTER ANIMATION
// ==============================================

const animateCounter = (element, target, suffix = '', duration = 2000) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 16);
};

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target.querySelector('.stat-number');
            if (statNumber && !statNumber.dataset.animated) {
                statNumber.dataset.animated = 'true';
                const text = statNumber.textContent.trim();
                
                // Parse different stat formats
                if (text.includes('%')) {
                    const num = parseInt(text);
                    statNumber.textContent = '0%';
                    animateCounter(statNumber, num, '%');
                } else if (text.includes('¢')) {
                    const num = parseInt(text);
                    statNumber.textContent = '0¢';
                    animateCounter(statNumber, num, '¢');
                } else if (text.includes('M')) {
                    const num = parseInt(text);
                    statNumber.textContent = '0M';
                    animateCounter(statNumber, num, 'M');
                }
            }
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

$$('.stat-card').forEach(card => {
    statsObserver.observe(card);
});

// ==============================================
// ACCESSIBILITY ENHANCEMENTS
// ==============================================

// Skip to main content
const skipLink = document.createElement('a');
skipLink.href = '#story';
skipLink.className = 'visually-hidden';
skipLink.textContent = 'Skip to main content';
skipLink.style.position = 'absolute';
skipLink.style.top = '10px';
skipLink.style.left = '10px';
skipLink.style.zIndex = '99999';

skipLink.addEventListener('focus', () => {
    skipLink.classList.remove('visually-hidden');
    skipLink.style.padding = '10px';
    skipLink.style.background = 'var(--color-primary)';
    skipLink.style.color = 'white';
    skipLink.style.borderRadius = '4px';
});

skipLink.addEventListener('blur', () => {
    skipLink.classList.add('visually-hidden');
});

document.body.insertBefore(skipLink, document.body.firstChild);

// Announce page navigation for screen readers
const announceNavigation = (target) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'visually-hidden';
    announcement.textContent = `Navigated to ${target}`;
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
};

// ==============================================
// PERFORMANCE OPTIMIZATIONS
// ==============================================

// Lazy load images when they're about to enter viewport
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
    }, {
        rootMargin: '50px'
    });
    
    $$('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
}

// ==============================================
// CONSOLE MESSAGE
// ==============================================

console.log(
    '%c✨ Equality Archive',
    'font-size: 24px; font-weight: bold; color: #2C5F2D; font-family: "Playfair Display", serif;'
);
console.log(
    '%cA modern, accessible website documenting the journey toward global equality.',
    'font-size: 12px; color: #4A4A4A; font-family: "Instrument Sans", sans-serif;'
);
console.log(
    '%cBuilt with care, designed for all.',
    'font-size: 12px; color: #D4A574; font-family: "Instrument Sans", sans-serif; font-style: italic;'
);

// ==============================================
// INITIALIZATION
// ==============================================

window.addEventListener('DOMContentLoaded', () => {
    console.log('Website initialized successfully');
    
    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Recalculate positions if needed
        updateActiveNav();
    }, 250);
});

// Handle orientation change
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.location.reload();
    }, 200);
});
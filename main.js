// =====================================================
// DOM Ready
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initSmoothScroll();
    initEmailForms();
    initModal();
    initMobileMenu();
    initFAQ();
    initScrollEffects();
    initAccessibility();
    initFloatingCTA();
    initFeatureCardSizing();
});

// =====================================================
// Carousel Functionality
// =====================================================
function initCarousel() {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel__track');
        const slides = carousel.querySelectorAll('.carousel__slide');
        const prevBtn = carousel.querySelector('.carousel__control--prev');
        const nextBtn = carousel.querySelector('.carousel__control--next');
        const indicators = carousel.querySelectorAll('.carousel__indicator');
        
        let currentIndex = 0;
        let autoplayInterval;
        
        // Show slide
        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('carousel__slide--active');
            });
            
            // Update indicators
            indicators.forEach((indicator, i) => {
                indicator.classList.toggle('carousel__indicator--active', i === index);
            });
            
            // Show current slide
            if (slides[index]) {
                slides[index].classList.add('carousel__slide--active');
            }
            
            currentIndex = index;
        }
        
        // Next slide
        function nextSlide() {
            const newIndex = (currentIndex + 1) % slides.length;
            showSlide(newIndex);
        }
        
        // Previous slide
        function prevSlide() {
            const newIndex = (currentIndex - 1 + slides.length) % slides.length;
            showSlide(newIndex);
        }
        
        // Auto play
        function startAutoplay() {
            stopAutoplay();
            autoplayInterval = setInterval(nextSlide, 5000);
        }
        
        function stopAutoplay() {
            if (autoplayInterval) {
                clearInterval(autoplayInterval);
            }
        }
        
        // Event listeners
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                startAutoplay();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                nextSlide();
                startAutoplay();
            });
        }
        
        // Indicator clicks
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                showSlide(index);
                startAutoplay();
            });
        });
        
        // Pause on hover
        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);
        
        // Touch/swipe support
        let touchStartX = 0;
        let touchEndX = 0;
        
        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    nextSlide();
                } else {
                    prevSlide();
                }
                startAutoplay();
            }
        }
        
        // Start autoplay
        startAutoplay();
    });
}

// =====================================================
// Smooth Scroll
// =====================================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = target.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                closeMobileMenu();
                
                // Update URL without jumping
                history.pushState(null, null, href);
            }
        });
    });
}

// =====================================================
// Email Form Handling
// =====================================================
function initEmailForms() {
    const forms = document.querySelectorAll('.email-form');
    
    forms.forEach(form => {
        // If form uses a native action (e.g., Formspree), don't intercept
        if (form.hasAttribute('action')) {
            return;
        }

        const input = form.querySelector('.email-form__input');
        const button = form.querySelector('.btn');
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!input.checkValidity()) {
                input.reportValidity();
                return;
            }
            
            const email = input.value.trim();
            
            // Add loading state
            button.classList.add('loading');
            button.disabled = true;
            const originalText = button.textContent;
            button.textContent = 'Joining...';
            
            try {
                // Store in localStorage for now
                const waitlist = JSON.parse(localStorage.getItem('polyfind_waitlist') || '[]');
                
                if (!waitlist.includes(email)) {
                    waitlist.push(email);
                    localStorage.setItem('polyfind_waitlist', JSON.stringify(waitlist));
                }
                
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Uncomment when you have a real endpoint
                // const response = await fetch('/api/waitlist', {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify({ email })
                // });
                
                // if (!response.ok) {
                //     throw new Error('Failed to join waitlist');
                // }
                
                // Success state
                showSuccessMessage(form, 'Welcome aboard! Check your email for confirmation.');
                input.value = '';
                
                // Close modal if this is the modal form
                if (form.id === 'modal-email-form') {
                    setTimeout(() => {
                        closeModal();
                    }, 2000);
                }
                
                // Track event
                trackEvent('waitlist_signup', { email: email });
                
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage(form, 'Something went wrong. Please try again.');
            } finally {
                // Remove loading state
                button.classList.remove('loading');
                button.disabled = false;
                button.textContent = originalText;
            }
        });
        
        // Email validation feedback
        input.addEventListener('input', () => {
            const isValid = input.checkValidity();
            input.style.borderColor = isValid ? '' : 'var(--color-accent-sell)';
        });
    });
}

function showSuccessMessage(form, message) {
    removeMessages(form);
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    successDiv.style.animation = 'fadeIn 0.3s ease';
    
    form.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showErrorMessage(form, message) {
    removeMessages(form);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;
    errorDiv.style.animation = 'fadeIn 0.3s ease';
    
    form.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

function removeMessages(form) {
    form.querySelectorAll('.success, .error').forEach(el => el.remove());
}

// =====================================================
// Modal
// =====================================================
function initModal() {
    const modal = document.querySelector('#waitlist-modal');
    const triggers = document.querySelectorAll('[data-modal-trigger]');
    const closeButtons = document.querySelectorAll('[data-modal-close]');
    
    if (!modal) return;
    
    // Open modal
    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });
    
    // Close modal
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
    
    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
            closeModal();
        }
    });
}

function openModal() {
    const modal = document.querySelector('#waitlist-modal');
    if (!modal) return;
    
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
        const input = modal.querySelector('.email-form__input');
        if (input) input.focus();
    }, 100);
}

function closeModal() {
    const modal = document.querySelector('#waitlist-modal');
    if (!modal) return;
    
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

// =====================================================
// Floating CTA
// =====================================================
function initFloatingCTA() {
    // Create button
    const btn = document.createElement('button');
    btn.className = 'floating-cta btn btn--primary hidden';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Join the waitlist');
    btn.textContent = 'Join Waitlist';
    btn.addEventListener('click', () => {
        openModal();
    });

    document.body.appendChild(btn);

    // Show after scrolling past hero
    const showAfter = 400;
    const onScroll = throttle(() => {
        if (window.scrollY > showAfter) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// =====================================================
// Feature Card Equal Heights
// =====================================================
function initFeatureCardSizing() {
    const equalize = () => {
        const grid = document.querySelector('.features__grid');
        if (!grid) return;

        const cards = grid.querySelectorAll('.feature-card');
        // Reset heights
        cards.forEach(c => c.style.height = '');

        // Only equalize when grid has 2 columns
        const style = window.getComputedStyle(grid);
        const cols = style.gridTemplateColumns.split(' ').length;
        if (cols < 2) return;

        let max = 0;
        cards.forEach(c => { max = Math.max(max, c.offsetHeight); });
        cards.forEach(c => { c.style.height = max + 'px'; });
    };

    // Initial after paint and after full load for font/layout stability
    requestAnimationFrame(equalize);
    window.addEventListener('load', equalize);
    window.addEventListener('resize', debounce(equalize, 150));
}

// =====================================================
// Mobile Menu
// =====================================================
function initMobileMenu() {
    const toggle = document.querySelector('.nav__mobile-toggle');
    const menu = document.querySelector('.nav__menu');
    const nav = document.querySelector('.nav');
    
    if (!toggle || !menu) return;
    
    // Clone menu for mobile
    const mobileMenu = menu.cloneNode(true);
    mobileMenu.className = 'nav__mobile-menu';
    nav.appendChild(mobileMenu);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .nav__mobile-menu {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--color-bg-secondary);
            border-bottom: 1px solid var(--color-border);
            padding: var(--space-lg);
            flex-direction: column;
            gap: var(--space-lg);
            animation: slideDown 0.3s ease;
        }
        
        .nav__mobile-menu.active {
            display: flex;
        }
        
        .nav__mobile-toggle.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .nav__mobile-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .nav__mobile-toggle.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @media (min-width: 769px) {
            .nav__mobile-menu {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
    
    toggle.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target)) {
            closeMobileMenu();
        }
    });
}

function openMobileMenu() {
    const toggle = document.querySelector('.nav__mobile-toggle');
    const mobileMenu = document.querySelector('.nav__mobile-menu');
    
    if (toggle && mobileMenu) {
        toggle.classList.add('active');
        toggle.setAttribute('aria-expanded', 'true');
        mobileMenu.classList.add('active');
    }
}

function closeMobileMenu() {
    const toggle = document.querySelector('.nav__mobile-toggle');
    const mobileMenu = document.querySelector('.nav__mobile-menu');
    
    if (toggle && mobileMenu) {
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.remove('active');
    }
}

// =====================================================
// FAQ Accordion
// =====================================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-item__question');
        
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.hasAttribute('open')) {
                    otherItem.removeAttribute('open');
                }
            });
        });
    });
}

// =====================================================
// Scroll Effects
// =====================================================
function initScrollEffects() {
    let lastScroll = 0;
    const nav = document.querySelector('.nav');
    
    // Nav hide/show on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            nav.classList.remove('nav--scrolled');
            nav.classList.remove('nav--hidden');
            return;
        }
        
        if (currentScroll > lastScroll && currentScroll > 100) {
            // Scrolling down
            nav.classList.add('nav--hidden');
        } else {
            // Scrolling up
            nav.classList.remove('nav--hidden');
        }
        
        if (currentScroll > 50) {
            nav.classList.add('nav--scrolled');
        } else {
            nav.classList.remove('nav--scrolled');
        }
        
        lastScroll = currentScroll;
    }, { passive: true });
    
    // Add nav styles
    const style = document.createElement('style');
    style.textContent = `
        .nav {
            transition: transform var(--transition-base), background var(--transition-base);
        }
        
        .nav--hidden {
            transform: translateY(-100%);
        }
        
        .nav--scrolled {
            background: rgba(10, 10, 15, 0.95);
            box-shadow: var(--shadow-md);
        }
    `;
    document.head.appendChild(style);
    
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements
    const elementsToAnimate = document.querySelectorAll(
        '.feature-card, .pricing-card, .roadmap-item, .step, .preview__callout'
    );
    
    elementsToAnimate.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Add animation styles
    const animStyle = document.createElement('style');
    animStyle.textContent = `
        .fade-in {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .fade-in-visible {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature-card.fade-in {
            transition-delay: calc(var(--index, 0) * 0.1s);
        }
    `;
    document.head.appendChild(animStyle);
    
    // Add index to feature cards for staggered animation
    document.querySelectorAll('.feature-card').forEach((card, index) => {
        card.style.setProperty('--index', index);
    });
}

// =====================================================
// Accessibility
// =====================================================
function initAccessibility() {
    // Skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#hero';
    skipLink.className = 'skip-to-content';
    skipLink.textContent = 'Skip to content';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Skip link styles
    const style = document.createElement('style');
    style.textContent = `
        .skip-to-content {
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--color-accent-primary);
            color: white;
            padding: var(--space-sm) var(--space-md);
            border-radius: 0 0 8px 0;
            text-decoration: none;
            z-index: 9999;
            transition: top var(--transition-base);
        }
        
        .skip-to-content:focus {
            top: 0;
        }
    `;
    document.head.appendChild(style);
    
    // Manage focus for modals
    let lastFocusedElement;
    
    document.addEventListener('click', (e) => {
        if (e.target.matches('[data-modal-trigger]')) {
            lastFocusedElement = document.activeElement;
        }
        
        if (e.target.matches('[data-modal-close]')) {
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        }
    });
    
    // Trap focus in modal
    const modal = document.querySelector('#waitlist-modal');
    if (modal) {
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            const focusableElements = modal.querySelectorAll(
                'button, input, textarea, select, a[href], [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        });
    }
    
    // Announce form submissions to screen readers
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-10000px';
    document.body.appendChild(liveRegion);
    
    window.announceToScreenReader = (message) => {
        liveRegion.textContent = message;
        setTimeout(() => {
            liveRegion.textContent = '';
        }, 5000);
    };
}

// =====================================================
// Analytics Placeholder
// =====================================================
function trackEvent(eventName, eventData) {
    // Placeholder for analytics
    console.log('Track event:', eventName, eventData);
    
    // Uncomment when you have analytics set up
    // if (window.gtag) {
    //     window.gtag('event', eventName, eventData);
    // }
    // if (window.plausible) {
    //     window.plausible(eventName, { props: eventData });
    // }
}

// =====================================================
// Performance Monitoring
// =====================================================
if ('IntersectionObserver' in window) {
    // Lazy load images
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// =====================================================
// Service Worker Registration (PWA ready)
// =====================================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment when you have a service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(registration => console.log('SW registered:', registration))
        //     .catch(error => console.log('SW registration failed:', error));
    });
}

// =====================================================
// Utilities
// =====================================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for potential module use
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        initCarousel,
        initSmoothScroll,
        initEmailForms,
        initModal,
        initMobileMenu,
        initFAQ,
        initScrollEffects,
        initAccessibility,
        trackEvent,
        debounce,
        throttle
    };
}

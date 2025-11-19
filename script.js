/**
 * PolyFind Preview - Main JavaScript
 * Handles fade-in animations and carousel functionality
 */

// Initialize when DOM is ready
function init() {
    initFadeInAnimations();
    initSlideshows();
}

// Fade-in animations using Intersection Observer
function initFadeInAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
}

// Initialize carousel slideshows
function initSlideshows() {
    const slideshows = document.querySelectorAll('.slideshow');
    
    slideshows.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        
        // Skip if less than 2 slides
        if (slides.length <= 1) return;

        let currentIndex = 0;
        const ROTATION_INTERVAL = 4000; // 4 seconds
        
        // Advance to next slide
        function advanceSlide() {
            slides.forEach(slide => slide.classList.remove('active'));
            currentIndex = (currentIndex + 1) % slides.length;
            slides[currentIndex].classList.add('active');
        }
        
        // Auto-advance on interval
        setInterval(advanceSlide, ROTATION_INTERVAL);
        
        // Click to advance
        container.addEventListener('click', advanceSlide);
    });
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


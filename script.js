// Enhanced ArmanLeads JavaScript - Robust, Accessible, Cross-Device
(function() {
    'use strict';
    
    // Global state
    let lastScrollTop = 0;
    let ticking = false;
    let touchStartX = 0;
    let touchStartY = 0;
    
    // Helper functions
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
    
    function isExternalLink(href) {
        if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('?')) {
            return false;
        }
        const currentDomain = window.location.hostname;
        try {
            const linkDomain = new URL(href, window.location.origin).hostname;
            return linkDomain !== currentDomain;
        } catch (e) {
            return false;
        }
    }
    
    function getNavHeight() {
        const navbar = document.getElementById('navbar');
        return navbar ? navbar.offsetHeight : 72; // fallback to 72px
    }
    
    function createLiveRegion() {
        let liveRegion = document.getElementById('live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.position = 'absolute';
            liveRegion.style.left = '-10000px';
            liveRegion.style.width = '1px';
            liveRegion.style.height = '1px';
            liveRegion.style.overflow = 'hidden';
            document.body.appendChild(liveRegion);
        }
        return liveRegion;
    }
    
    function announceLive(message) {
        const liveRegion = createLiveRegion();
        liveRegion.textContent = message;
    }
    
    // Navigation visibility on scroll with throttling
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const navbar = document.getElementById('navbar');
                if (!navbar) {
                    ticking = false;
                    return;
                }
                
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // Avoid mobile bounce issues
                if (scrollTop < 0) {
                    ticking = false;
                    return;
                }
                
                if (scrollTop > 100 && scrollTop > lastScrollTop) {
                    // Scrolling down past 100px
                    navbar.classList.add('visible');
                } else if (scrollTop <= 50) {
                    // Near top
                    navbar.classList.remove('visible');
                }
                
                lastScrollTop = scrollTop;
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Enhanced FAQ functionality with accessibility
    function initializeFAQs() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach((faqItem, index) => {
            const question = faqItem.querySelector('.faq-question');
            const answer = faqItem.querySelector('.faq-answer');
            const icon = question?.querySelector('.faq-icon');
            
            if (!question || !answer || !icon) return;
            
            // Set up ARIA attributes
            const answerId = `faq-answer-${index + 1}`;
            answer.id = answerId;
            question.setAttribute('aria-controls', answerId);
            question.setAttribute('aria-expanded', 'false');
            
            // Click/tap handler
            question.addEventListener('click', () => toggleFAQ(faqItem));
            
            // Keyboard handler
            question.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFAQ(faqItem);
                }
            });
        });
    }
    
    function toggleFAQ(targetItem) {
        const question = targetItem.querySelector('.faq-question');
        const answer = targetItem.querySelector('.faq-answer');
        const icon = question?.querySelector('.faq-icon');
        
        if (!question || !answer || !icon) return;
        
        const isOpen = targetItem.classList.contains('open');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-item.open').forEach(item => {
            if (item !== targetItem) {
                closeFAQ(item);
            }
        });
        
        // Toggle current FAQ
        if (isOpen) {
            closeFAQ(targetItem);
        } else {
            openFAQ(targetItem);
        }
    }
    
    function openFAQ(faqItem) {
        const question = faqItem.querySelector('.faq-question');
        const answer = faqItem.querySelector('.faq-answer');
        const icon = question?.querySelector('.faq-icon');
        
        if (!question || !answer || !icon) return;
        
        faqItem.classList.add('open');
        answer.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        icon.textContent = '×';
        
        // Focus management for screen readers
        setTimeout(() => {
            const firstFocusable = answer.querySelector('p');
            if (firstFocusable) {
                firstFocusable.setAttribute('tabindex', '-1');
                firstFocusable.focus();
            }
        }, 300); // Wait for animation
    }
    
    function closeFAQ(faqItem) {
        const question = faqItem.querySelector('.faq-question');
        const answer = faqItem.querySelector('.faq-answer');
        const icon = question?.querySelector('.faq-icon');
        
        if (!question || !answer || !icon) return;
        
        faqItem.classList.remove('open');
        answer.classList.remove('open');
        question.setAttribute('aria-expanded', 'false');
        icon.textContent = '+';
        
        // Remove temporary tabindex
        const firstFocusable = answer.querySelector('p[tabindex="-1"]');
        if (firstFocusable) {
            firstFocusable.removeAttribute('tabindex');
        }
    }
    
    // Enhanced image lazy loading
    function initializeLazyLoading() {
        // Skip if browser supports native lazy loading for all images
        const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
        
        if (lazyImages.length === 0) return;
        
        // Feature detection
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        loadImage(img);
                        observer.unobserve(img);
                    }
                });
            }, {
                threshold: 0,
                rootMargin: '50px 0px'
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback: load all images immediately
            lazyImages.forEach(img => loadImage(img));
        }
    }
    
    function loadImage(img) {
        if (img.dataset.src) {
            img.src = img.dataset.src;
            delete img.dataset.src;
        }
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            delete img.dataset.srcset;
        }
        img.classList.remove('lazy');
        
        // Handle load errors gracefully
        img.addEventListener('error', () => {
            console.warn('Image failed to load:', img.src);
        }, { once: true });
    }
    
    // Enhanced smooth scrolling with dynamic nav height
    function initializeSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip empty or just # links
                if (!href || href === '#') {
                    return;
                }
                
                const target = document.querySelector(href);
                if (!target) {
                    console.warn('Scroll target not found:', href);
                    return;
                }
                
                e.preventDefault();
                
                const navHeight = getNavHeight();
                const targetPosition = target.getBoundingClientRect().top + 
                    window.pageYOffset - navHeight - 20; // Extra 20px buffer
                
                window.scrollTo({
                    top: Math.max(0, targetPosition),
                    behavior: 'smooth'
                });
            });
        });
    }
    
    // Enhanced button loading states
    function initializeButtonStates() {
        document.querySelectorAll('.btn').forEach(button => {
            // Skip if already initialized
            if (button.dataset.initialized) return;
            button.dataset.initialized = 'true';
            
            button.addEventListener('click', function(e) {
                const href = this.href;
                
                // Only apply loading to external links or form submits
                if (this.type === 'submit' || (href && isExternalLink(href))) {
                    // Prevent double clicks
                    if (this.disabled) {
                        e.preventDefault();
                        return;
                    }
                    
                    const originalText = this.textContent;
                    this.textContent = 'Loading...';
                    this.disabled = true;
                    
                    // Re-enable after timeout (fallback)
                    setTimeout(() => {
                        if (this.textContent === 'Loading...') {
                            this.textContent = originalText;
                            this.disabled = false;
                        }
                    }, 3000);
                }
            });
        });
    }
    
    // Enhanced form handling
    function initializeFormHandling() {
        const auditForm = document.getElementById('auditForm');
        if (!auditForm) return;
        
        auditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            if (submitButton.disabled) return; // Prevent double submission
            
            // Get form data
            const formData = new FormData(this);
            const data = {
                name: formData.get('name'),
                practice: formData.get('practice'),
                email: formData.get('email'),
                website: formData.get('website')
            };
            
            // Validation
            if (!data.name || !data.practice || !data.email) {
                const errorMsg = 'Please fill in all required fields.';
                announceLive(errorMsg);
                alert(errorMsg); // Fallback for no-js users
                return;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                const errorMsg = 'Please enter a valid email address.';
                announceLive(errorMsg);
                alert(errorMsg); // Fallback for no-js users
                return;
            }
            
            // Loading state
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate submission
            setTimeout(() => {
                const successMsg = 'Thank you! Your free audit request has been submitted. You\'ll receive your analysis within 12 hours.';
                announceLive(successMsg);
                alert(successMsg); // Keep for now as requested
                
                this.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 1500);
        });
    }
    
    // Enhanced intersection observer for animations
    function initializeFadeInAnimations() {
        const fadeElements = document.querySelectorAll('.fade-in');
        if (fadeElements.length === 0) return;
        
        if ('IntersectionObserver' in window) {
            const animationObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        // Don't unobserve - allow re-animation on re-entry
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -120px 0px' // Earlier reveal on mobile
            });
            
            fadeElements.forEach(el => {
                animationObserver.observe(el);
            });
            
            // Store observer for potential cleanup
            window.fadeInObserver = animationObserver;
        } else {
            // Fallback: show all elements immediately
            fadeElements.forEach(el => el.classList.add('visible'));
        }
    }
    
    // Enhanced touch support
    function initializeTouchSupport() {
        let touchEndX = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const deltaX = Math.abs(touchEndX - touchStartX);
            const deltaY = Math.abs(touchEndY - touchStartY);
            const threshold = 50;
            
            // Only register horizontal swipes with minimal vertical movement
            if (deltaX > threshold && deltaY < threshold) {
                if (touchEndX < touchStartX) {
                    // Swipe left
                    console.log('Swipe left detected');
                } else {
                    // Swipe right
                    console.log('Swipe right detected');
                }
            }
        }
    }
    
    // Keyboard navigation support
    function initializeKeyboardNavigation() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', function() {
            document.body.classList.remove('keyboard-navigation');
        });
    }
    
    // Error handling
    function initializeErrorHandling() {
        window.addEventListener('error', function(e) {
            console.warn('Resource failed to load:', e.target.src || e.target.href);
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', function(e) {
            console.warn('Unhandled promise rejection:', e.reason);
        });
    }
    
    // Professional console message
    function showConsoleWelcome() {
        if (typeof console !== 'undefined' && console.log) {
            console.log(
                '%cArmanLeads%c\nPremium Dental Marketing\n\nInterested in the code? Contact: hello@armanleads.com',
                'color: #DC2626; font-size: 24px; font-weight: bold;',
                'color: #6B6B6B; font-size: 14px;'
            );
        }
    }
    
    // Initialize everything when DOM is ready
    function initialize() {
        // Core functionality
        initializeFAQs();
        initializeLazyLoading();
        initializeSmoothScrolling();
        initializeButtonStates();
        initializeFormHandling();
        initializeFadeInAnimations();
        
        // Enhanced features
        initializeTouchSupport();
        initializeKeyboardNavigation();
        initializeErrorHandling();
        
        // Scroll handler with throttling
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Show welcome message
        showConsoleWelcome();
        
        console.log('ArmanLeads JavaScript initialized successfully');
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Cleanup on page unload (good practice)
    window.addEventListener('beforeunload', function() {
        if (window.fadeInObserver) {
            window.fadeInObserver.disconnect();
        }
    });
    
})();
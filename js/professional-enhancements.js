/**
 * PROFESSIONAL-GRADE JAVASCRIPT ENHANCEMENTS
 * Modern interactive features for responsive design
 */

class ProfessionalWebsite {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.setupSmoothScrolling();
    this.setupResponsiveImages();
    this.setupFormEnhancements();
    this.setupAccessibility();
  }

  init() {
    // Add class to html element for JS features
    document.documentElement.classList.add('js-enabled');
    
    // Setup viewport meta for better mobile experience
    this.setupViewport();
    
    // Initialize mobile navigation
    this.initMobileNavigation();
    
    // Initialize lazy loading
    this.initLazyLoading();
    
    // Initialize performance optimizations
    this.initPerformanceOptimizations();
  }

  setupViewport() {
    // Ensure proper viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, viewport-fit=cover');
    }
  }

  initMobileNavigation() {
    // Mobile dropdown navigation handler
    const mobileSelect = document.querySelector('.mobile-pages-select');
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        const value = e.target.value;
        if (value && value !== '#') {
          // Smooth scroll to section or navigate to page
          if (value.startsWith('#')) {
            this.smoothScrollTo(value);
          } else {
            window.location.href = value;
          }
        }
      });
    }

    // Enhanced mobile menu toggle
    this.setupMobileMenuToggle();
  }

  setupMobileMenuToggle() {
    const menuButtons = document.querySelectorAll('.w-nav-button, .menu-button, .menu-button-new');
    const navOverlay = document.querySelector('.w-nav-overlay');
    const navbar = document.querySelector('.navbar-component');

    menuButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = navbar.classList.contains('w--open');
        
        if (isOpen) {
          this.closeMobileMenu();
        } else {
          this.openMobileMenu();
        }
      });
    });

    // Close menu when clicking overlay
    if (navOverlay) {
      navOverlay.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    }

    // Close menu when pressing escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navbar && navbar.classList.contains('w--open')) {
        this.closeMobileMenu();
      }
    });
  }

  openMobileMenu() {
    const navbar = document.querySelector('.navbar-component');
    const navOverlay = document.querySelector('.w-nav-overlay');
    
    if (navbar) {
      navbar.classList.add('w--open');
      document.body.style.overflow = 'hidden';
    }
    
    if (navOverlay) {
      navOverlay.style.display = 'block';
    }
  }

  closeMobileMenu() {
    const navbar = document.querySelector('.navbar-component');
    const navOverlay = document.querySelector('.w-nav-overlay');
    
    if (navbar) {
      navbar.classList.remove('w--open');
      document.body.style.overflow = '';
    }
    
    if (navOverlay) {
      navOverlay.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Responsive image handling
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));

    // Scroll-based enhancements
    window.addEventListener('scroll', this.throttle(() => {
      this.handleScroll();
    }, 16));

    // Touch and mouse interaction improvements
    this.setupTouchInteractions();
  }

  handleResize() {
    // Update container queries
    this.updateContainerQueries();
    
    // Recalculate responsive grids
    this.updateResponsiveGrids();
    
    // Update navigation state
    this.updateNavigationState();
  }

  handleScroll() {
    // Navbar scroll effects
    this.updateNavbarOnScroll();
    
    // Parallax effects (if needed)
    this.updateParallaxElements();
    
    // Progress indicators
    this.updateScrollProgress();
  }

  updateNavbarOnScroll() {
    const navbar = document.querySelector('.navbar-component');
    if (!navbar) return;

    const scrolled = window.pageYOffset > 50;
    
    if (scrolled) {
      navbar.classList.add('scrolled');
      navbar.style.backdropFilter = 'blur(12px)';
      navbar.style.background = 'rgba(0, 0, 0, 0.9)';
      navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    } else {
      navbar.classList.remove('scrolled');
      navbar.style.backdropFilter = '';
      navbar.style.background = '';
      navbar.style.borderBottom = '';
    }
  }

  updateContainerQueries() {
    // Modern container query polyfill for older browsers
    const containers = document.querySelectorAll('[data-container-query]');
    
    containers.forEach(container => {
      const width = container.offsetWidth;
      
      // Remove existing size classes
      container.classList.remove('cq-sm', 'cq-md', 'cq-lg', 'cq-xl');
      
      // Add appropriate size class
      if (width >= 1024) {
        container.classList.add('cq-xl');
      } else if (width >= 768) {
        container.classList.add('cq-lg');
      } else if (width >= 480) {
        container.classList.add('cq-md');
      } else {
        container.classList.add('cq-sm');
      }
    });
  }

  updateResponsiveGrids() {
    // Dynamic grid columns based on container width
    const grids = document.querySelectorAll('.grid-auto-fit, .grid-auto-fill');
    
    grids.forEach(grid => {
      const width = grid.offsetWidth;
      const minItemWidth = parseInt(grid.dataset.minWidth) || 280;
      const gap = parseInt(getComputedStyle(grid).gap) || 24;
      
      const columns = Math.floor((width + gap) / (minItemWidth + gap));
      grid.style.gridTemplateColumns = `repeat(${Math.max(1, columns)}, 1fr)`;
    });
  }

  updateNavigationState() {
    const width = window.innerWidth;
    const mobileDropdown = document.querySelector('.mobile-pages-dropdown');
    const desktopMenu = document.querySelector('.navbar-menu');
    
    if (width <= 991) {
      if (mobileDropdown) mobileDropdown.style.display = 'flex';
      if (desktopMenu) desktopMenu.style.display = 'none';
    } else {
      if (mobileDropdown) mobileDropdown.style.display = 'none';
      if (desktopMenu) desktopMenu.style.display = 'flex';
    }
  }

  setupIntersectionObserver() {
    // Animate elements on scroll
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Stagger animations for grid items
          if (entry.target.parentElement.classList.contains('grid-3-columns') || 
              entry.target.parentElement.classList.contains('grid-4-columns')) {
            const delay = Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100;
            entry.target.style.animationDelay = `${delay}ms`;
          }
        }
      });
    }, observerOptions);

    // Observe cards and other elements
    const animatedElements = document.querySelectorAll(
      '.step-box-main, .pricing-card, .artist-card, .card, .card-testimonial, .animate-on-scroll'
    );
    
    animatedElements.forEach(el => {
      el.classList.add('animate-fade-in');
      observer.observe(el);
    });
  }

  setupSmoothScrolling() {
    // Enhanced smooth scrolling for anchor links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        this.smoothScrollTo(href);
      }
    });
  }

  smoothScrollTo(target) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element) return;

    const headerOffset = 80;
    const elementPosition = element.offsetTop;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  setupResponsiveImages() {
    // Responsive images with better loading
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // Add loading="lazy" for better performance
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      
      // Add proper alt attributes if missing
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', '');
      }
      
      // Handle image load errors
      img.addEventListener('error', () => {
        img.classList.add('image-error');
        // Could add fallback image here
      });
      
      // Handle successful loads
      img.addEventListener('load', () => {
        img.classList.add('image-loaded');
      });
    });
  }

  initLazyLoading() {
    // Enhanced lazy loading for better performance
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('fade-in');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });
    }
  }

  setupFormEnhancements() {
    // Enhanced form interactions
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        // Enhanced focus states
        input.addEventListener('focus', () => {
          input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
          input.parentElement.classList.remove('focused');
          
          // Add filled class if input has value
          if (input.value) {
            input.parentElement.classList.add('filled');
          } else {
            input.parentElement.classList.remove('filled');
          }
        });
        
        // Real-time validation
        input.addEventListener('input', () => {
          this.validateField(input);
        });
      });
    });
  }

  validateField(field) {
    // Basic field validation
    const isValid = field.checkValidity();
    const parent = field.parentElement;
    
    if (isValid) {
      parent.classList.remove('error');
      parent.classList.add('valid');
    } else {
      parent.classList.remove('valid');
      parent.classList.add('error');
    }
  }

  setupAccessibility() {
    // Enhanced keyboard navigation
    this.setupKeyboardNavigation();
    
    // Focus management
    this.setupFocusManagement();
    
    // Screen reader enhancements
    this.setupScreenReaderEnhancements();
  }

  setupKeyboardNavigation() {
    // Better keyboard navigation for interactive elements
    document.addEventListener('keydown', (e) => {
      // Handle tab navigation improvements
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  setupFocusManagement() {
    // Focus trap for modal dialogs
    const modals = document.querySelectorAll('.modal, .dropdown-menu');
    
    modals.forEach(modal => {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
              }
            }
          }
        });
      }
    });
  }

  setupScreenReaderEnhancements() {
    // Add ARIA labels where missing
    const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
    buttons.forEach(button => {
      if (!button.textContent.trim()) {
        button.setAttribute('aria-label', 'Button');
      }
    });
    
    // Enhance navigation landmarks
    const nav = document.querySelector('.navbar-component');
    if (nav && !nav.hasAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }
  }

  setupTouchInteractions() {
    // Enhanced touch interactions for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    });
    
    document.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY;
      this.handleSwipeGesture();
    });
  }

  handleSwipeGesture() {
    // Handle swipe gestures (could be used for carousel navigation)
    const swipeThreshold = 50;
    const difference = touchStartY - touchEndY;
    
    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        // Swipe up
        this.handleSwipeUp();
      } else {
        // Swipe down
        this.handleSwipeDown();
      }
    }
  }

  handleSwipeUp() {
    // Could implement scroll to next section
  }

  handleSwipeDown() {
    // Could implement scroll to previous section
  }

  updateParallaxElements() {
    // Simple parallax effect for background elements
    const parallaxElements = document.querySelectorAll('.parallax');
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const rate = scrolled * -0.5;
      element.style.transform = `translateY(${rate}px)`;
    });
  }

  updateScrollProgress() {
    // Update scroll progress indicator if present
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (window.pageYOffset / windowHeight) * 100;
      progressBar.style.width = `${scrolled}%`;
    }
  }

  initPerformanceOptimizations() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Optimize font loading
    this.optimizeFontLoading();
    
    // Setup service worker if available
    this.setupServiceWorker();
  }

  preloadCriticalResources() {
    // Preload important images and fonts
    const criticalImages = document.querySelectorAll('img[data-preload]');
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.src || img.dataset.src;
      document.head.appendChild(link);
    });
  }

  optimizeFontLoading() {
    // Optimize font loading with font-display
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      link.href += '&display=swap';
    });
  }

  setupServiceWorker() {
    // Register service worker for PWA features
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('ServiceWorker registered successfully');
        })
        .catch(error => {
          console.log('ServiceWorker registration failed');
        });
    }
  }

  // Utility functions
  debounce(func, wait) {
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

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ProfessionalWebsite();
  });
} else {
  new ProfessionalWebsite();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProfessionalWebsite;
}
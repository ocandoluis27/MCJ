// script.js - Updated for Web Components Compatibility
document.addEventListener('DOMContentLoaded', () => {
    // Pequeño timeout para dar tiempo a que los Web Components inyecten su innerHTML
    setTimeout(() => {
        const navbar = document.querySelector('.navbar');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');

        // Scroll effect
        const updateNavbar = () => {
            if (!navbar) return;
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };
        if(navbar) {
            window.addEventListener('scroll', updateNavbar);
            updateNavbar(); // ejecutar al cargar para estado inicial correcto
        }

        // Mobile Menu
        const navBackdrop = document.getElementById('navBackdrop');
        const closeMobileMenu = () => {
            if (!navLinks) return;
            navLinks.classList.remove('active');
            if (navBackdrop) navBackdrop.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.innerHTML = '<i data-lucide="menu"></i>';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
                mobileMenuBtn.setAttribute('aria-label', 'Abrir menú de navegación');
                mobileMenuBtn.classList.remove('active');
            }
            document.body.classList.remove('menu-open');
            if(window.lucide) lucide.createIcons();
        };

        const openMobileMenu = () => {
            if (!navLinks) return;
            navLinks.classList.add('active');
            if (navBackdrop) navBackdrop.classList.add('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.innerHTML = '<i data-lucide="x"></i>';
                mobileMenuBtn.setAttribute('aria-expanded', 'true');
                mobileMenuBtn.setAttribute('aria-label', 'Cerrar menú de navegación');
                mobileMenuBtn.classList.add('active');
            }
            document.body.classList.add('menu-open');
            if(window.lucide) lucide.createIcons();
        };

        if(mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', () => {
                const isExpanded = navLinks.classList.contains('active');
                if (isExpanded) {
                    closeMobileMenu();
                } else {
                    openMobileMenu();
                }
            });

            if (navBackdrop) {
                navBackdrop.addEventListener('click', closeMobileMenu);
            }

            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });

            // Cerrar con Escape por accesibilidad
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                    closeMobileMenu();
                }
            });
        }

        // Banner Superior Congreso
        const closeCongresoBar = document.getElementById('closeCongresoBar');
        const congresoTopBar = document.getElementById('congresoTopBar');
        if (closeCongresoBar && congresoTopBar) {
            closeCongresoBar.addEventListener('click', () => {
                congresoTopBar.style.transform = 'translateY(-100%)';
                congresoTopBar.style.opacity = '0';
                setTimeout(() => {
                    congresoTopBar.remove();
                    document.body.classList.remove('has-congreso-banner');
                }, 300);
            });
        }

        if (window.lucide) {
            lucide.createIcons();
        }

        // Animación Hero instantánea
        const heroContent = document.querySelector('.hero-content');
        if(heroContent) {
            heroContent.classList.add('visible');
        }

        // Observer de animaciones scroll
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll(
            '.slide-in-left, .slide-in-right, .slide-in-up'
        );
        
        animatedElements.forEach(el => observer.observe(el));
    }, 150);
});

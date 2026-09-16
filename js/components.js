class AppHeader extends HTMLElement {
    // Píldora visible desde ya y hasta el 25 de mayo 2026 (día de la solemnidad)
    static novenaActiva() {
        const hoy = new Date();
        const hasta = new Date(2026, 4, 25, 23, 59); // 25 mayo (solemnidad)
        return hoy <= hasta;
    }
    connectedCallback() {
        const base = this.getAttribute('base-path') || './';
        this.innerHTML = `
        <nav class="navbar" role="navigation" aria-label="Navegación principal">
            <div class="nav-container">
                <a href="${base}index.html" class="logo" aria-label="Página de Inicio - María Camino a Jesús">
                    <img src="${base}assets/logo-negativo.png" class="logo-light" alt="Logo Claro">
                    <img src="${base}assets/logo.png" class="logo-dark" alt="Logo Oscuro">
                    <span class="logo-text">María Camino a Jesús</span>
                </a>
                <div class="nav-links" id="mainNavLinks">
                    <a href="https://congreso.mariacaminoajesus.org" target="_blank" rel="noopener noreferrer" class="nav-congreso-pill">
                        <span class="nav-pill-dot"></span>
                        <span>Congreso 2026</span>
                    </a>
                    ${AppHeader.novenaActiva() ? `<a href="${base}novena.html" class="nav-novena">🌹 Novena a María Auxiliadora</a>` : ''}
                    <a href="${base}fiestamisericordia.html" class="nav-fiesta">✨ Fiesta de la Misericordia 2026</a>
                    <a href="${base}informativa/quienes-somos.html">Nosotros</a>
                    <a href="${base}informativa/obras.html">Obras</a>
                    <a href="${base}informativa/contacto.html" class="btn-primary">Contacto</a>
                </div>
                <button type="button" class="mobile-menu-btn" aria-label="Abrir menú de navegación" aria-expanded="false" aria-controls="mainNavLinks">
                    <i data-lucide="menu"></i>
                </button>
            </div>
            <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>
        </nav>
        `;
        // Lucide icons might need to be refreshed if injected dynamically
        if(window.lucide) {
            window.lucide.createIcons();
        }
    }
}

class AppFooter extends HTMLElement {
    connectedCallback() {
        const base = this.getAttribute('base-path') || './';
        this.innerHTML = `
        <footer class="footer">
            <div class="container footer-grid">
                <div class="footer-brand">
                    <a href="${base}index.html" class="logo footer-logo">
                        <img src="${base}assets/logo-negativo.png" alt="Logo" style="height: 60px;">
                        <span class="logo-text">María<br>Camino a Jesús</span>
                    </a>
                    <p>Asociación Pública de Fieles Laicos de la Arquidiócesis de Maracaibo, Venezuela.</p>
                </div>
                <div class="footer-links">
                    <h4>Navegación</h4>
                    <a href="https://congreso.mariacaminoajesus.org" target="_blank" rel="noopener noreferrer" style="color: var(--clr-primary-gold); font-weight: 700;">🎫 Congreso Gracia y Misericordia</a>
                    ${AppHeader.novenaActiva() ? `<a href="${base}novena.html" style="color: var(--clr-primary-gold); font-weight: 700;">🌹 Novena a María Auxiliadora</a>` : ''}
                    <a href="${base}fiestamisericordia.html" style="color: var(--clr-primary-gold); font-weight: 700;">✨ Fiesta de la Misericordia 2026</a>
                    <a href="${base}informativa/quienes-somos.html">Nosotros</a>
                    <a href="${base}informativa/obras.html">Obras</a>
                </div>
                <div class="footer-contact">
                    <h4>Síguenos</h4>
                    <div class="social-links" style="margin-top: 0.5rem; flex-direction: column; gap: 0.8rem;">
                        <a href="https://www.youtube.com/@mariacaminoajesus" target="_blank" aria-label="YouTube" style="width: auto; border-radius: 50px; padding: 0.5rem 1.2rem; gap: 0.6rem; color: var(--clr-white); background: #FF0000; justify-content: flex-start;">
                            <i data-lucide="youtube"></i> Canal de YouTube
                        </a>
                        <a href="https://instagram.com/mariacaminoajesus" target="_blank" aria-label="Instagram" style="width: auto; border-radius: 50px; padding: 0.5rem 1.2rem; gap: 0.6rem; color: var(--clr-white); background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); justify-content: flex-start;">
                            <i data-lucide="instagram"></i> Instagram Oficial
                        </a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 Asociación Pública de Fieles María Camino a Jesús. Todos los derechos reservados.</p>
            </div>
        </footer>
        `;
        if(window.lucide) {
            window.lucide.createIcons();
        }
    }
}

customElements.define('app-header', AppHeader);
customElements.define('app-footer', AppFooter);

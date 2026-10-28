/* Carrousel manuel : commandes clavier et tactiles, états ARIA et gestion
    de l’inertie des diapositives inactives pour éviter les arrêts de tabulation
    dans un contenu visuellement masqué. */

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.carousel-container');
    if (!container) return;

    const slides = Array.from(container.querySelectorAll('.slide'));

    let current = 0;
    if (slides.length === 0) return;

    // Update DOM state when changing slide
    function updateUI(index) {
        slides.forEach((s, i) => {
            const isActive = i === index;
            s.classList.toggle('active', isActive);
            s.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            s.inert = !isActive;
        });

        indicators.forEach((btn, i) => {
            const selected = i === index;
            btn.classList.toggle('active', selected);
            btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
            btn.setAttribute('tabindex', selected ? '0' : '-1');
            // keep aria-controls present (set in HTML)
        });
    }

    // Move to a specific slide
    function goTo(index, { moveFocus = false } = {}) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        current = index;
        updateUI(current);
        if (moveFocus) indicators[current].focus();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    // Keyboard handling for carousel-level shortcuts
    container.addEventListener('keydown', (e) => {
        // Only respond to keys when focus is inside the carousel
        const activeEl = document.activeElement;
        if (!container.contains(activeEl)) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                prev();
                break;
            case 'ArrowRight':
                e.preventDefault();
                next();
                break;
            case 'Home':
                e.preventDefault();
                goTo(0, { moveFocus: true });
                break;
            case 'End':
                e.preventDefault();
                goTo(slides.length - 1, { moveFocus: true });
                break;
        }
    });

    // Setup indicators and navigation buttons
    const indicators = Array.from(container.querySelectorAll('.carousel-indicators .indicator'));
    const prevBtn = container.querySelector('.carousel-nav.prev');
    const nextBtn = container.querySelector('.carousel-nav.next');

    // Indicator click handlers
    indicators.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            goTo(index, { moveFocus: true });
        });
    });

    // Navigation button handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prev();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            next();
        });
    }

    // Basic swipe support for touch devices
    let touchStartX = 0;
    container.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        const dx = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(dx) > 50) {
            if (dx > 0) next(); else prev();
        }
    });

    // Initialize without autoplay so visitors control the pace.
    updateUI(current);

    // Expose for debugging (optional)
    container.carousel = { goTo, next, prev };
    console.log('Accessible carousel initialized — slides:', slides.length);
});
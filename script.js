(function() {
    'use strict';

    const layers = document.querySelectorAll('.layer');
    let currentLayerIndex = 0;
    let isScrolling = false;
    let scrollTimeout;

    function getCurrentLayerIndex() {
        const scrollPos = window.scrollY + window.innerHeight / 2;
        for (let i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const top = layer.offsetTop;
            const bottom = top + layer.offsetHeight;
            if (scrollPos >= top && scrollPos < bottom) {
                return i;
            }
        }
        return 0;
    }

    function handleLayerAnimations() {
        const scrollY = window.scrollY;
        const viewportCenter = scrollY + window.innerHeight / 2;

        layers.forEach((layer, index) => {
            const layerTop = layer.offsetTop;
            const layerBottom = layerTop + layer.offsetHeight;
            const layerCenter = layerTop + layer.offsetHeight / 2;
            const distance = viewportCenter - layerCenter;
            const threshold = window.innerHeight * 0.75;

            layer.classList.remove('leaving-up', 'leaving-down');

            if (Math.abs(distance) < threshold) {
                if (!layer.classList.contains('visible')) {
                    layer.classList.add('visible');
                }
            } else {
                if (layer.classList.contains('visible')) {
                    layer.classList.remove('visible');
                    if (distance > 0) {
                        layer.classList.add('leaving-up');
                    } else {
                        layer.classList.add('leaving-down');
                    }
                    setTimeout(() => {
                        layer.classList.remove('leaving-up', 'leaving-down');
                    }, 800);
                }
            }
        });

        const newIndex = getCurrentLayerIndex();
        if (newIndex !== currentLayerIndex) {
            currentLayerIndex = newIndex;
        }
    }

    function scrollToLayer(index) {
        if (index < 0 || index >= layers.length) return;
        const target = layers[index];
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function onScroll() {
        if (isScrolling) return;

        if (scrollTimeout) {
            cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = requestAnimationFrame(() => {
            handleLayerAnimations();
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault();
            scrollToLayer(Math.min(currentLayerIndex + 1, layers.length - 1));
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault();
            scrollToLayer(Math.max(currentLayerIndex - 1, 0));
        } else if (e.key === 'Home') {
            e.preventDefault();
            scrollToLayer(0);
        } else if (e.key === 'End') {
            e.preventDefault();
            scrollToLayer(layers.length - 1);
        }
    });

    let wheelTimeout;
    window.addEventListener('wheel', (e) => {
        const isDesktop = window.innerWidth > 900;
        if (!isDesktop) return;

        if (wheelTimeout) {
            clearTimeout(wheelTimeout);
        }

        wheelTimeout = setTimeout(() => {
            const delta = e.deltaY;
            if (Math.abs(delta) < 30) return;

            if (delta > 0) {
                scrollToLayer(Math.min(currentLayerIndex + 1, layers.length - 1));
            } else {
                scrollToLayer(Math.max(currentLayerIndex - 1, 0));
            }
        }, 80);
    }, { passive: true });

    const floatShapes = document.querySelectorAll('.float-shape');
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    document.addEventListener('mousemove', (e) => {
        targetMouseX = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        targetMouseY = (e.clientY - window.innerHeight / 2) / window.innerHeight;
    });

    function animateShapes() {
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        floatShapes.forEach((shape, i) => {
            const factor = (i + 1) * 8;
            const x = mouseX * factor;
            const y = mouseY * factor;
            shape.style.transform = `translate(${x}px, ${y}px)`;
        });

        requestAnimationFrame(animateShapes);
    }
    animateShapes();

    function init() {
        if (layers.length > 0) {
            layers[0].classList.add('visible');
        }
        handleLayerAnimations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            handleLayerAnimations();
        }, 300);
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    const floatingFabs = document.querySelectorAll('.floating-nav-fab');
    floatingFabs.forEach(fab => {
        fab.addEventListener('click', () => {
            const t = fab.dataset.target;
            if (!t) return;
            const el = document.querySelector('.' + t);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
})();

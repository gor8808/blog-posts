// Hide navbar on scroll down, show on scroll up
(() => {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      navbar.classList.add('navbar--hidden');
    } else {
      navbar.classList.remove('navbar--hidden');
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  });
})();

// Show tag scroll hints only when overflow/position requires it
(() => {
  const wraps = Array.from(document.querySelectorAll('.tags-scroll-wrap'));
  if (wraps.length === 0) return;

  const update = (wrap, scroller) => {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    if (maxScroll <= 0) {
      wrap.classList.remove('show-left', 'show-right');
      wrap.removeAttribute('data-overflow');
      return;
    }
    wrap.setAttribute('data-overflow', 'true');
    const left = scroller.scrollLeft;
    wrap.classList.toggle('show-left', left > 1);
    wrap.classList.toggle('show-right', left < maxScroll - 1);
  };

  wraps.forEach((wrap) => {
    const scroller = wrap.querySelector('.tags-scroll');
    if (!scroller) return;

    let hasScrolled = false;
    const onScroll = () => {
      hasScrolled = true;
      wrap.setAttribute('data-scrolled', 'true');
      update(wrap, scroller);
    };
    const onResize = () => {
      update(wrap, scroller);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    // Keep hints hidden until user starts scrolling.
    wrap.classList.remove('show-left', 'show-right');
    wrap.removeAttribute('data-scrolled');
    update(wrap, scroller);
  });
})();

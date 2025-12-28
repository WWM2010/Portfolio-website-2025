const circle = document.querySelector(".circle");

// Cursor effect: adaptive to device and accessibility settings
let circleWidth = 24;
let circleHeight = 24;
let mouseX = 0;
let mouseY = 0;
let rafId = null;

const mqHover = window.matchMedia('(hover: hover) and (pointer: fine)');
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');

function updateCircleSize() {
  if (!circle) return;
  circleWidth = circle.offsetWidth;
  circleHeight = circle.offsetHeight;
}

function onMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
  if (rafId === null) rafId = requestAnimationFrame(animate);
}

function animate() {
  if (!circle) return;
  const offsetX = circleWidth / 2;
  const offsetY = circleHeight / 2;

  const currentLeft = parseFloat(circle.style.left) || 0;
  const currentTop = parseFloat(circle.style.top) || 0;

  const targetLeft = mouseX - offsetX;
  const targetTop = mouseY - offsetY;

  const easeAmount = 0.12;

  const newLeft = currentLeft + (targetLeft - currentLeft) * easeAmount;
  const newTop = currentTop + (targetTop - currentTop) * easeAmount;

  circle.style.left = newLeft + "px";
  circle.style.top = newTop + "px";

  rafId = requestAnimationFrame(animate);
}

function startCursor() {
  if (!circle) return;
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("resize", updateCircleSize);
  updateCircleSize();
}

function stopCursor() {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", updateCircleSize);
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (circle) {
    circle.style.left = "";
    circle.style.top = "";
  }
}

function evaluateCursor() {
  if (mqHover.matches && !mqReduce.matches) {
    startCursor();
  } else {
    stopCursor();
  }
}

evaluateCursor();
if (mqHover.addEventListener) {
  mqHover.addEventListener('change', evaluateCursor);
  mqReduce.addEventListener('change', evaluateCursor);
} else {
  // Safari fallback
  mqHover.addListener(evaluateCursor);
  mqReduce.addListener(evaluateCursor);
}

// Theme switcher logic
(function initThemeSwitcher() {
  const root = document.documentElement;
  const btn = document.querySelector('.theme-button');
  const menu = document.querySelector('.theme-menu');
  const options = document.querySelectorAll('.theme-option');

  if (!btn || !menu || !options.length) return;

  const applyTheme = (theme) => {
    if (theme === 'sophisticated' || theme === 'earthy' || theme === 'walnut') {
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('preferred-theme', theme); } catch (e) {}
    } else {
      root.removeAttribute('data-theme');
      try { localStorage.removeItem('preferred-theme'); } catch (e) {}
    }
  };

  // Init from localStorage
  try {
    const saved = localStorage.getItem('preferred-theme');
    if (saved) applyTheme(saved);
  } catch (e) {}

  // Toggle menu
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  // Select theme
  options.forEach(opt => {
    opt.addEventListener('click', (e) => {
      const theme = e.currentTarget.getAttribute('data-theme');
      applyTheme(theme);
      menu.classList.remove('open');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.classList.remove('open');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') menu.classList.remove('open');
  });
})();

// Counting animation for stats
function startCountingAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        const target = parseInt(entry.target.dataset.target);
        let current = 0;
        const increment = target / 50;
        const duration = 2000;
        const startTime = Date.now();

        const count = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          current = Math.floor(target * progress);
          
          entry.target.textContent = current;

          if (progress < 1) {
            requestAnimationFrame(count);
          } else {
            entry.target.textContent = target;
            entry.target.classList.add('counted');
          }
        };

        count();
      }
    });
  }, observerOptions);

  statNumbers.forEach(number => observer.observe(number));
}

// Navbar active state on scroll and click
(function initActiveNav() {
  const nav = document.querySelector('.navbar');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = links
    .map(a => {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      return el ? { id, el, link: a } : null;
    })
    .filter(Boolean);

  // Helper to set active
  const setActive = (id) => {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  };

  // Remove any hard-coded active at start; will be set by observer
  links.forEach(l => l.classList.remove('active'));

  // IntersectionObserver to track the section in view
  const io = new IntersectionObserver((entries) => {
    // Pick the most visible entry
    let best = null;
    entries.forEach(e => {
      if (e.isIntersecting) {
        const ratio = e.intersectionRatio;
        if (!best || ratio > best.ratio) best = { id: e.target.id, ratio };
      }
    });
    if (best) setActive(best.id);
  }, {
    root: null,
    threshold: [0.4, 0.6, 0.8],
    rootMargin: '0px 0px -30% 0px'
  });

  sections.forEach(s => io.observe(s.el));

  // Click handling for smooth behavior and closing theme menu
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      // Let default smooth scroll happen, but also set active immediately
      setActive(id);
      // Close theme menu if open
      const menu = document.querySelector('.theme-menu');
      if (menu) menu.classList.remove('open');
    });
  });
})();

// Start counting when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startCountingAnimation();
    initTypewriter();
  });
} else {
  startCountingAnimation();
  initTypewriter();
}

// Typewriter implementation for cross-browser support
function initTypewriter() {
  const target = document.querySelector('.type-target');
  if (!target) return;

  let words = [];
  try {
    const data = target.getAttribute('data-words');
    if (data) words = JSON.parse(data);
  } catch (e) {}
  if (!Array.isArray(words) || words.length === 0) {
    words = ['Web Developer.', 'Student.', 'Competitive Programmer.'];
  }

  // Respect user preference by default, but allow a localStorage override
  // To force animations even when the OS has "reduce motion" enabled, run in console:
  // localStorage.setItem('reduced-motion-override','allow'); location.reload();
  const reduce = mqReduce.matches;
  let allowAnimations = false;
  try {
    const override = localStorage.getItem('reduced-motion-override');
    if (override === 'allow') allowAnimations = true;
  } catch (e) {}

  if (reduce && !allowAnimations) {
    // If user asked for reduced motion (and didn't override), show static text
    target.textContent = words[0];
    target.style.borderRightColor = 'transparent';
    return;
  }

  // If we get here, animations are allowed
  const reducePref = mqReduce.matches;
  if (reducePref) {
    // If reduce was true but user forced animations, keep caret visible
    // (we've already handled the fully reduced case above)
  }

  let wordIndex = 0;
  let charIndex = 0;
  let deleting = false;
  const typeDelay = 90;
  const deleteDelay = 60;
  const holdDelay = 1100; // pause at full word

  const tick = () => {
    const current = words[wordIndex];

    if (!deleting) {
      // typing
      charIndex = Math.min(charIndex + 1, current.length);
      target.textContent = current.slice(0, charIndex);
      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, holdDelay);
        return;
      }
      setTimeout(tick, typeDelay);
    } else {
      // deleting
      charIndex = Math.max(charIndex - 1, 0);
      target.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(tick, 300);
        return;
      }
      setTimeout(tick, deleteDelay);
    }
  };

  // Start
  target.textContent = '';
  tick();
}


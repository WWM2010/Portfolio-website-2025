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

  const targetX = mouseX - offsetX;
  const targetY = mouseY - offsetY;

  const easeAmount = 0.12;

  // Use transform for better performance
  const currentTransform = circle.style.transform || 'translate(0px, 0px)';
  const match = currentTransform.match(/translate\(([^,]+),\s*([^)]+)\)/);
  let currentX = 0, currentY = 0;
  if (match) {
    currentX = parseFloat(match[1]);
    currentY = parseFloat(match[2]);
  }

  const newX = currentX + (targetX - currentX) * easeAmount;
  const newY = currentY + (targetY - currentY) * easeAmount;

  circle.style.transform = `translate(${newX}px, ${newY}px)`;

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
    circle.style.transform = "";
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
        const duration = 2500;
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

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    target.textContent = words[0];
    target.style.borderRight = 'none';
    return;
  }

  let wordIndex = 0;
  let charIndex = 0;
  let state = 'typing'; // 'typing', 'holding', 'deleting', 'pausing'
  let lastUpdate = 0;
  let caretVisible = true;
  let lastBlink = 0;
  const typeDelay = 90;
  const deleteDelay = 60;
  const holdDelay = 1100;
  const pauseDelay = 300;
  const blinkDelay = 500;

  // Add caret style
  target.style.borderRight = '2px solid var(--main-color)';
  target.style.paddingRight = '2px';

  const animate = (timestamp) => {
    if (lastUpdate === 0) lastUpdate = timestamp;

    const delta = timestamp - lastUpdate;
    const blinkDelta = timestamp - lastBlink;

    // Handle caret blinking
    if (blinkDelta >= blinkDelay) {
      caretVisible = !caretVisible;
      target.style.borderRightColor = caretVisible ? 'var(--main-color)' : 'transparent';
      lastBlink = timestamp;
    }

    const current = words[wordIndex];

    if (state === 'typing') {
      if (delta >= typeDelay) {
        charIndex = Math.min(charIndex + 1, current.length);
        target.textContent = current.slice(0, charIndex);
        lastUpdate = timestamp;
        if (charIndex === current.length) {
          state = 'holding';
          lastUpdate = timestamp;
        }
      }
    } else if (state === 'holding') {
      if (delta >= holdDelay) {
        state = 'deleting';
        lastUpdate = timestamp;
      }
    } else if (state === 'deleting') {
      if (delta >= deleteDelay) {
        charIndex = Math.max(charIndex - 1, 0);
        target.textContent = current.slice(0, charIndex);
        lastUpdate = timestamp;
        if (charIndex === 0) {
          state = 'pausing';
          lastUpdate = timestamp;
        }
      }
    } else if (state === 'pausing') {
      if (delta >= pauseDelay) {
        state = 'typing';
        wordIndex = (wordIndex + 1) % words.length;
        lastUpdate = timestamp;
      }
    }

    requestAnimationFrame(animate);
  };

  // Start
  target.textContent = '';
  requestAnimationFrame(animate);
}

// Copy code functionality for code showcase
function copyCode() {
  const codeElement = document.querySelector('.code-display code');
  if (!codeElement) return;

  const textToCopy = codeElement.textContent || codeElement.innerText;

  navigator.clipboard.writeText(textToCopy).then(() => {
    const btn = document.querySelector('.copy-btn');
    if (btn) {
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.background = 'var(--highlight-color)';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = 'var(--main-color)';
      }, 2000);
    }
  }).catch(err => {
    console.error('Failed to copy: ', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      const btn = document.querySelector('.copy-btn');
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        btn.style.background = 'var(--highlight-color)';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = 'var(--main-color)';
        }, 2000);
      }
    } catch (fallbackErr) {
      console.error('Fallback copy failed: ', fallbackErr);
    }
    document.body.removeChild(textArea);
  });
}

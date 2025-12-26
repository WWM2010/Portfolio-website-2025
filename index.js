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

// Start counting when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startCountingAnimation);
} else {
  startCountingAnimation();
}

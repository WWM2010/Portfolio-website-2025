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

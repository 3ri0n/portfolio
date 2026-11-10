// Apply the saved theme before the browser paints the page.
try {
  if (localStorage.getItem('theme') === 'light') {
    document.documentElement.dataset.theme = 'light';
  }
} catch {
  // Storage can be unavailable in private or restricted browser sessions.
}

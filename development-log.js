(() => {
  const button = document.getElementById('diary-theme');
  const modes = ['system', 'light', 'dark'];
  const labels = {system: '自動', light: 'ライト', dark: 'ダーク'};
  const key = 'sq-development-log-theme';
  let current = 'system';
  try { const saved = localStorage.getItem(key); if (modes.includes(saved)) current = saved; } catch {}
  const apply = () => {
    if (current === 'system') delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = current;
    button.textContent = `テーマ：${labels[current]}`;
    button.setAttribute('aria-label', `表示テーマを切り替え（現在：${labels[current]}）`);
  };
  apply();
  button.addEventListener('click', () => {
    current = modes[(modes.indexOf(current) + 1) % modes.length];
    apply();
    try { localStorage.setItem(key, current); } catch {}
  });
})();

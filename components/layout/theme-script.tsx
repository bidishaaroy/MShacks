export function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem('clinai-theme');
        document.documentElement.classList.toggle('dark', stored === 'dark');
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

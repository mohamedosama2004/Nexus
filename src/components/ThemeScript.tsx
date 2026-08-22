export function ThemeScript() {
  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{
        __html: `
          try {
            var theme = localStorage.getItem('theme');
            if (theme === 'dark') {
              document.documentElement.setAttribute('data-theme', 'sunset');
            } else {
              document.documentElement.setAttribute('data-theme', 'corporate');
            }
          } catch (e) {}
        `,
      }}
    />
  );
}

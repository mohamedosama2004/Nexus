import Script from "next/script";

export function ThemeScript() {
  return (
    <Script
      id="theme-script"
      strategy="beforeInteractive"
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

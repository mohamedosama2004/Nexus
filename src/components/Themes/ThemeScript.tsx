export function ThemeScript({ nonce }: { nonce?: string | null }) {
  return (
    <script
      id="theme-script"
      nonce={nonce ?? undefined}
      suppressHydrationWarning
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

with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "import WaitlistPage from './components/WaitlistPage';",
    "import WaitlistPage from './components/WaitlistPage';\nimport AreaIntelligencePage from './components/AreaIntelligencePage';"
)

new_return = """  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text-primary)] font-sans antialiased selection:bg-[var(--theme-brand-bg)] selection:text-[var(--theme-brand-fg)]">
        {currentPath === '/area-intelligence' ? (
          <AreaIntelligencePage />
        ) : (
          <WaitlistPage />
        )}
      </div>
    </ThemeProvider>
  );"""

import re
content = re.sub(r"  return \(\n    <ThemeProvider>.*?</ThemeProvider>\n  \);", new_return, content, flags=re.DOTALL)

with open("src/App.tsx", "w") as f:
    f.write(content)

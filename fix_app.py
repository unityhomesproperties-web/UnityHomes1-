with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace("import WaitlistLandingPage from \"./components/WaitlistLandingPage\";\n", "")

content = content.replace("case \"/\":\n        return <WaitlistLandingPage navigate={navigate} />;", "case \"/\":\n        return <LandingPage navigate={navigate} />;")
content = content.replace("      case \"/waitlist\":\n        return <WaitlistLandingPage navigate={navigate} />;\n      case \"/waitlist-admin\":\n        return <WaitlistLandingPage navigate={navigate} isAdminRoute={true} />;\n", "")

content = content.replace("""  const isWaitlistRoute =
    currentPath === "/" || currentPath === "/waitlist" || currentPath === "/waitlist-admin";""", "")

content = content.replace("{/* GLOBAL HEADER HEADER (Hidden on waitlist routes to allow dedicated waitlist navbar) */}\n        {!isWaitlistRoute && (\n          <Navigation\n            currentPath={currentPath}\n            navigate={navigate}\n            session={session}\n            onLogout={handleLogout}\n          />\n        )}", "{/* GLOBAL HEADER HEADER */}\n        <Navigation\n          currentPath={currentPath}\n          navigate={navigate}\n          session={session}\n          onLogout={handleLogout}\n        />")

content = content.replace("{/* GLOBAL FOOTER FOOTER (Hidden on waitlist routes to allow dedicated waitlist footer) */}\n        {!isWaitlistRoute && <Footer navigate={navigate} />}", "{/* GLOBAL FOOTER FOOTER */}\n        <Footer navigate={navigate} />")

with open("src/App.tsx", "w") as f:
    f.write(content)

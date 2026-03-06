export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="auth-page">
      <section className="auth-shell">
        <h1 className="auth-brand">LumiFin</h1>
        <p className="auth-subtitle">Financial Analysis Platform</p>
        {children}
      </section>
    </main>
  );
}

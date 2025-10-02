export default function StylesPage() {
  return (
    <div className="section">
      <div className="container">
        <h1>Illustration Styles</h1>
        <p className="lead">Explore our full collection of illustration styles. From Google&apos;s clean aesthetic to Notion&apos;s friendly approach.</p>

        <div className="grid-3" style={{marginTop: '32px'}}>
          {/* Google Style */}
          <div className="card">
            <div className="tile-art" style={{
              background: `
                radial-gradient(closest-side at 35% 30%, rgba(255,31,139,.08), transparent 60%),
                radial-gradient(closest-side at 70% 60%, rgba(72,86,106,.06), transparent 62%),
                #fff`
            }}></div>
            <strong>Google</strong>
            <p className="muted">Clean, modern illustrations with vibrant colors and geometric shapes.</p>
          </div>

          {/* Notion Style */}
          <div className="card">
            <div className="tile-art" style={{
              background: `
                repeating-linear-gradient(90deg, rgba(14,20,32,.08) 0 1px, transparent 1px 20px),
                #fff`
            }}></div>
            <strong>Notion</strong>
            <p className="muted">Friendly, approachable illustrations perfect for documentation and guides.</p>
          </div>

          {/* Flat 2D Style */}
          <div className="card">
            <div className="tile-art" style={{
              background: `
                radial-gradient(closest-side at 30% 30%, rgba(230,233,238,.6), transparent 58%),
                radial-gradient(closest-side at 70% 55%, rgba(247,249,252,.7), transparent 58%),
                radial-gradient(closest-side at 50% 82%, rgba(238,244,255,.7), transparent 58%),
                #fff`
            }}></div>
            <strong>Flat 2D</strong>
            <p className="muted">Simple, flat design with bold colors and minimalist aesthetic.</p>
          </div>
        </div>

        <div className="section" style={{textAlign: 'center', paddingTop: '48px'}}>
          <p className="muted">More styles coming soon. Join the waitlist to be notified when new styles are available.</p>
        </div>
      </div>
    </div>
  );
}
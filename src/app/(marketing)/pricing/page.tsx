export default function PricingPage() {
  return (
    <div className="section">
      <div className="container">
        <div style={{textAlign: 'center', marginBottom: '48px'}}>
          <h1>Simple, transparent pricing</h1>
          <p className="lead">Choose the plan that works for your team. No hidden fees, cancel anytime.</p>
        </div>

        <div className="grid-3" style={{maxWidth: '900px', margin: '0 auto'}}>
          {/* Starter Plan */}
          <div className="card" style={{padding: '32px', textAlign: 'center'}}>
            <h3>Starter</h3>
            <div style={{margin: '16px 0'}}>
              <span style={{fontSize: '48px', fontWeight: 'bold'}}>$19</span>
              <span className="muted">/month</span>
            </div>
            <ul style={{textAlign: 'left', margin: '24px 0', paddingLeft: '16px'}}>
              <li>100 illustrations per month</li>
              <li>All popular styles</li>
              <li>PNG, JPG exports • Coming soon: SVG</li>
              <li>Commercial license included</li>
            </ul>
            <button className="btn btn-primary focusable" style={{width: '100%'}}>
              Coming Soon
            </button>
          </div>

          {/* Pro Plan */}
          <div className="card" style={{padding: '32px', textAlign: 'center', border: '2px solid var(--pink)'}}>
            <div style={{background: 'var(--pink)', color: 'white', padding: '4px 12px', borderRadius: '16px', display: 'inline-block', marginBottom: '16px', fontSize: '14px'}}>
              Most Popular
            </div>
            <h3>Pro</h3>
            <div style={{margin: '16px 0'}}>
              <span style={{fontSize: '48px', fontWeight: 'bold'}}>$49</span>
              <span className="muted">/month</span>
            </div>
            <ul style={{textAlign: 'left', margin: '24px 0', paddingLeft: '16px'}}>
              <li>500 illustrations per month</li>
              <li>All styles + custom training</li>
              <li>PNG, JPG exports • Coming soon: SVG</li>
              <li>Priority generation</li>
              <li>Team collaboration</li>
            </ul>
            <button className="btn btn-primary focusable" style={{width: '100%'}}>
              Coming Soon
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="card" style={{padding: '32px', textAlign: 'center'}}>
            <h3>Enterprise</h3>
            <div style={{margin: '16px 0'}}>
              <span style={{fontSize: '48px', fontWeight: 'bold'}}>Custom</span>
            </div>
            <ul style={{textAlign: 'left', margin: '24px 0', paddingLeft: '16px'}}>
              <li>Unlimited illustrations</li>
              <li>Custom style development</li>
              <li>API access</li>
              <li>Dedicated support</li>
              <li>Enterprise security</li>
            </ul>
            <button className="btn btn-ghost focusable" style={{width: '100%'}}>
              Contact Sales
            </button>
          </div>
        </div>

        <div style={{textAlign: 'center', marginTop: '48px'}}>
          <p className="muted">All plans include a 14-day free trial. No credit card required.</p>
        </div>
      </div>
    </div>
  );
}
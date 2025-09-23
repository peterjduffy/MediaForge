'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual waitlist signup
    alert('Thanks! We\'ll be in touch.');
    setEmail('');
  };

  return (
    <>
      {/* NAV */}
      <nav className="nav">
        <div className="container nav-inner">
          <Link href="/" className="brand" aria-label="MediaForge Home">
            <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
              <linearGradient id="g" x1="0" x2="1">
                <stop offset="0" stopColor="#FF1F8B"/>
                <stop offset="1" stopColor="#D91676"/>
              </linearGradient>
              <path fill="url(#g)" d="M12 2c2.4 3.1-.8 4.6-.8 6.9 0 1.6 1.3 2.9 3 2.9 2.8 0 5.5-2.6 6.3-5.9 2.4 7.1-2.6 12.7-8.4 13.6-4.9.7-8-2-8.4-5.7 1.8 1.6 3.8.6 5.6.6 1.9 0 3.5-1.5 3.5-3.4 0-3.3-2.8-4.3.4-8z"/>
            </svg>
            <span>MediaForge</span>
          </Link>
          <div className="links">
            <a href="#features">Features</a>
            <a href="#styles">Styles</a>
            <a href="#how">How it works</a>
            <a href="#use-cases">Use cases</a>
            <a href="#faq">FAQ</a>
            <Link href="/auth/signin" className="btn btn-primary focusable">Join the waitlist</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="container hero-grid">
          <div>
            <span className="kicker">On-brand, fast</span>
            <h1 className="title">Create on-brand illustrations that feel unmistakably yours.</h1>
            <p className="subtitle">Get publish-ready visuals in seconds for blogs, social and marketing pages - and keep everything brand-aligned across product and docs.</p>
            <div className="hero-cta">
              <Link href="/auth/signin" className="btn btn-primary focusable">Join the waitlist</Link>
              <a href="#styles" className="btn btn-ghost focusable">See styles</a>
            </div>
            <div className="badge-row">
              <span className="badge">Brand aligned</span>
              <span className="badge">Speed & efficiency</span>
              <span className="badge">Team friendly</span>
            </div>

            {/* PROMINENT EXPORT + LICENSE STRIP */}
            <div className="strip" role="note" aria-label="Export and licensing">
              <strong>Export your illustration as</strong>
              <span>SVG, PNG, JPG, EPS, AI, WebP</span>
              <span className="dot-sep" aria-hidden="true"></span>
              <strong>Royalty free, commercial use license included</strong>
            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="panel" aria-label="Hero image">
            <div className="mock">
              <div className="toolbar">
                <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                  <span className="dot"></span>
                  <span className="dot" style={{opacity:'.65'}}></span>
                  <span className="dot" style={{opacity:'.4'}}></span>
                </div>
                <strong style={{fontSize:'13px', color:'var(--pink-700)'}}>Preview</strong>
              </div>

              <div className="preview">
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: '14px'
                }}>
                  Hero illustration placeholder
                </div>
              </div>
              <div className="note">Tip: 4:3 or 16:10 images work best here.</div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <section id="features" className="section">
        <div className="container">
          <h2>Built for fast, on-brand content</h2>
          <p className="lead">Give teams a simple way to create on-brand visuals - without long illustration cycles.</p>
          <div className="grid-3" style={{marginTop:'16px'}}>
            {/* 1 Speed */}
            <div className="card">
              <span className="kicker" style={{marginBottom:'8px'}}>Speed</span>
              <h3>From prompt to publish</h3>
              <p className="muted">Create options quickly, pick a favourite and move on - ship campaigns and updates faster.</p>
            </div>
            {/* 2 Consistency */}
            <div className="card">
              <span className="kicker" style={{marginBottom:'8px'}}>Consistency</span>
              <h3>One look everywhere</h3>
              <p className="muted">Landing pages, product UI, docs, blogs and social all feel connected - not stitched together.</p>
            </div>
            {/* 3 Styles */}
            <div className="card">
              <span className="kicker" style={{marginBottom:'8px'}}>Styles</span>
              <h3>Start with presets</h3>
              <p className="muted">Pick a familiar style as a starting point, then save a custom look for your brand when ready.</p>
            </div>
            {/* 4 Teams */}
            <div className="card">
              <span className="kicker" style={{marginBottom:'8px'}}>Teams</span>
              <h3>Simple for everyone</h3>
              <p className="muted">A straightforward flow your whole team can use - fewer handoffs and fewer edits.</p>
            </div>
            {/* 5 Alignment */}
            <div className="card">
              <span className="kicker" style={{marginBottom:'8px'}}>Alignment</span>
              <h3>Reflect your guidelines</h3>
              <p className="muted">Set the look - palette and overall style - then generate assets that stay true to it across pages and channels.</p>
            </div>
            {/* 6 Use anywhere */}
            <div className="card">
              <span className="kicker" style={{marginBottom:'8px'}}>Use anywhere</span>
              <h3>Web, product, blogs, social</h3>
              <p className="muted">Ready for your site, UI, help center, articles, newsletters and campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR STYLES */}
      <section id="styles" className="section">
        <div className="container">
          <h2>Pick from popular styles</h2>
          <p className="lead">Start with a familiar look. Switch anytime.</p>
          <div className="grid-3" style={{marginTop:'16px'}}>
            {/* Google */}
            <div className="card">
              <div className="tile-art" style={{
                background: `
                  radial-gradient(closest-side at 35% 30%, rgba(255,31,139,.08), transparent 60%),
                  radial-gradient(closest-side at 70% 60%, rgba(72,86,106,.06), transparent 62%),
                  #fff`
              }}></div>
              <strong>Google</strong>
            </div>

            {/* Notion */}
            <div className="card">
              <div className="tile-art" style={{
                background: `
                  repeating-linear-gradient(90deg, rgba(14,20,32,.08) 0 1px, transparent 1px 20px),
                  #fff`
              }}></div>
              <strong>Notion</strong>
            </div>

            {/* Flat 2D */}
            <div className="card">
              <div className="tile-art" style={{
                background: `
                  radial-gradient(closest-side at 30% 30%, rgba(230,233,238,.6), transparent 58%),
                  radial-gradient(closest-side at 70% 55%, rgba(247,249,252,.7), transparent 58%),
                  radial-gradient(closest-side at 50% 82%, rgba(238,244,255,.7), transparent 58%),
                  #fff`
              }}></div>
              <strong>Flat 2D</strong>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section id="use-cases" className="section">
        <div className="container">
          <h2>Where teams use MediaForge</h2>
          <p className="lead">Consistent visuals across the places that matter.</p>
          <div className="grid-4" style={{marginTop:'16px'}}>
            <div className="card">
              <h3>Marketing pages</h3>
              <p className="muted">Hero graphics, feature sections and comparisons - kept in the same style from page to page.</p>
            </div>
            <div className="card">
              <h3>Go-to-market</h3>
              <p className="muted">Illustrations for sales, customer success and enablement - decks, one-pagers and help center content.</p>
            </div>
            <div className="card">
              <h3>Documentation</h3>
              <p className="muted">Spot illustrations and diagrams that keep technical content clear and consistent.</p>
            </div>
            <div className="card">
              <h3>Blogs & social</h3>
              <p className="muted">Post-ready visuals for articles, newsletters and campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section">
        <div className="container">
          <h2>How it works</h2>
          <p className="lead">From prompt to on-brand visuals in a few steps.</p>
          <div className="how" style={{marginTop:'16px'}}>
            <div className="step">
              <div>
                <strong>Set brand inputs</strong>
                <p className="muted">Add colours and a few references. Pick a starting style.</p>
              </div>
            </div>
            <div className="step">
              <div>
                <strong>Write a prompt</strong>
                <p className="muted">Describe the scene or concept you need.</p>
              </div>
            </div>
            <div className="step">
              <div>
                <strong>Generate options</strong>
                <p className="muted">Create variations, choose the best and refine if needed.</p>
              </div>
            </div>
            <div className="step">
              <div>
                <strong>Export</strong>
                <p className="muted">Download common formats for quick use online or in design tools.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="get-started" className="section" style={{paddingTop:'0'}}>
        <div className="container">
          <div className="panel" style={{padding:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap'}}>
            <div>
              <h2>Join the waitlist</h2>
              <p className="muted">Be first to try MediaForge as we roll out new styles.</p>
            </div>
            <form className="newsletter" onSubmit={handleSubmit} style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  flex:'1',
                  minWidth:'240px',
                  padding:'12px 14px',
                  borderRadius:'999px',
                  border:'1px solid var(--border)'
                }}
              />
              <button className="btn btn-primary focusable" type="submit" style={{borderRadius:'999px'}}>
                Join the waitlist
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <h2>FAQs</h2>
          <div className="grid-3 faq" style={{marginTop:'16px'}}>
            <details open>
              <summary>Do outputs match our brand?</summary>
              <p className="muted">Yes. Set the look once and generate visuals that stay aligned with your guidelines across pages and channels.</p>
            </details>
            <details>
              <summary>Who owns the assets we create?</summary>
              <p className="muted">You own everything you generate with MediaForge - royalty free and ready for commercial use.</p>
            </details>
            <details>
              <summary>What styles are included?</summary>
              <p className="muted">Popular presets like Google, Notion and Flat 2D. You can also save a custom look for your brand.</p>
            </details>
            <details>
              <summary>Can we train a style for our brand?</summary>
              <p className="muted">Yes. Start from a preset, upload a few references, lock colours and save the result as a reusable style for your team.</p>
            </details>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container" style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'16px', flexWrap:'wrap'}}>
          <div>&copy; {new Date().getFullYear()} MediaForge</div>
          <div className="muted">On-brand illustrations for blogs, social, marketing pages, product UI and docs.</div>
        </div>
      </footer>
    </>
  );
}

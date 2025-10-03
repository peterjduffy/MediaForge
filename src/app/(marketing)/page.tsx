'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Features } from '@/components/marketing/Features';
import Link from 'next/link';

export default function HomePage() {
  // No local waitlist form on the homepage; CTA links to sign-in.

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const steps = Array.from(document.querySelectorAll('.howitworks .step')) as HTMLElement[];
    if (!('IntersectionObserver' in window)) {
      steps.forEach((s) => s.classList.add('is-active'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) (e.target as HTMLElement).classList.add('is-active');
      });
    }, { threshold: 0.35 });
    steps.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* HERO */}
      <header className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <div className="hero-content-inner">
              <span className="kicker">On-brand, fast</span>

              <div className="hero-text">
                <h1 className="title">
                  Unbland Your
                  <span className="title-highlight">Imagery</span>
                </h1>

                <p className="subtitle">
                  Create brand-ready illustrations in seconds. MediaForge generates imagery that looks and feels unmistakably yours - fast, consistent, and ready to drop into blogs, decks, and campaigns.
                </p>
              </div>

              <div className="hero-cta">
                <Link href="/auth/signin" className="btn btn-primary focusable">Join the waitlist</Link>
                <a href="#styles" className="btn btn-ghost focusable">See styles</a>
              </div>

              <div className="hero-trust">
                <div>
                  <strong>Export:</strong> PNG, JPEG, SVG
                </div>
                <div className="hero-trust-divider" />
                <div>Royalty-free commercial license included</div>
              </div>
            </div>
          </div>

          {/* HERO IMAGE (floating, no card) */}
          <div className="flex items-center justify-center">
            <Image
              src="/Mediaforge_hero.png"
              alt="Person creating on-brand illustrations on a laptop with MediaForge"
              width={960}
              height={720}
              priority
              sizes="(max-width: 1024px) 100vw, 560px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Crect width='10' height='7' fill='%23ffeef7'/%3E%3C/svg%3E"
              className="w-full max-w-[560px] rounded-xl shadow-[0_20px_60px_rgba(15,23,42,.12)]"
            />
          </div>
        </div>
      </header>

      {/* FEATURES */}
      <Features />

      {/* POPULAR STYLES */}
      <section id="styles" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Pick from popular styles</h2>
            <p className="section-sub">Start with a familiar look. Switch anytime.</p>
          </div>
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
          <div className="section-head">
            <h2>Where teams use MediaForge</h2>
            <p className="section-sub">Consistent visuals across the places that matter.</p>
          </div>

          <div className="mx-auto mt-4 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
            {[
              {
                title: 'Marketing pages',
                description:
                  'Hero graphics, feature sections and comparisons - kept in the same style from page to page.',
              },
              {
                title: 'Go-to-market',
                description:
                  'Illustrations for sales, customer success and enablement - decks, one-pagers and help center content.',
              },
              {
                title: 'Documentation',
                description:
                  'Spot illustrations and diagrams that keep technical content clear and consistent.',
              },
              {
                title: 'Blogs & social',
                description:
                  'Post-ready visuals for articles, newsletters and campaigns.',
              },
            ].map((uc) => (
              <div key={uc.title} className="card p-6">
                <h3 className="mb-2 text-[20px] font-extrabold">{uc.title}</h3>
                <p className="muted">{uc.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="section howitworks" aria-labelledby="how-heading">
        <div className="container">
          <div className="section-head">
            <h2 id="how-heading">How it works</h2>
            <p className="section-sub">Four quick steps from brand inputs to export-ready assets.</p>
          </div>
          <div className="howitworks__inner">
            <figure className="howitworks__art panel">
              <Image
                src="/man-at-desk.png"
                alt="Apply brand styling to visuals on a desktop"
                width={800}
                height={600}
                loading="lazy"
              />
            </figure>

            <div className="howitworks__steps">
              <ul className="stepper" role="list">
                <li className="step">
                  <div className="step__dot" aria-hidden="true"></div>
                  <div className="step__body">
                    <h3 className="step__title">Set brand inputs</h3>
                    <p className="step__text">Add logo, colours, fonts, and a few reference images.</p>
                  </div>
                </li>
                <li className="step">
                  <div className="step__dot" aria-hidden="true"></div>
                  <div className="step__body">
                    <h3 className="step__title">Pick a starting style</h3>
                    <p className="step__text">Choose Company Style or a preset (Google, Notion, etc.).</p>
                  </div>
                </li>
                <li className="step">
                  <div className="step__dot" aria-hidden="true"></div>
                  <div className="step__body">
                    <h3 className="step__title">Generate on-brand visuals</h3>
                    <p className="step__text">Consistent illustrations with your palette + guidelines applied.</p>
                  </div>
                </li>
                <li className="step">
                  <div className="step__dot" aria-hidden="true"></div>
                  <div className="step__body">
                    <h3 className="step__title">Export &amp; share</h3>
                    <p className="step__text">Download PNG/JPEG/SVG, copy to clipboard, or push to your library.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA removed per request */}

      {/* FAQ */}
      <section id="faq" className="section">
        <div className="container">
          <div className="section-head">
            <h2>Frequently asked questions</h2>
            <p className="section-sub">Everything you need to know about MediaForge.</p>
          </div>
          <div className="faq" style={{marginTop:'16px', display:'grid', gap:'12px', maxWidth:'820px', marginLeft:'auto', marginRight:'auto'}}>
            <details>
              <summary>Can I use these commercially?</summary>
              <p className="muted">Yes. You can use the images you generate for commercial and non-commercial projects under our royalty-free license. No per-use royalties. Please review our <Link href="/terms" className="underline">Terms</Link> and avoid infringing third-party trademarks or copyrights.</p>
            </details>
            <details>
              <summary>How does the style system work?</summary>
              <p className="muted">Choose from preset styles or create your own by setting colors and visual preferences, and optionally uploading brand assets or reference images. Your custom styles are saved to your account for reuse.</p>
            </details>
            <details>
              <summary>What file formats can I download my illustrations in?</summary>
              <p className="muted">PNG, JPEG, and SVG. PNG/JPEG exports are high-resolution; SVG is vector and scales cleanly. There’s no extra cost per format.</p>
            </details>
            <details>
              <summary>Can I create and save custom AI styles?</summary>
              <p className="muted">Absolutely. Build styles from your brand assets or reference images; they’re saved to your account and reusable across projects.</p>
            </details>
            <details>
              <summary>Can I create consistent characters across multiple illustrations?</summary>
              <p className="muted">Yes. Provide reference images to define your character and generate scenes that keep key facial features, attire, and proportions consistent. Results are typically very consistent, with small variation possible across complex poses.</p>
            </details>
            <details>
              <summary>Does MediaForge integrate with Figma, Canva, or Adobe?</summary>
              <p className="muted">You can export SVG/PNG and import into Figma, Canva, and Adobe apps today. Dedicated plugins and deeper integrations are in development.</p>
            </details>
            <details>
              <summary>Can I vectorize existing JPEG/PNG images?</summary>
              <p className="muted">MediaForge focuses on AI generation. You can use raster references to inspire new vector SVGs. For one-to-one raster-to-vector conversion, use dedicated tools like Illustrator’s Image Trace or similar services.</p>
            </details>
            <details>
              <summary>How often do you update your AI models?</summary>
              <p className="muted">We ship improvements regularly and roll them out automatically. MediaForge runs a multi-model stack and routes to the best model per job.</p>
            </details>
            <details>
              <summary>Can my whole team use MediaForge?</summary>
              <p className="muted">Yes. MediaForge supports team workflows so you can share styles and keep visuals consistent across your content.</p>
            </details>
            <details>
              <summary>What if I need changes to an illustration?</summary>
              <p className="muted">Iterate quickly by editing your prompt or tweaking style settings. Generate multiple variations and pick your favorite.</p>
            </details>
            <details>
              <summary>Can&apos;t Google&apos;s Gemini or ChatGPT do this?</summary>
              <p className="muted">They&apos;re great general-purpose AIs, but MediaForge is purpose-built for brand illustration. No prompt wrangling: pick a pre-set or saved style, and generate consistent, on-brand visuals. You get reusable styles, character consistency, team controls, and upcoming Figma/Canva plugins. We run on enterprise-grade infrastructure and are part of the Google Cloud Partner Advantage programme, so you get reliability as well as speed.</p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="section" style={{paddingTop:'0'}}>
        <div className="container">
          <div className="section-head">
            <h2>Ready to unbland your imagery?</h2>
            <p className="section-sub">Join the waitlist to create on-brand visuals faster than ever.</p>
          </div>
          <div style={{display:'flex', justifyContent:'center'}}>
            <Link href="/auth/signin" className="btn btn-primary focusable" style={{padding:'18px 28px', fontSize:'18px'}}>
              Join the waitlist
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

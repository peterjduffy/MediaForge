'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function MarketingNav() {
  return (
    <nav className="nav">
      <div className="container nav-inner">
        <Link href="/" className="brand" aria-label="MediaForge Home">
          <Logo size="sm" />
          <span>MediaForge</span>
        </Link>
        <div className="links">
          <a href="#features">Features</a>
          <a href="#styles">Styles</a>
          <a href="#how">How it works</a>
          <a href="#use-cases">Use cases</a>
          <a href="#faq">FAQ</a>
          <Link href="/auth/signin" className="btn btn-primary nav-cta focusable">Join the waitlist</Link>
        </div>
      </div>
    </nav>
  );
}

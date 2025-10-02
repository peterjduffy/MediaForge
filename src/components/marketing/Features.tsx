"use client";

import React from "react";

type Feature = {
  label: string;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    label: "Speed",
    title: "From prompt to publish",
    description:
      "Create options quickly, pick a favourite and move on - ship campaigns and updates faster.",
  },
  {
    label: "Consistency",
    title: "One look everywhere",
    description:
      "Landing pages, product UI, docs, blogs and social all feel connected - not stitched together.",
  },
  {
    label: "Styles",
    title: "Start with presets",
    description:
      "Pick a familiar style as a starting point, then save a custom look for your brand when ready.",
  },
  {
    label: "Teams",
    title: "Simple for everyone",
    description:
      "A straightforward flow your whole team can use - fewer handoffs and fewer edits.",
  },
  {
    label: "Alignment",
    title: "Reflect your guidelines",
    description:
      "Set the look - palette and overall style - then generate assets that stay true to it across pages and channels.",
  },
  {
    label: "Use anywhere",
    title: "Web, product, blogs, social",
    description:
      "Ready for your site, UI, help center, articles, newsletters and campaigns.",
  },
];

export function Features() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="section features"
      data-build="features-v3-20251002"
    >

      <div className="container">
        <div className="features-head">
          <h2 id="features-heading">Built for fast, on-brand content</h2>
          <p className="features-sub">
            Give teams a simple way to create on-brand visuals - without long illustration cycles.
          </p>
        </div>

        <div className="mx-auto features-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="card p-6">
              <span className="kicker mb-2 inline-block">{feature.label}</span>
              <h3 className="mb-2 text-[18px] font-semibold">{feature.title}</h3>
              <p className="muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;

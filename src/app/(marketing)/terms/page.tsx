export default function TermsPage() {
  return (
    <div className="section">
      <div className="container" style={{maxWidth: '800px'}}>
        <h1>Terms of Service</h1>
        <p className="muted">Last updated: {new Date().toLocaleDateString()}</p>

        <div style={{marginTop: '32px'}}>
          <h2>Acceptance of Terms</h2>
          <p>By accessing and using MediaForge, you accept and agree to be bound by the terms and provision of this agreement.</p>

          <h2>Use License</h2>
          <p>Permission is granted to temporarily download one copy of MediaForge per device for personal, non-commercial transitory viewing only.</p>

          <h2>Generated Content</h2>
          <p>You own all rights to illustrations generated through our service. All generated content comes with a royalty-free, commercial use license.</p>

          <h2>Disclaimer</h2>
          <p>The materials on MediaForge are provided on an &apos;as is&apos; basis. MediaForge makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.</p>

          <h2>Limitations</h2>
          <p>In no event shall MediaForge or its suppliers be liable for any damages arising out of the use or inability to use our service.</p>

          <h2>Accuracy of Materials</h2>
          <p>The materials appearing on MediaForge could include technical, typographical, or photographic errors. MediaForge does not warrant that any of the materials on its service are accurate, complete, or current.</p>

          <h2>Contact Information</h2>
          <p>If you have any questions about these Terms of Service, please contact us at legal@mediaforge.com.</p>
        </div>
      </div>
    </div>
  );
}
export default function SecurityPage() {
  return (
    <div className="section">
      <div className="container" style={{maxWidth: '800px'}}>
        <h1>Security & Compliance</h1>
        <p className="lead">Your data security and privacy are our top priorities.</p>

        <div style={{marginTop: '32px'}}>
          <h2>Data Protection</h2>
          <p>All data is encrypted in transit and at rest using industry-standard encryption protocols. We use Google Cloud Platform&apos;s security infrastructure to protect your information.</p>

          <h2>Infrastructure Security</h2>
          <p>Our services run on Google Cloud Platform, which maintains SOC 2, ISO 27001, and other security certifications. We inherit these security controls and add our own application-level protections.</p>

          <h2>Access Controls</h2>
          <p>We implement strict access controls and authentication mechanisms. Only authorized personnel have access to user data, and all access is logged and monitored.</p>

          <h2>Data Retention</h2>
          <p>We retain your data only as long as necessary to provide our services. You can delete your account and data at any time through your account settings.</p>

          <h2>AI Model Security</h2>
          <p>Your prompts and generated images are not used to train our AI models. All generation happens in secure, isolated environments.</p>

          <h2>Compliance</h2>
          <p>MediaForge is designed to comply with GDPR, CCPA, and other privacy regulations. We regularly audit our security practices and update our policies as needed.</p>

          <h2>Incident Response</h2>
          <p>In the unlikely event of a security incident, we have established procedures to quickly identify, contain, and resolve issues while keeping affected users informed.</p>

          <h2>Questions?</h2>
          <p>If you have questions about our security practices, please contact our security team at security@mediaforge.com.</p>
        </div>
      </div>
    </div>
  );
}
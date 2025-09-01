import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    // Add noindex meta tag
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow, noarchive, nosnippet';
    document.head.appendChild(metaRobots);

    // Additional Googlebot specific tag
    const metaGooglebot = document.createElement('meta');
    metaGooglebot.name = 'googlebot';
    metaGooglebot.content = 'noindex, nofollow, noarchive, nosnippet';
    document.head.appendChild(metaGooglebot);

    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaGooglebot);
    };
  }, []);

  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="legal-page privacy-page">
      <div className="legal-container">
        {/* Header Section */}
        <div className="legal-header">
          <div className="legal-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">Last updated: {lastUpdated}</p>
          <div className="legal-divider"></div>
        </div>

        {/* Main Content */}
        <div className="legal-content">
          {/* Content Header */}
          <div className="legal-content-header">
            <h2 className="legal-content-title">Your Privacy Matters</h2>
            <p className="legal-content-desc">Learn how we collect, use, and protect your information.</p>
          </div>

          {/* Content Body */}
          <div className="legal-content-body">
            <p className="legal-intro">
              This Privacy Policy describes how CodeXero ("we," "us," or "our") collects, uses, and discloses your information when you use our website and services (collectively, the "Service").
            </p>

            <div>
              {/* Section 1 */}
              <div className="legal-section">
                <h3>1. Information We Collect</h3>
                <p>We collect various types of information in connection with the Service, including:</p>
                <ul className="legal-list">
                  <li><strong>Personal Information:</strong> Such as your wallet address, email address (if provided), and Twitter username (if connected).</li>
                  <li><strong>Usage Data:</strong> Information about how you access and use the Service, including IP address, browser type, pages visited, and time spent on pages.</li>
                  <li><strong>Blockchain Data:</strong> Publicly available information on the blockchain related to your wallet address and transactions.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="legal-section">
                <h3>2. How We Use Your Information</h3>
                <p>We use the collected information for various purposes, including:</p>
                <ul className="legal-list">
                  <li>To provide, maintain, and improve our Service</li>
                  <li>To process your NFT minting requests and other transactions</li>
                  <li>To verify your identity for social verification steps</li>
                  <li>To communicate with you, including sending updates and promotional materials</li>
                  <li>To monitor and analyze usage and trends to improve your experience</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="legal-section">
                <h3>3. Sharing Your Information</h3>
                <p>We may share your information in the following situations:</p>
                <ul className="legal-list">
                  <li><strong>With Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., Supabase for authentication).</li>
                  <li><strong>For Legal Reasons:</strong> If required by law or in response to valid requests by public authorities.</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, sale of company assets, or acquisition.</li>
                  <li><strong>Blockchain Transparency:</strong> Transactions on the blockchain are public and immutable.</li>
                </ul>
              </div>

              {/* Section 4 */}
              <div className="legal-section">
                <h3>4. Data Security</h3>
                <p>We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
                <div className="legal-highlight">
                  <p><strong>Important:</strong> We cannot guarantee absolute security of your information, but we continuously work to maintain the highest security standards.</p>
                </div>
              </div>

              {/* Section 5 */}
              <div className="legal-section">
                <h3>5. Your Rights (GDPR)</h3>
                <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights, including:</p>
                <ul className="legal-list">
                  <li>The right to access, update, or delete the information we have on you</li>
                  <li>The right of rectification</li>
                  <li>The right to object</li>
                  <li>The right of restriction</li>
                  <li>The right to data portability</li>
                  <li>The right to withdraw consent</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="legal-section">
                <h3>6. Third-Party Links</h3>
                <p>Our Service may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
              </div>

              {/* Section 7 */}
              <div className="legal-section">
                <h3>7. Children's Privacy</h3>
                <div className="legal-highlight">
                  <p>Our Service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.</p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="legal-section">
                <h3>8. Changes to This Privacy Policy</h3>
                <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
              </div>

              {/* Section 9 */}
              <div className="legal-section">
                <h3>9. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@codexero.xyz" className="legal-link">privacy@codexero.xyz</a></p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="legal-footer">
            <div className="legal-brand">
              <div className="legal-brand-icon">CX</div>
              <span className="legal-brand-name">CodeXero</span>
            </div>
            <span className="legal-copyright">© 2025 CodeXero. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
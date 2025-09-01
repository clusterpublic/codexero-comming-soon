import React, { useEffect } from 'react';

const TermsOfService = () => {
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
    <div className="legal-page">
      <div className="legal-container">
        {/* Header Section */}
        <div className="legal-header">
          <div className="legal-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-subtitle">Last updated: {lastUpdated}</p>
          <div className="legal-divider"></div>
        </div>

        {/* Main Content */}
        <div className="legal-content">
          {/* Content Header */}
          <div className="legal-content-header">
            <h2 className="legal-content-title">Welcome to CodeXero</h2>
            <p className="legal-content-desc">Please read these terms carefully before using our services.</p>
          </div>

          {/* Content Body */}
          <div className="legal-content-body">
            <p className="legal-intro">
              Welcome to CodeXero! These Terms of Service ("Terms") govern your access to and use of the CodeXero website, products, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
            </p>

            <div>
              {/* Section 1 */}
              <div className="legal-section">
                <h3>1. Acceptance of Terms</h3>
                <p>By creating an account, accessing, or using the Service, you represent that you have read, understood, and agree to be bound by these Terms, including any future modifications.</p>
              </div>

              {/* Section 2 */}
              <div className="legal-section">
                <h3>2. Changes to Terms</h3>
                <p>We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on the Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.</p>
              </div>

              {/* Section 3 */}
              <div className="legal-section">
                <h3>3. User Accounts</h3>
                <p>You may need to create an account to access certain features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
              </div>

              {/* Section 4 */}
              <div className="legal-section">
                <h3>4. Prohibited Uses</h3>
                <p>You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service. Prohibited activities include, but are not limited to:</p>
                <ul className="legal-list">
                  <li>Engaging in any form of illegal activity</li>
                  <li>Distributing malware or other harmful code</li>
                  <li>Attempting to gain unauthorized access to the Service or other users' accounts</li>
                  <li>Harassing, abusing, or harming another person</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="legal-section">
                <h3>5. Intellectual Property</h3>
                <p>All content, trademarks, service marks, trade names, logos, and other intellectual property displayed on the Service are owned by CodeXero or its licensors. You may not use, copy, reproduce, modify, or distribute any of these without our prior written consent.</p>
              </div>

              {/* Section 6 */}
              <div className="legal-section">
                <h3>6. Digital Assets and NFTs</h3>
                <p>The Service may involve digital assets, including Non-Fungible Tokens (NFTs). You acknowledge and agree that:</p>
                <ul className="legal-list">
                  <li>You are solely responsible for the security of your digital wallets and private keys</li>
                  <li>We are not responsible for any loss or theft of digital assets</li>
                  <li>The value of digital assets can be highly volatile</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="legal-section">
                <h3>7. Disclaimers</h3>
                <div className="legal-highlight">
                  <p><strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</strong></p>
                </div>
              </div>

              {/* Section 8 */}
              <div className="legal-section">
                <h3>8. Limitation of Liability</h3>
                <div className="legal-highlight">
                  <p><strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, CODEXERO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.</strong></p>
                </div>
              </div>

              {/* Section 9 */}
              <div className="legal-section">
                <h3>9. Governing Law</h3>
                <p>These Terms shall be governed by the laws of the jurisdiction where CodeXero is incorporated, without regard to its conflict of law principles.</p>
              </div>

              {/* Section 10 */}
              <div className="legal-section">
                <h3>10. Contact Us</h3>
                <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@codexero.xyz" className="legal-link">support@codexero.xyz</a></p>
              </div>
              </div>
            </div>

            <div className="legal-footer">
            <div className="legal-brand">
              <div className="legal-brand-icon">CX</div>
              <span className="legal-brand-name">CodeXero</span>
            </div>
            <span className="legal-copyright">© 2025 CodeXero. All rights reserved.</span>
          </div>
          </div>

          {/* Footer */}

        </div>
      </div>
    
  );
};

export default TermsOfService;

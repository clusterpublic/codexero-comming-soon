import React, { useEffect } from 'react';
import Header from '../components/Header.jsx';

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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('./assets/backgroubnd.jpg')" }}>
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        {/* Header Component */}
        <Header showWaitlistButton={false} />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Page Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-6">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-10 h-10 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600 mb-6">Last updated: {lastUpdated}</p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-200/50 shadow-2xl shadow-orange-500/20 overflow-hidden">
            {/* Content Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 py-12 text-center border-b border-orange-200/30">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to CodeXero</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Please read these terms carefully before using our services.</p>
            </div>

            {/* Content Body */}
            <div className="px-8 py-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
                Welcome to CodeXero! These Terms of Service ("Terms") govern your access to and use of the CodeXero website, products, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Service.
              </p>

              <div className="space-y-12">
                {/* Section 1 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">1</span>
                      Acceptance of Terms
                    </h3>
                    <p className="text-gray-700">By creating an account, accessing, or using the Service, you represent that you have read, understood, and agree to be bound by these Terms, including any future modifications.</p>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">2</span>
                      Changes to Terms
                    </h3>
                    <p className="text-gray-700">We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on the Service. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.</p>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">3</span>
                      User Accounts
                    </h3>
                    <p className="text-gray-700">You may need to create an account to access certain features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">4</span>
                      Prohibited Uses
                    </h3>
                    <p className="text-gray-700 mb-4">You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service. Prohibited activities include, but are not limited to:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Engaging in any form of illegal activity</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Distributing malware or other harmful code</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Attempting to gain unauthorized access to the Service or other users' accounts</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">Harassing, abusing, or harming another person</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">5</span>
                      Intellectual Property
                    </h3>
                    <p className="text-gray-700">All content, trademarks, service marks, trade names, logos, and other intellectual property displayed on the Service are owned by CodeXero or its licensors. You may not use, copy, reproduce, modify, or distribute any of these without our prior written consent.</p>
                  </div>
                </div>

                {/* Section 6 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">6</span>
                      Digital Assets and NFTs
                    </h3>
                    <p className="text-gray-700 mb-4">The Service may involve digital assets, including Non-Fungible Tokens (NFTs). You acknowledge and agree that:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">You are solely responsible for the security of your digital wallets and private keys</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">We are not responsible for any loss or theft of digital assets</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">The value of digital assets can be highly volatile</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 7 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">7</span>
                      Disclaimers
                    </h3>
                    <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/50 rounded-xl p-6">
                      <p className="text-red-800 font-semibold text-center">
                        <strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 8 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">8</span>
                      Limitation of Liability
                    </h3>
                    <div className="bg-gradient-to-r from-red-50/80 to-orange-50/80 border border-red-200/50 rounded-xl p-6">
                      <p className="text-red-800 font-semibold text-center">
                        <strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, CODEXERO SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.</strong>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 9 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">9</span>
                      Governing Law
                    </h3>
                    <p className="text-gray-700">These Terms shall be governed by the laws of the jurisdiction where CodeXero is incorporated, without regard to its conflict of law principles.</p>
                  </div>
                </div>

                {/* Section 10 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">10</span>
                      Contact Us
                    </h3>
                    <p className="text-gray-700">If you have any questions about these Terms, please contact us at <a href="mailto:support@codexero.xyz" className="text-orange-600 hover:text-orange-700 font-semibold underline transition-colors duration-300">support@codexero.xyz</a></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-orange-50/30 px-8 py-8 border-t border-orange-200/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    CX
                  </div>
                  <span className="text-lg font-semibold text-gray-800">CodeXero</span>
                </div>
                <span className="text-gray-600 text-sm">© 2025 CodeXero. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;

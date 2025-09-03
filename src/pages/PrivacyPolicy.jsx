import React, { useEffect } from 'react';
import Header from '../components/Header.jsx';

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
    <div className="min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('./assets/backgroubnd.jpg')" }}>
      <div className="min-h-screen bg-black/20 backdrop-blur-sm">
        {/* Header Component */}
        <Header showWaitlistButton={false} />
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Page Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full border border-orange-400/30 backdrop-blur-lg mb-6">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-10 h-10 text-orange-500">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-orange-500 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 mb-6">Last updated: {lastUpdated}</p>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-red-500 mx-auto rounded-full"></div>
          </div>

          {/* Main Content */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-orange-200/50 shadow-2xl shadow-orange-500/20 overflow-hidden">
            {/* Content Header */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 py-12 text-center border-b border-orange-200/30">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Privacy Matters</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Learn how we collect, use, and protect your information with the highest standards of security and transparency.</p>
            </div>

            {/* Content Body */}
            <div className="px-8 py-12">
              <p className="text-lg text-gray-700 leading-relaxed mb-12 text-center max-w-3xl mx-auto">
                This Privacy Policy describes how CodeXero ("we," "us," or "our") collects, uses, and discloses your information when you use our website and services (collectively, the "Service").
              </p>

              <div className="space-y-12">
                {/* Section 1 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">1</span>
                      Information We Collect
                    </h3>
                    <p className="text-gray-700 mb-4">We collect various types of information in connection with the Service, including:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700"><strong className="text-gray-800">Personal Information:</strong> Such as your wallet address, email address (if provided), and Twitter username (if connected).</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700"><strong className="text-gray-800">Usage Data:</strong> Information about how you access and use the Service, including IP address, browser type, pages visited, and time spent on pages.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700"><strong className="text-gray-800">Blockchain Data:</strong> Publicly available information on the blockchain related to your wallet address and transactions.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">2</span>
                      How We Use Your Information
                    </h3>
                    <p className="text-gray-700 mb-4">We use the collected information for various purposes, including:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">To provide, maintain, and improve our Service</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">To process your NFT minting requests and other transactions</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">To verify your identity for social verification steps</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">To communicate with you, including sending updates and promotional materials</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">To monitor and analyze usage and trends to improve your experience</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">3</span>
                      Sharing Your Information
                    </h3>
                    <p className="text-gray-700 mb-4">We may share your information in the following situations:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700"><strong className="text-gray-800">With Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., Supabase for authentication).</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700"><strong className="text-gray-800">For Legal Reasons:</strong> If required by law or in response to valid requests by public authorities.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700"><strong className="text-gray-800">Business Transfers:</strong> In connection with a merger, sale of company assets, or acquisition.</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700"><strong className="text-gray-800">Blockchain Transparency:</strong> Transactions on the blockchain are public and immutable.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">4</span>
                      Data Security
                    </h3>
                    <p className="text-gray-700 mb-6">We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
                    <div className="bg-gradient-to-r from-orange-100/50 to-red-100/50 rounded-xl p-6 border border-orange-300/30">
                      <p className="text-gray-800 font-semibold">
                        <span className="text-orange-600">⚠️ Important:</span> We cannot guarantee absolute security of your information, but we continuously work to maintain the highest security standards.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">5</span>
                      Your Rights (GDPR)
                    </h3>
                    <p className="text-gray-700 mb-4">If you are a resident of the European Economic Area (EEA), you have certain data protection rights, including:</p>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">The right to access, update, or delete the information we have on you</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">The right of rectification</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">The right to object</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">The right of restriction</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">The right to data portability</span>
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">The right to withdraw consent</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Section 6 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">6</span>
                      Third-Party Links
                    </h3>
                    <p className="text-gray-700">Our Service may contain links to third-party websites that are not operated by us. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.</p>
                  </div>
                </div>

                {/* Section 7 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">7</span>
                      Children's Privacy
                    </h3>
                    <div className="bg-gradient-to-r from-orange-100/50 to-red-100/50 rounded-xl p-6 border border-orange-300/30">
                      <p className="text-gray-800 font-semibold">
                        Our Service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 8 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">8</span>
                      Changes to This Privacy Policy
                    </h3>
                    <p className="text-gray-700">We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>
                  </div>
                </div>

                {/* Section 9 */}
                <div className="group">
                  <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 rounded-2xl p-8 border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/10">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white text-sm font-bold rounded-full mr-3">9</span>
                      Contact Us
                    </h3>
                    <p className="text-gray-700">If you have any questions about this Privacy Policy, please contact us at 
                      <a href="mailto:privacy@codexero.xyz" className="text-orange-600 hover:text-orange-700 font-semibold ml-1 transition-colors duration-200">
                        privacy@codexero.xyz
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gradient-to-r from-gray-50 to-orange-50/30 px-8 py-8 border-t border-orange-200/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-lg rounded-full flex items-center justify-center">
                    CX
                  </div>
                  <span className="text-xl font-bold text-gray-800">CodeXero</span>
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

export default PrivacyPolicy;
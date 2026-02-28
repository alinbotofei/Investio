'use client';

import { useRouter } from 'next/navigation';

export default function TermsAndConditions() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-6 py-12 sm:px-8 sm:py-16">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-700/70 text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-slate-600/60 mb-8 backdrop-blur-sm group"
          >
            <svg className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <h1 className="text-4xl font-bold text-white mb-2">Terms and Conditions</h1>
          <p className="text-slate-400">Effective Date: February 28, 2026</p>
        </div>

        <div className="space-y-8 text-slate-300">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed mb-3">
              Welcome to Investio. By accessing or using our platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
            </p>
            <p className="leading-relaxed">
              These terms constitute a legally binding agreement between you and Investio. We reserve the right to update these terms at any time, and your continued use of the platform constitutes acceptance of any modifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Services</h2>
            <p className="leading-relaxed mb-3">
              Investio is an AI-powered investment analysis platform that provides market data, financial insights, and portfolio tracking tools. Our services include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Real-time stock and cryptocurrency market data</li>
              <li>AI-assisted financial analysis and insights</li>
              <li>Portfolio tracking and watchlist management</li>
              <li>Market news aggregation and sentiment analysis</li>
              <li>Interactive charts and technical indicators</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Investment Disclaimer</h2>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-5 mb-4">
              <p className="font-semibold text-amber-300 mb-2">Important: Not Financial Advice</p>
              <p className="leading-relaxed">
                The information provided on Investio is for educational and informational purposes only. It does not constitute financial, investment, trading, or other professional advice. You should not rely solely on this information when making investment decisions.
              </p>
            </div>
            <p className="leading-relaxed mb-3">
              All investment strategies carry risk of loss. Past performance does not guarantee future results. The value of investments may fluctuate, and you may lose some or all of your invested capital.
            </p>
            <p className="leading-relaxed">
              Before making any investment decisions, you should conduct your own research, consult with qualified financial advisors, and consider your own financial situation, investment objectives, and risk tolerance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. User Accounts and Responsibilities</h2>
            <p className="leading-relaxed mb-3">
              When creating an account on Investio, you agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Not share your account with others</li>
            </ul>
            <p className="leading-relaxed">
              You must be at least 18 years old to create an account and use our services. By registering, you represent that you meet this age requirement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Data Accuracy and Availability</h2>
            <p className="leading-relaxed mb-3">
              While we strive to provide accurate and up-to-date market data, we cannot guarantee the completeness, accuracy, or timeliness of the information displayed on our platform. Market data is sourced from third-party providers and may be subject to delays or errors.
            </p>
            <p className="leading-relaxed">
              Investio is not responsible for any losses or damages arising from inaccurate data, system downtime, or service interruptions. We do not guarantee uninterrupted access to our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
            <p className="leading-relaxed mb-3">
              All content, features, and functionality on Investio, including but not limited to text, graphics, logos, software, and AI models, are the exclusive property of Investio and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or exploit any content from our platform without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Prohibited Uses</h2>
            <p className="leading-relaxed mb-3">
              You agree not to use Investio for any unlawful purpose or in any way that could damage, disable, or impair our services. Prohibited activities include:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Attempting to gain unauthorized access to our systems</li>
              <li>Transmitting malicious code, viruses, or harmful software</li>
              <li>Scraping, harvesting, or extracting data without permission</li>
              <li>Impersonating others or providing false information</li>
              <li>Engaging in market manipulation or fraudulent activities</li>
              <li>Using automated systems to access the platform excessively</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Privacy and Data Protection</h2>
            <p className="leading-relaxed mb-3">
              Your privacy is important to us. We collect and process personal data in accordance with our Privacy Policy. By using Investio, you consent to the collection, use, and sharing of your information as described in our Privacy Policy.
            </p>
            <p className="leading-relaxed">
              We implement reasonable security measures to protect your data, but cannot guarantee absolute security. You acknowledge that internet transmissions are never completely secure or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
            <p className="leading-relaxed mb-3">
              To the maximum extent permitted by law, Investio and its officers, directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
              <li>Loss of profits or investment losses</li>
              <li>Loss of data or business opportunities</li>
              <li>Service interruptions or system failures</li>
              <li>Errors in data or analysis</li>
            </ul>
            <p className="leading-relaxed">
              Our total liability to you for any claims arising from your use of Investio shall not exceed the amount you have paid us, if any, in the twelve months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">10. Third-Party Services and Links</h2>
            <p className="leading-relaxed mb-3">
              Investio may contain links to third-party websites or integrate with third-party services. We are not responsible for the content, accuracy, or practices of these external sites and services. Your use of third-party resources is at your own risk.
            </p>
            <p className="leading-relaxed">
              Market data is provided by third-party providers including Finnhub and CoinGecko. Their terms of service and data policies apply to the use of their data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
            <p className="leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account at any time, with or without notice, for any reason, including violation of these terms. Upon termination:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Your right to access Investio will immediately cease</li>
              <li>We may delete your account data in accordance with our data retention policies</li>
              <li>You remain liable for any obligations incurred prior to termination</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">12. Dispute Resolution and Governing Law</h2>
            <p className="leading-relaxed mb-3">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the jurisdiction in which Investio is registered, without regard to its conflict of law provisions.
            </p>
            <p className="leading-relaxed mb-3">
              Any disputes arising from these terms or your use of Investio shall be resolved through binding arbitration, except where prohibited by law. You waive any right to participate in class-action lawsuits or class-wide arbitration.
            </p>
            <p className="leading-relaxed">
              If arbitration is not enforceable, disputes shall be resolved in the courts of our registered jurisdiction, and you consent to the exclusive jurisdiction of such courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">13. Indemnification</h2>
            <p className="leading-relaxed">
              You agree to indemnify, defend, and hold harmless Investio and its affiliates from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from your use of the platform, violation of these terms, or infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">14. Changes to Terms</h2>
            <p className="leading-relaxed mb-3">
              We may modify these Terms and Conditions at any time by posting the updated terms on our platform. Material changes will be notified through email or prominent notice on the platform.
            </p>
            <p className="leading-relaxed">
              Your continued use of Investio after such modifications constitutes your acceptance of the updated terms. If you do not agree to the changes, you must discontinue using our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">15. Severability</h2>
            <p className="leading-relaxed">
              If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">16. Contact Information</h2>
            <p className="leading-relaxed mb-3">
              If you have questions about these Terms and Conditions, please contact us through our support channels available on the platform.
            </p>
            <p className="leading-relaxed text-sm text-slate-400">
              Last Updated: February 28, 2026<br />
              Version: 1.0
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-slate-700/50">
            <p className="text-sm text-slate-500 leading-relaxed">
              By using Investio, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. These terms constitute the entire agreement between you and Investio regarding your use of our platform.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { KoveLogo } from "@/components/KoveLogo";

export const metadata: Metadata = { title: "Privacy Policy — Kove" };

const EFFECTIVE = "June 25, 2025";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <nav className="border-b border-white/[0.06] h-14 flex items-center px-6">
        <div className="mx-auto w-full max-w-3xl flex items-center justify-between">
          <Link href="/">
            <KoveLogo className="h-6 w-auto" />
          </Link>
          <Link href="/terms" className="text-sm text-zinc-500 hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-semibold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-500 mb-12">Effective date: {EFFECTIVE}</p>

        <div className="space-y-10 text-sm leading-7">

          <section>
            <h2 className="text-base font-semibold text-white mb-3">1. Overview</h2>
            <p>
              Kove Labs ("we", "us", "our") operates Kove at{" "}
              <a href="https://www.trykove.dev" className="text-white underline underline-offset-2">
                www.trykove.dev
              </a>
              . This Privacy Policy explains what data we collect, how we use it, and your rights
              regarding that data. By using Kove, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">2. Data We Collect</h2>

            <p className="font-medium text-zinc-200 mb-2">Account data</p>
            <p className="mb-4">
              When you sign up, we collect your name, email address, and (if you use email/password
              sign-in) a hashed password. If you sign in with Google, we receive your name, email,
              and Google account ID from Google's OAuth service.
            </p>

            <p className="font-medium text-zinc-200 mb-2">Workspace &amp; research data</p>
            <p className="mb-4">
              We store the workspaces, app URLs, research inputs, and AI-generated reports you create
              while using the Service. This data is tied to your account and used to provide the Service.
            </p>

            <p className="font-medium text-zinc-200 mb-2">Usage data</p>
            <p>
              We collect standard server logs including IP addresses, browser type, pages visited, and
              timestamps. This data is used for security, debugging, and product improvement.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>To provide, maintain, and improve the Service</li>
              <li>To authenticate your identity and manage your account</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send transactional emails (account verification, password resets, receipts)</li>
              <li>To respond to support requests</li>
              <li>To detect abuse, fraud, and security incidents</li>
            </ul>
            <p className="mt-4">
              We do not sell your data. We do not use your workspace content or research inputs
              to train AI models.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-3">
              We share data with the following third parties only as necessary to operate the Service:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li><span className="text-zinc-300">Vercel</span> — hosting and infrastructure</li>
              <li><span className="text-zinc-300">Neon</span> — database (PostgreSQL)</li>
              <li><span className="text-zinc-300">Anthropic</span> — AI processing of research inputs</li>
              <li><span className="text-zinc-300">Stripe</span> — payment processing</li>
              <li><span className="text-zinc-300">Google</span> — OAuth sign-in (if you use it)</li>
            </ul>
            <p className="mt-4">
              Each provider processes only the data necessary for their function and is bound by their
              own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">5. Data Retention</h2>
            <p>
              We retain your account data and workspace content for as long as your account is active.
              If you delete your account, we will delete your data within 30 days, except where
              retention is required by law (e.g., billing records).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">6. Cookies</h2>
            <p>
              We use session cookies strictly necessary for authentication (to keep you signed in).
              We do not use advertising cookies or third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">7. Security</h2>
            <p>
              We implement industry-standard security measures including encrypted data transmission
              (TLS), hashed passwords, and access controls. No method of transmission over the
              internet is 100% secure; we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">8. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data from your account Settings page</li>
              <li>Delete your account and associated data (Settings → Danger Zone)</li>
              <li>Export your workspace data (contact us)</li>
              <li>Object to certain processing (contact us)</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at{" "}
              <a href="mailto:hello@trykove.dev" className="text-white underline underline-offset-2">
                hello@trykove.dev
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">9. Children's Privacy</h2>
            <p>
              Kove is not directed at children under 13. We do not knowingly collect personal
              information from children. If you believe a child has provided us data, contact us
              and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material
              changes via email or in-app notice at least 7 days before they take effect.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-white mb-3">11. Contact</h2>
            <p>
              Questions or concerns about this policy?{" "}
              <a href="mailto:hello@trykove.dev" className="text-white underline underline-offset-2">
                hello@trykove.dev
              </a>
            </p>
          </section>

        </div>
      </main>

      <footer className="border-t border-white/[0.06] mt-16 py-8 text-center text-xs text-zinc-600">
        <div className="flex items-center justify-center gap-4">
          <span>© {new Date().getFullYear()} Kove Labs</span>
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}

"use client"

// src/app/legal/privacy/page.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Rewritten 23 August 2026. What changed and why:
//
//   - The subprocessor list is now the real one. The previous version named
//     PayPal, Google Cloud, SendGrid, Mailgun, Intercom, Zendesk and Hotjar —
//     none of which are integrated — while omitting Vercel, MongoDB Atlas,
//     Upstash, Twilio, Microsoft Clarity, Sentry, IPinfo and VirusTotal, all of
//     which receive data. Naming a processor you do not use is not a harmless
//     placeholder; it is a false statement about who holds people's payroll
//     data.
//   - "Primary data centers in Ireland" and "local data centers in Cape Town"
//     are gone. We own no data centres.
//   - Data residency options on Business/Practitioner plans are gone. That was
//     a paid promise with no implementation.
//   - Security section reduced to what the system does. No end-to-end
//     encryption claim (we hold the key), no 90-day key rotation, no security
//     questions, no SOC 2.
//   - Response-time commitments reduced to what a team this size can meet.
//   - Retention now describes the actual erasure behaviour implemented in
//     lib/privacy/erasure.ts, including that financial records are anonymised
//     rather than deleted.
//   - CROOM removed.
//   - Legal framework extended to the seven jurisdictions we actually serve.
//
// Version lives in lib/legal/versions.ts. Bump LEGAL_VERSIONS.privacy on a
// material change.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield, Eye, Database, Globe, Users, Lock,
  UserCheck, Settings, Mail, Calendar, AlertTriangle,
  CheckCircle, Cookie
} from 'lucide-react';
import { PrivacyActions } from '@/components/legal/PrivacyActionLinks';
import { LEGAL_VERSIONS } from '@/lib/legal/versions';
import { ALLOBTEQ, POLOMPA, CONTACT, formatAddress, nameWithNumber } from '@/lib/legal/entities';

const SORMALITICSPrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState('introduction');

  const lastUpdated   = "23 August 2026";
  const effectiveDate = "23 August 2026";

  const sections = [
    {
      id: 'introduction',
      title: '1. Who We Are',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              SORMALITICS is a business finance platform operated by AlloBTeQ. This policy explains what personal information we collect, what we do with it, and who else touches it.
            </p>
          </div>

          <div className="space-y-3">
            <p><strong>1.1 Who controls your data:</strong> Which company is the controller (in South African law, the responsible party) depends on where you are:</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">If you are in</th>
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Your controller is</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-gray-100">United Kingdom or European Union</td>
                    <td className="p-3 border-b border-gray-100">{POLOMPA.registeredName} (company no. {POLOMPA.registrationNumber}), {POLOMPA.jurisdiction}</td>
                  </tr>
                  <tr>
                    <td className="p-3">South Africa, or anywhere else</td>
                    <td className="p-3">{ALLOBTEQ.registeredName} (registration no. {ALLOBTEQ.registrationNumber}), {ALLOBTEQ.jurisdiction}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p><strong>1.2 Two roles, and which one applies:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>For <strong>your own</strong> account information, we are the <strong>controller</strong>. We decide what we collect and why.</li>
              <li>For information you upload about <strong>other people</strong> — your customers, your employees, or your clients if you are a practitioner — you are the controller and we are your <strong>processor</strong> (operator). We act on your instructions. Those people should approach you, not us, and we will help you respond.</li>
            </ul>

            <p><strong>1.3 What this policy covers:</strong> Our website, the SORMALITICS application, and our APIs.</p>

            <p><strong>1.4 The law we work to:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Protection of Personal Information Act 4 of 2013 (POPIA) — South Africa</li>
              <li>UK GDPR and the Data Protection Act 2018</li>
              <li>EU GDPR</li>
              <li>Where our payroll features are used for those countries: the Data Protection Act 2019 (Kenya), the Data Protection and Privacy Act 2019 (Uganda), the Data Protection Act 2018 (Botswana) and the Data Protection Act 2021 (Zambia)</li>
            </ul>

            <p className="text-sm text-gray-500">Version {LEGAL_VERSIONS.privacy}, effective {effectiveDate}.</p>
          </div>
        </div>
      )
    },
    {
      id: 'collection',
      title: '2. What We Collect',
      icon: <Database className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>2.1 Information you give us:</strong></p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Account</h5>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Name and email address</li>
                <li>• Password (stored hashed, never in readable form)</li>
                <li>• Business name and details</li>
                <li>• Your preferences and settings</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Business</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Company registration and tax numbers</li>
                <li>• Registered address and contact details</li>
                <li>• Banking details you put on invoices</li>
                <li>• Chart of accounts and transactions</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Documents you create</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Invoice and customer details</li>
                <li>• Employee records for payroll</li>
                <li>• Contract terms and party details</li>
                <li>• Signatures and their audit trails</li>
                <li>• Files you upload</li>
              </ul>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h5 className="font-semibold text-orange-900 mb-2">Security</h5>
              <ul className="text-orange-800 text-sm space-y-1">
                <li>• Two-factor codes (short-lived)</li>
                <li>• Login and activity logs</li>
                <li>• IP address and device details at login</li>
              </ul>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-amber-900">Sensitive information</h5>
                <p className="text-amber-800 text-sm">Payroll means we handle identity numbers, tax reference numbers and bank account details for the employees you enter. Under POPIA some of this is <em>special personal information</em>, and under GDPR it needs particular care. We treat it accordingly, and you should only enter what you have a lawful basis to hold.</p>
              </div>
            </div>
          </div>

          <p><strong>2.2 What we collect automatically:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Technical:</strong> IP address, browser and device type, operating system</li>
            <li><strong>Usage:</strong> which pages and features you use, and when</li>
            <li><strong>Performance:</strong> load times and error reports</li>
            <li><strong>Approximate location</strong> derived from your IP address — country and region level, used for fraud prevention and to route you to the right tax rules. Not precise geolocation, and we do not use device GPS.</li>
          </ul>
          <p className="text-sm text-gray-600">Usage analytics and session analytics only run <strong>if you consent</strong> to analytics cookies. If you decline, they do not load. See section 9.</p>

          <p><strong>2.3 What we get from others:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Stripe — confirmation that a payment succeeded or failed, and the last four digits and card brand. We never receive your full card number.</li>
            <li>Google — your name and email address, if you choose to sign in with Google.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'usage',
      title: '3. How We Use It',
      icon: <Settings className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Running the service</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Generating your invoices, payslips, reports and agreements</li>
                <li>• Applying tax rules for the relevant jurisdiction</li>
                <li>• Handling e-signatures and keeping the audit trail</li>
                <li>• Managing your account, subscription and billing</li>
                <li>• Answering your support requests</li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h5 className="font-semibold text-green-900 mb-2">Keeping it secure and lawful</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Authentication, two-factor and session management</li>
                <li>• Detecting and preventing fraud and abuse</li>
                <li>• Scanning uploaded files for malware</li>
                <li>• Keeping audit logs</li>
                <li>• Meeting our own legal and tax obligations</li>
              </ul>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Improving it, and telling you things</h5>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Service notices, security alerts and billing messages — these are not optional while you have an account</li>
                <li>• Product analytics, <strong>only with your consent</strong></li>
                <li>• Marketing email, <strong>only if you opt in</strong>. Off by default, and every message has an unsubscribe link.</li>
              </ul>
            </div>
          </div>

          <p><strong>3.1 Our legal bases:</strong></p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">What for</th>
                  <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Basis</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr><td className="p-3 border-b border-gray-100">Providing the Services you signed up for</td><td className="p-3 border-b border-gray-100">Performance of a contract</td></tr>
                <tr><td className="p-3 border-b border-gray-100">Security, fraud prevention, audit logging</td><td className="p-3 border-b border-gray-100">Legitimate interests</td></tr>
                <tr><td className="p-3 border-b border-gray-100">Diagnosing faults — error reports and masked error recordings</td><td className="p-3 border-b border-gray-100">Legitimate interests</td></tr>
                <tr><td className="p-3 border-b border-gray-100">Keeping financial records</td><td className="p-3 border-b border-gray-100">Legal obligation</td></tr>
                <tr><td className="p-3 border-b border-gray-100">Analytics and session analytics</td><td className="p-3 border-b border-gray-100">Consent</td></tr>
                <tr><td className="p-3">Marketing email</td><td className="p-3">Consent</td></tr>
              </tbody>
            </table>
          </div>

          <p><strong>3.2 What we do not do:</strong> We do not sell your personal information. We do not rent or trade it. We do not use your content, documents or business data to train machine-learning models. We do not profile you or make automated decisions with a legal or similarly significant effect.</p>
        </div>
      )
    },
    {
      id: 'sharing',
      title: '4. Who Else Touches Your Data',
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-red-900">We never sell your data</h5>
                <p className="text-red-800 text-sm">The list below is the complete set of third parties that process personal information on our behalf. Each is bound by a written agreement to process only on our instructions.</p>
              </div>
            </div>
          </div>

          <p><strong>4.1 Our processors:</strong></p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Provider</th>
                  <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">What they do</th>
                  <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">What they receive</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr><td className="p-3 border-b border-gray-100 font-medium">Vercel</td><td className="p-3 border-b border-gray-100">Application hosting</td><td className="p-3 border-b border-gray-100">All request traffic, IP addresses, logs</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">MongoDB Atlas</td><td className="p-3 border-b border-gray-100">Database</td><td className="p-3 border-b border-gray-100">All stored account and document data</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">Upstash</td><td className="p-3 border-b border-gray-100">Caching and rate limiting</td><td className="p-3 border-b border-gray-100">Session and rate-limit keys</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">Stripe</td><td className="p-3 border-b border-gray-100">Payments</td><td className="p-3 border-b border-gray-100">Billing name, email, payment details</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">Google</td><td className="p-3 border-b border-gray-100">Optional sign-in</td><td className="p-3 border-b border-gray-100">Your identity, only if you use it</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">Twilio</td><td className="p-3 border-b border-gray-100">SMS notifications and alerts</td><td className="p-3 border-b border-gray-100">Phone number, message content</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">Email delivery (SMTP)</td><td className="p-3 border-b border-gray-100">Transactional email</td><td className="p-3 border-b border-gray-100">Email address, message content</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">Sentry</td><td className="p-3 border-b border-gray-100">Error reporting and fault diagnosis</td><td className="p-3 border-b border-gray-100">Error traces with request context. <strong>On error only:</strong> a masked recording of the preceding minute — page layout and which elements were clicked, with all text, input values and images obscured in your browser before anything is sent</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">IPinfo</td><td className="p-3 border-b border-gray-100">IP geolocation for fraud checks</td><td className="p-3 border-b border-gray-100">IP address</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">VirusTotal</td><td className="p-3 border-b border-gray-100">Malware scanning of uploads</td><td className="p-3 border-b border-gray-100">File content or hashes of files you upload</td></tr>
                <tr><td className="p-3 border-b border-gray-100 font-medium">Google Analytics</td><td className="p-3 border-b border-gray-100">Website analytics</td><td className="p-3 border-b border-gray-100"><strong>Only with consent.</strong> Usage events, IP anonymised</td></tr>
                <tr><td className="p-3 font-medium">Microsoft Clarity</td><td className="p-3">Session analytics on public pages</td><td className="p-3"><strong>Only with consent, and never on signed-in pages.</strong> Page interaction</td></tr>
              </tbody>
            </table>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h5 className="font-semibold text-amber-900 mb-2">Three we want to be explicit about</h5>
            <ul className="text-amber-800 text-sm space-y-2">
              <li><strong>VirusTotal.</strong> When file scanning uses VirusTotal, the file or its hash is submitted to a third-party service that may share submissions with its security-vendor network. If a document is confidential enough that this concerns you, tell us before uploading and we will scan it locally instead.</li>
              <li><strong>Microsoft Clarity.</strong> Clarity records how visitors move through a page, and it records what is on it. We run it only on public marketing pages — never on the dashboard, payroll, checkout or the authentication screens — and only if you accept analytics cookies.</li>
              <li><strong>Sentry error recordings.</strong> This one does reach signed-in pages, so it is worth being precise about what it is and is not. It is not analytics and it is not always on. Nothing is recorded during a normal session: the browser keeps roughly the last minute in memory and throws it away. If the application throws an error, or if you click the same control repeatedly in a way that suggests it is not responding, that minute is sent to Sentry so we can see what went wrong. Every piece of text, every field value and every image is replaced with blocks <em>in your browser, before it is sent</em> — the readable version is never transmitted and never stored. What we get is the shape of the page and which button you pressed. We do not receive the contents of any request or response, so no salary, identity number or bank detail is in the recording. Recordings are deleted by Sentry after 90 days.</li>
            </ul>
          </div>

          <p><strong>4.2 When we disclose without a processor relationship:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>When a court order, subpoena or binding legal process requires it</li>
            <li>To a revenue authority, where the law compels disclosure</li>
            <li>To law enforcement, where we are legally required or where there is an immediate risk to someone&apos;s safety</li>
            <li>To our professional advisers, under a duty of confidence</li>
          </ul>
          <p className="text-sm text-gray-600">Where we are lawfully able to tell you first, we will.</p>

          <p><strong>4.3 Business transfers:</strong> If the business is sold or merges, your information may transfer as part of it. You will be told, and the receiving party will be bound to protections at least equivalent to these.</p>

          <p><strong>4.4 Changes to this list:</strong> If we add a processor that materially changes who handles your data, we will update this section and notify you as set out in section 11.</p>
        </div>
      )
    },
    {
      id: 'international',
      title: '5. Where Your Data Goes',
      icon: <Globe className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>5.1 Being straightforward about this:</strong> We do not own or operate data centres. SORMALITICS runs on infrastructure provided by the companies in section 4, and your data is stored and processed wherever those providers operate — which includes locations outside South Africa, the United Kingdom and the European Union, principally the United States and the European Union.</p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2">We do not currently offer data residency</h5>
            <p className="text-gray-700 text-sm">There is no option to pin your data to a particular country or region, on any plan. If your organisation requires data residency, SORMALITICS is not currently able to meet that requirement, and we would rather tell you now than at procurement.</p>
          </div>

          <p><strong>5.2 How transfers are protected:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Standard Contractual Clauses</strong> — the European Commission&apos;s and the UK&apos;s approved contract terms, in our agreements with providers where required</li>
            <li><strong>Adequacy decisions</strong> — relied on where the destination country has one</li>
            <li><strong>POPIA section 72</strong> — transfers out of South Africa are made on the basis of binding agreements giving effect to equivalent protection</li>
            <li><strong>Encryption in transit</strong> — every transfer is over TLS</li>
          </ul>

          <p><strong>5.3 Our providers&apos; own compliance:</strong> Vercel, MongoDB Atlas, Stripe, Upstash, Google and Microsoft each maintain their own certifications and transfer mechanisms. We rely on those; we hold no equivalent certification ourselves.</p>

          <p><strong>5.4 Ask us:</strong> If you need to know exactly where a specific category of your data sits, email <a href="mailto:privacy@sormalitics.com" className="text-blue-600 hover:underline">privacy@sormalitics.com</a> and we will tell you.</p>
        </div>
      )
    },
    {
      id: 'security',
      title: '6. How We Protect It',
      icon: <Lock className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>6.1 What we actually do:</strong></p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-semibold text-red-900 mb-2">Encryption</h5>
              <ul className="text-red-800 text-sm space-y-1">
                <li>• TLS on every connection</li>
                <li>• Encryption at rest via our database provider</li>
                <li>• Additional application-level encryption for agreement content</li>
                <li>• Passwords hashed with bcrypt, never reversible</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Access</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Two-factor authentication, on by default</li>
                <li>• Role-based permissions</li>
                <li>• Per-account data isolation on every query</li>
                <li>• Account lockout after repeated failed logins</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Platform</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Rate limiting and bot filtering</li>
                <li>• Application firewall rules</li>
                <li>• Malware scanning of uploads</li>
                <li>• Automated DNS and TLS certificate monitoring</li>
                <li>• Security headers and strict content policy</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Records</h5>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Audit logging of significant actions</li>
                <li>• Signature audit trails</li>
                <li>• Application and error logging</li>
                <li>• Documented incident response plan</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2">What we do not claim</h5>
            <ul className="text-gray-700 text-sm space-y-1 list-disc pl-5">
              <li>We hold <strong>no ISO 27001, SOC 2 or PCI DSS certification</strong> of our own. Our infrastructure providers hold their own; we do not.</li>
              <li>Encryption is <strong>not end-to-end</strong>. We hold the keys, because the service has to read your data to generate documents from it.</li>
              <li>No system is perfectly secure, and we do not promise ours is.</li>
            </ul>
          </div>

          <p><strong>6.2 Card details:</strong> We never receive or store full card numbers. Payment details go directly to Stripe.</p>

          <p><strong>6.3 If something goes wrong:</strong> We keep a documented breach response plan. If a breach affects your personal information, we will:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Notify the Information Regulator (South Africa) on its prescribed form, and the ICO or the relevant EU authority within <strong>72 hours</strong> of becoming aware, where the law requires</li>
            <li>Notify you as soon as reasonably possible, in plain language, telling you what happened and what to do</li>
            <li>Where you are the controller and we are your processor, notify <em>you</em> without undue delay so that you can notify the people affected</li>
          </ul>

          <p><strong>6.4 Your part:</strong> Use a strong, unique password, keep two-factor authentication on, remove team members who leave, and tell us promptly if you suspect unauthorised access.</p>
        </div>
      )
    },
    {
      id: 'rights',
      title: '7. Your Rights',
      icon: <UserCheck className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>7.1 What you can ask for:</strong></p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">See and take</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>Access</strong> — a copy of what we hold</li>
                <li>• <strong>Portability</strong> — it in a machine-readable format</li>
                <li>• <strong>Information</strong> — how and why we process it</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Change</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• <strong>Correction</strong> — fix what is wrong</li>
                <li>• <strong>Restriction</strong> — pause processing in some cases</li>
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="font-semibold text-red-900 mb-2">Stop and remove</h5>
              <ul className="text-red-800 text-sm space-y-1">
                <li>• <strong>Erasure</strong> — delete it, subject to section 8</li>
                <li>• <strong>Objection</strong> — object to legitimate-interest processing</li>
                <li>• <strong>Withdraw consent</strong> — at any time, without affecting what came before</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Challenge</h5>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• <strong>Complain</strong> to a supervisory authority</li>
                <li>• <strong>Remedy</strong> through the courts</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-2">You do not have to ask us for the main two</h5>
            <p className="text-green-800 text-sm">
              <strong>Export</strong> and <strong>account deletion</strong> both work from your account, immediately and free of charge — the buttons at the bottom of this page, or your account settings. The export is a complete archive with a plain-English index of what is in it.
            </p>
          </div>

          <p><strong>7.2 Other ways to reach us:</strong> Email <a href="mailto:privacy@sormalitics.com" className="text-blue-600 hover:underline">privacy@sormalitics.com</a> from your registered address, or write to us at the address in section 12. We may ask you to verify your identity before acting on a request — necessary, because acting on an impostor&apos;s request would itself be a breach.</p>

          <p><strong>7.3 How long we take:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>We acknowledge within <strong>5 business days</strong></li>
            <li>We respond substantively within <strong>30 days</strong>, as GDPR and POPIA require</li>
            <li>For a complex request we may extend by up to a further 60 days, and will tell you why within the first 30</li>
            <li>There is no charge, unless a request is manifestly unfounded or repetitive</li>
          </ul>

          <p><strong>7.4 When a right may not apply:</strong> Some rights are limited where we must keep information to comply with a legal obligation (particularly tax and payroll records — see section 8), to establish or defend a legal claim, or where acting would disclose someone else&apos;s personal information. If we refuse, we will tell you why and how to challenge it.</p>

          <p><strong>7.5 If you are not our customer:</strong> If your details are in SORMALITICS because one of our customers put them there — as their employee, customer or client — that customer is the controller. Please contact them. If you cannot identify them, write to us and we will pass your request on.</p>
        </div>
      )
    },
    {
      id: 'retention',
      title: '8. How Long We Keep It',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>8.1 While your account is open:</strong> We keep your data for as long as you have an account, so the service works. Audit logs are kept for up to 2 years.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h5 className="font-semibold text-blue-900 mb-2">8.2 When you delete your account</h5>
            <p className="text-blue-800 text-sm mb-2">There is a <strong>30-day grace period</strong>, during which nothing irreversible happens and you can cancel. Your login credentials and any pending security tokens are destroyed immediately. After 30 days:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white border border-blue-200 rounded-lg overflow-hidden">
                <thead className="bg-blue-100">
                  <tr>
                    <th className="text-left p-3 font-semibold text-blue-900">What</th>
                    <th className="text-left p-3 font-semibold text-blue-900">What happens</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr><td className="p-3 border-b border-blue-100">Clients, issuers, templates, agreements, uploaded files, signature records, your profile</td><td className="p-3 border-b border-blue-100"><strong>Deleted</strong></td></tr>
                  <tr><td className="p-3 border-b border-blue-100">Invoices, payslips, payroll runs, employee records, transactions, accounting records, orders</td><td className="p-3 border-b border-blue-100"><strong>Anonymised, not deleted</strong> — identifying details removed, the underlying record kept</td></tr>
                  <tr><td className="p-3">Audit and activity logs</td><td className="p-3"><strong>Anonymised</strong>, then deleted on the normal 2-year cycle</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <p><strong>8.3 Why financial records are not simply deleted:</strong> The law requires the record to outlive your request:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>South Africa</strong> — 5 years under the Tax Administration Act 28 of 2011; 7 years for accounting records under the Companies Act 71 of 2008</li>
            <li><strong>United Kingdom</strong> — 6 years for business records (HMRC)</li>
            <li><strong>Payroll</strong> — statutory retention periods in each jurisdiction</li>
          </ul>
          <p className="text-sm text-gray-600">GDPR Article 17(3)(b) and POPIA section 24(1) both provide for this: the right to erasure yields to a legal retention obligation. What we remove is everything that identifies you. What remains is the transaction, which is what the law requires us to keep.</p>

          <p><strong>8.4 Shared organisations:</strong> If you belong to an organisation with other members, records belonging to the organisation rather than to you personally are not deleted when you leave — deleting them would destroy your colleagues&apos; records. Your personal information is removed from them.</p>

          <p><strong>8.5 Inactive accounts:</strong> If an account has been inactive for a long period we may contact you about closing it. We will give you at least <strong>90 days&apos; notice</strong> and a chance to export before anything is deleted.</p>

          <p><strong>8.6 Backups:</strong> Deleted data may persist in encrypted backups for a short period before those backups are cycled out. It is not restored to live systems.</p>
        </div>
      )
    },
    {
      id: 'cookies',
      title: '9. Cookies & Analytics',
      icon: <Cookie className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-green-900">Nothing non-essential loads until you say yes</h5>
                <p className="text-green-800 text-sm">Analytics and marketing scripts are not loaded at all unless you have accepted them. Declining is not a preference we record and ignore — the scripts genuinely do not run.</p>
              </div>
            </div>
          </div>

          <p><strong>9.1 The categories:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Essential</strong> — sign-in, session, security and CSRF protection. Always on; the service cannot work without them, and no consent is required for them.</li>
            <li><strong>Preferences</strong> — theme, currency and language. Only with consent.</li>
            <li><strong>Analytics</strong> — Google Analytics, and Microsoft Clarity on public pages only. Only with consent.</li>
            <li><strong>Marketing</strong> — campaign measurement. Only with consent.</li>
          </ul>

          <p><strong>9.2 Changing your mind:</strong> Use the controls on our <Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link> page at any time. Withdrawing consent stops further collection.</p>

          <p><strong>9.3 Session analytics and your dashboard:</strong> Microsoft Clarity never runs on signed-in pages — not the dashboard, not payroll, not checkout, not the authentication screens. It is limited to public marketing pages, and then only with consent.</p>

          <p><strong>9.4 Error recordings are a separate thing, and they do reach the dashboard:</strong> We would rather say this plainly than let 9.3 imply more than it means. Our error-tracking tool keeps a rolling one-minute buffer in your browser and sends it to Sentry <em>only</em> when something breaks — an error, or repeated clicks on a control that is not responding. It is masked at source: text, field values and images are replaced with blocks before transmission, and request and response bodies are never captured at all. We rely on legitimate interests for this rather than consent, because an error we cannot see is an error we cannot fix, and the sessions that break are exactly the ones a consent gate would hide from us. It uses a short-lived identifier stored in your browser so that the pieces of one recording can be reassembled. If you would prefer to be excluded from this entirely, email <a href="mailto:privacy@sormalitics.com" className="text-blue-600 hover:underline">privacy@sormalitics.com</a> and we will honour it — you have the right to object to processing based on legitimate interests, and we will not ask you to justify it.</p>

          <p className="text-sm text-gray-600">Full detail is in the <Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>.</p>
        </div>
      )
    },
    {
      id: 'children',
      title: '10. Children',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-red-900">SORMALITICS is for adults</h5>
                <p className="text-red-800 text-sm">The Services are not intended for anyone under 18, and we do not knowingly collect personal information from children.</p>
              </div>
            </div>
          </div>

          <p><strong>10.1</strong> By creating an account you confirm you are at least 18 and legally able to enter into a contract.</p>

          <p><strong>10.2</strong> If we learn we hold information about a child collected without proper authorisation, we will delete it and close the associated account.</p>

          <p><strong>10.3 Payroll for young workers:</strong> Where you lawfully employ someone under 18 and enter their details for payroll, you are the controller for that information and are responsible for the lawful basis, including any parental consent your jurisdiction requires.</p>

          <p><strong>10.4</strong> If you believe we hold a child&apos;s information, contact <a href="mailto:privacy@sormalitics.com" className="text-blue-600 hover:underline">privacy@sormalitics.com</a>.</p>
        </div>
      )
    },
    {
      id: 'changes',
      title: '11. Changes to This Policy',
      icon: <Settings className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>11.1</strong> We update this policy when our practices, our processors or the law change. Each version carries a version number.</p>

          <p><strong>11.2 How you will hear:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Material changes</strong> — new processor, new purpose, or anything affecting your rights: email to your registered address and an in-product notice, at least <strong>30 days</strong> before it takes effect</li>
            <li><strong>Minor changes</strong> — clarifications, contact updates and corrections: published, effective immediately</li>
          </ul>

          <p><strong>11.3 If you do not agree</strong> to a material change, you can export your data and close your account before it takes effect. Where the change relies on consent, we will ask you again rather than assume.</p>

          <p><strong>11.4 Previous versions</strong> are available on request from <a href="mailto:privacy@sormalitics.com" className="text-blue-600 hover:underline">privacy@sormalitics.com</a>.</p>

          <p className="text-sm text-gray-500">This version: {LEGAL_VERSIONS.privacy}, effective {effectiveDate}.</p>
        </div>
      )
    },
    {
      id: 'contact',
      title: '12. Contact & Complaints',
      icon: <Mail className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>12.1 Reaching us:</strong></p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Email</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Privacy: <a href="mailto:privacy@sormalitics.com" className="hover:underline">privacy@sormalitics.com</a></li>
                <li>• Legal: <a href="mailto:legal@sormalitics.com" className="hover:underline">legal@sormalitics.com</a></li>
                <li>• Support: <a href="mailto:support@sormalitics.com" className="hover:underline">support@sormalitics.com</a></li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Phone &amp; post</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• {CONTACT.phone}</li>
                <li>• {CONTACT.hours}</li>
                <li>• {nameWithNumber(ALLOBTEQ)}</li>
                <li>• {formatAddress(ALLOBTEQ)}</li>
              </ul>
            </div>
          </div>

          <p><strong>12.2 Our Information Officer</strong> under POPIA is{' '}
            {ALLOBTEQ.informationOfficerRegistration?.officerName ?? `the head of ${ALLOBTEQ.registeredName}`}, reachable at{' '}
            {ALLOBTEQ.informationOfficerRegistration?.officerEmail ? (
              <a href={`mailto:${ALLOBTEQ.informationOfficerRegistration.officerEmail}`} className="text-blue-600 hover:underline">
                {ALLOBTEQ.informationOfficerRegistration.officerEmail}
              </a>
            ) : (
              <a href={`mailto:${CONTACT.privacy}`} className="text-blue-600 hover:underline">{CONTACT.privacy}</a>
            )}.
            {' '}Requests under the Promotion of Access to Information Act go to the same address, or see our{' '}
            <Link href="/legal/paia" className="text-blue-600 hover:underline">PAIA manual</Link>.</p>

          {/* Rendered from lib/legal/entities.ts, so the number on this page can
              never drift from the certificate. */}
          {ALLOBTEQ.informationOfficerRegistration && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h5 className="font-semibold text-green-900">Registered with the Information Regulator</h5>
                  <p className="text-green-800 text-sm">
                    Our Information Officer is registered with the {ALLOBTEQ.informationOfficerRegistration.regulator} under
                    registration number <strong>{ALLOBTEQ.informationOfficerRegistration.number}</strong>, with effect from{' '}
                    {new Date(ALLOBTEQ.informationOfficerRegistration.registeredOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                  </p>
                </div>
              </div>
            </div>
          )}

          <p><strong>12.3 Complaining to a regulator:</strong> You can complain to us first — we would prefer that — but you are entitled to go straight to a supervisory authority:</p>

          <div className="space-y-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-1">South Africa</h5>
              <p className="text-gray-700 text-sm">Information Regulator (South Africa)</p>
              <p className="text-gray-600 text-sm">inforegulator.org.za · 010 023 5200 · complaints.IR@inforegulator.org.za</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-1">United Kingdom</h5>
              <p className="text-gray-700 text-sm">Information Commissioner&apos;s Office</p>
              <p className="text-gray-600 text-sm">ico.org.uk · 0303 123 1113</p>
              {/* Renders only once the ICO has ISSUED the number. An application
                  reference is not a registration number, and publishing one as
                  though it were would be exactly the kind of overstatement the
                  rest of this rewrite removed. See lib/legal/entities.ts. */}
              {POLOMPA.dataProtectionRegistration?.status === 'registered' &&
                POLOMPA.dataProtectionRegistration.number && (
                <p className="text-gray-600 text-sm mt-1">
                  {POLOMPA.registeredName} is registered with the ICO as a data controller.
                  Registration number: <strong>{POLOMPA.dataProtectionRegistration.number}</strong>.
                </p>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-1">European Union</h5>
              <p className="text-gray-700 text-sm">Your national data protection authority</p>
              <p className="text-gray-600 text-sm">edpb.europa.eu/about-edpb/board/members_en</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-1">Kenya · Uganda · Botswana · Zambia</h5>
              <p className="text-gray-700 text-sm">Office of the Data Protection Commissioner (KE) · Personal Data Protection Office (UG) · Information and Data Protection Commission (BW) · Data Protection Commissioner (ZM)</p>
            </div>
          </div>

          <p className="text-sm text-gray-600">We aim to acknowledge every privacy enquiry within 5 business days and to resolve it within 30.</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              <span>Effective: {effectiveDate}</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              <span>Version {LEGAL_VERSIONS.privacy}</span>
            </div>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-blue-600" />
            Privacy at a glance
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What we collect</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your account and business details</li>
                <li>• The documents you create, and the people in them</li>
                <li>• Security and login records</li>
                <li>• Usage analytics — only if you consent</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What we do about it</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• We never sell it, and never train models on it</li>
                <li>• Nothing non-essential loads without consent</li>
                <li>• Export or delete from your account, any time</li>
                <li>• Section 4 names every processor, in full</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Contents</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setExpandedSection(section.id)}
                className={`flex flex-wrap gap-y-2 items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                  expandedSection === section.id
                    ? 'bg-blue-100 text-blue-800'
                    : 'hover:bg-gray-100'
                }`}
              >
                {section.icon}
                <span className="text-sm font-medium">{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all ${
                expandedSection === section.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <button
                onClick={() => setExpandedSection(expandedSection === section.id ? '' : section.id)}
                className="w-full flex flex-wrap gap-y-2 items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-wrap gap-y-2 items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    {section.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 text-left">{section.title}</h3>
                </div>
                <div className={`transform transition-transform ${
                  expandedSection === section.id ? 'rotate-180' : ''
                }`}>
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedSection === section.id && (
                <div className="px-6 pb-6 border-t border-gray-200 bg-gray-50">
                  <div className="pt-6 prose prose-gray max-w-none">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Actions
            These were buttons with no onClick and no endpoint behind them, on a
            page whose §7 promised self-service. They now call
            /api/user/data-export and /api/user/delete-account — see
            components/legal/PrivacyActions.tsx. */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Exercise your rights</h2>
          <PrivacyActions />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            SORMALITICS is operated by {ALLOBTEQ.registeredName} (reg. {ALLOBTEQ.registrationNumber}) and {POLOMPA.registeredName} (no. {POLOMPA.registrationNumber}).
          </p>
          <p className="text-sm mt-2">
            Questions about your privacy?{' '}
            <a href="mailto:privacy@sormalitics.com" className="text-blue-600 hover:underline">
              privacy@sormalitics.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SORMALITICSPrivacyPolicy;

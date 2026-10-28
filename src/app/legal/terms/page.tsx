"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText, Shield, Users, CreditCard, Globe,
  Lock, AlertTriangle, CheckCircle, Calendar,
  Building, UserCheck, Briefcase, Scale
} from 'lucide-react';
import { LEGAL_VERSIONS } from '@/lib/legal/versions';
import { ALLOBTEQ, POLOMPA, CONTACT, formatAddress, nameWithNumber } from '@/lib/legal/entities';

const SORMALITICSTermsOfService = () => {
  const [expandedSection, setExpandedSection] = useState('introduction');

  const lastUpdated  = "26 October 2026";
  const effectiveDate = "28 September 2026";

  const sections = [
    {
      id: 'introduction',
      title: '1. Introduction & Acceptance',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Welcome to SORMALITICS</h4>
            <p className="text-blue-800 text-sm">
              SORMALITICS is a business finance platform for invoicing, payroll, accounting, agreements and e-signature — built for freelancers, small businesses and the accountants and bookkeepers who serve them.
            </p>
          </div>

          <div className="space-y-3">
            <p><strong>1.1 About SORMALITICS:</strong> SORMALITICS is a product of AlloBTeQ. It is a standalone service — you do not need any other product to use it, and using it does not enrol you in anything else.</p>

            <p><strong>1.2 Who you are contracting with:</strong> Which company provides the Services to you, and which law governs that contract, depends on where you are:</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">If you are in</th>
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">You contract with</th>
                    <th className="text-left p-3 font-semibold text-gray-900 border-b border-gray-200">Governing law</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border-b border-gray-100">United Kingdom or the European Union</td>
                    <td className="p-3 border-b border-gray-100">{POLOMPA.registeredName} (company no. {POLOMPA.registrationNumber}), registered in {POLOMPA.jurisdiction}</td>
                    <td className="p-3 border-b border-gray-100">England &amp; Wales</td>
                  </tr>
                  <tr>
                    <td className="p-3">South Africa, or anywhere else</td>
                    <td className="p-3">{ALLOBTEQ.registeredName} (registration no. {ALLOBTEQ.registrationNumber}), registered in {ALLOBTEQ.jurisdiction}</td>
                    <td className="p-3">South Africa</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-sm text-gray-600">In these Terms, &quot;AlloBTeQ&quot;, &quot;we&quot;, &quot;us&quot; and &quot;our&quot; mean whichever of those two companies provides the Services to you. Both are part of the same group.</p>

            <p><strong>1.3 Acceptance:</strong> You accept these Terms by ticking the acceptance box when you create an account. We record which version you accepted and when. If you do not accept them, you cannot create an account.</p>

            <p><strong>1.4 Capacity:</strong> You must be at least 18 and legally able to enter into a contract. If you are using the Services for a business, you confirm you are authorised to bind that business.</p>

            <p><strong>1.5 Other documents that form part of this agreement:</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li><Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> — how we handle personal information</li>
              <li><Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link> — what we set and what needs your consent</li>
              <li><Link href="/legal/refunds" className="text-blue-600 hover:underline">Refund Policy</Link> — when money comes back</li>
            </ul>

            <p className="text-sm text-gray-500">Current version: Terms v{LEGAL_VERSIONS.terms}</p>
          </div>
        </div>
      )
    },
    {
      id: 'services',
      title: '2. What SORMALITICS Does',
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>2.1 The Services:</strong> Depending on your plan, SORMALITICS provides:</p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="font-semibold text-green-900 mb-2">Invoicing</h5>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Invoices, quotes and credit notes</li>
                <li>• Recurring invoices and statements</li>
                <li>• Multiple business identities (issuers)</li>
                <li>• Multi-currency (ZAR, GBP, USD, EUR)</li>
                <li>• Payment reminders</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-semibold text-blue-900 mb-2">Payroll</h5>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Payroll runs and payslips</li>
                <li>• Employee records</li>
                <li>• Statutory outputs including EMP201, IRP5, P32, P60 and Form 941</li>
                <li>• Year-to-date tracking</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h5 className="font-semibold text-amber-900 mb-2">Accounting &amp; Reporting</h5>
              <ul className="text-amber-800 text-sm space-y-1">
                <li>• Chart of accounts and transactions</li>
                <li>• Trial balance</li>
                <li>• VAT schedules</li>
                <li>• Report exports</li>
              </ul>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h5 className="font-semibold text-purple-900 mb-2">Agreements &amp; E-Signature</h5>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• Contract templates</li>
                <li>• Multi-party signing workflows</li>
                <li>• Signature audit trails</li>
                <li>• Document storage</li>
              </ul>
            </div>

            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h5 className="font-semibold text-teal-900 mb-2">Practice Management</h5>
              <ul className="text-teal-800 text-sm space-y-1">
                <li>• Client profiles for practitioners</li>
                <li>• Work on a client&apos;s behalf</li>
                <li>• Per-client billing</li>
              </ul>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
              <h5 className="font-semibold text-rose-900 mb-2">Store, Teams &amp; Fleet</h5>
              <ul className="text-rose-800 text-sm space-y-1">
                <li>• Individual document purchases</li>
                <li>• Team members and invitations</li>
                <li>• Vehicle and driver records</li>
              </ul>
            </div>
          </div>

          <p><strong>2.2 Jurisdictions:</strong> Payroll and tax features currently cover South Africa, Botswana, Zambia, Zimbabwe, Namibia, Eswatini, Lesotho, Kenya, Rwanda, Angola and Mozambique. Each company is registered for one jurisdiction when it signs up, and its payroll runs under that jurisdiction only; it cannot be changed later. Coverage differs by feature and by plan, and we may add or withdraw a jurisdiction. Availability of a jurisdiction is not a statement that a given calculation fits your circumstances — see section 7.</p>

          <p><strong>2.3 Plans:</strong> Free, Professional, Business and Practitioner. What each includes, and its limits, are on our <Link href="/pricing" className="text-blue-600 hover:underline">pricing page</Link>. Limits are enforced.</p>

          <p><strong>2.4 Changes to the Services:</strong> We develop the Services continuously and may add, change or withdraw features. Where a change materially reduces a feature you are paying for, we will give reasonable notice and you may cancel under section 10.</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-yellow-900">What SORMALITICS is not</h5>
                <p className="text-yellow-800 text-sm">We are not your accountant, tax practitioner, payroll bureau or law firm. We do not file returns with any revenue authority on your behalf, and we do not review your documents for accuracy. SORMALITICS produces documents from the information you give it.</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'accounts',
      title: '3. Accounts, Teams & Practitioners',
      icon: <Users className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>3.1 Creating an account:</strong> Give us accurate information and keep it current. You are responsible for everything that happens under your account.</p>

          <p><strong>3.2 Account types:</strong></p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Individual:</strong> sole proprietors, freelancers and individual business owners</li>
            <li><strong>Business:</strong> companies and partnerships, optionally with team members</li>
            <li><strong>Practitioner:</strong> accountants, bookkeepers and consultants managing multiple client profiles</li>
          </ul>

          <p><strong>3.3 Security:</strong> Keep your credentials confidential and tell us promptly if you think someone else has access. Two-factor authentication is enabled by default and we recommend leaving it on. We are not responsible for losses arising from someone else using your credentials, unless we are at fault.</p>

          <p><strong>3.4 Team members:</strong> If you invite people to your organisation, you are responsible for what they do, for the accuracy of the access you give them, and for removing access when someone leaves. Team members can see the organisation&apos;s data according to their role.</p>

          <p><strong>3.5 Practitioners and client data:</strong> If you use a Practitioner account, you may upload and process information about your own clients and their employees. In that case:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You are the controller (responsible party) for that information. We process it on your instructions as your processor (operator).</li>
            <li>You confirm you have a lawful basis to give it to us.</li>
            <li>A written data processing agreement is required. Ask us for one before you upload client data.</li>
            <li>Your clients&apos; requests about their own data should come to you, not to us. We will help you answer them.</li>
          </ul>

          <p><strong>3.6 Suspension:</strong> We may suspend or close an account that breaches these Terms, is being used fraudulently, has unpaid fees, or creates a security risk. Where it is reasonable to do so, we will tell you first and give you a chance to put it right.</p>
        </div>
      )
    },
    {
      id: 'usage',
      title: '4. Acceptable Use',
      icon: <Shield className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>4.1 Permitted use:</strong> Use SORMALITICS for lawful business purposes, in line with these Terms.</p>

          <p><strong>4.2 You must not:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Create false, misleading or fraudulent documents</li>
            <li>Use the Services for tax evasion, money laundering or any other unlawful purpose</li>
            <li>Upload malware, or files you do not have the right to upload</li>
            <li>Attempt to bypass security controls, plan limits or access restrictions</li>
            <li>Access another customer&apos;s data, or probe for a way to</li>
            <li>Reverse engineer the Services, or copy them to build a competing product</li>
            <li>Scrape or automate access to the Services without our written permission</li>
            <li>Resell or share your account so that people outside your organisation issue documents through it</li>
            <li>Interfere with the operation of the Services or with other customers&apos; use of them</li>
          </ul>

          <p><strong>4.3 Files you upload:</strong> We scan uploaded files for malware. We may block, quarantine or remove a file that fails a scan, and we may suspend an account that repeatedly uploads harmful files.</p>

          <p><strong>4.4 Your content:</strong> You are responsible for the accuracy, legality and appropriateness of everything you put into the Services — including information about your customers, employees and clients.</p>

          <p><strong>4.5 Fair use of &quot;unlimited&quot; allowances:</strong> Where a plan describes an allowance as unlimited — invoices, quotations, agreements, payslips or similar — it is unlimited for the ordinary business use of your own organisation. We do not apply a hidden numeric cap to those allowances, and we will not bill you for exceeding one.</p>

          <p>We may contact you, and if the position does not change we may limit or suspend an unlimited allowance, only where usage: (a) is not genuine use by your own organisation, including the resale and account-sharing described in 4.2; (b) is generated in bulk by automated means rather than arising from real business activity; or (c) reaches a level that materially degrades the Services for other customers.</p>

          <p>Before we limit anything we will tell you what we have seen and give you a reasonable opportunity to put it right, except where there is an immediate risk to the security or availability of the Services.</p>
        </div>
      )
    },
    {
      id: 'payments',
      title: '5. Payments & Billing',
      icon: <CreditCard className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>5.1 Prices:</strong> Current prices are on our <Link href="/pricing" className="text-blue-600 hover:underline">pricing page</Link>. We support ZAR, GBP, USD and EUR. The currency shown at checkout is the currency you are charged in.</p>

          <p><strong>5.2 How payment works:</strong> Payments are processed by Stripe. We never receive or store your full card number. By paying, you also accept Stripe&apos;s terms for the payment itself.</p>

          <p><strong>5.3 Subscriptions:</strong> Paid plans are billed in advance, monthly or annually, and renew automatically until cancelled. You can cancel at any time from your account. Cancelling stops the next renewal — it does not end the period you have already paid for, and you keep access until that period ends.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 space-y-2">
            <h5 className="font-semibold text-blue-900">5.4 Practitioner billing — please read this one</h5>
            <p className="text-blue-800 text-sm">Practitioner plans are priced <strong>per active client profile</strong>, not per account. Specifically:</p>
            <ul className="text-blue-800 text-sm list-disc pl-5 space-y-1">
              <li>There is a <strong>minimum of two client profiles</strong>. You are billed for at least two whether or not you use them.</li>
              <li>Your subscription quantity is kept in step with the number of client slots you hold. Adding capacity charges you at the time you add it.</li>
              <li><strong>Reducing your client count does not refund the current period.</strong> A reduction is scheduled and takes effect at your next renewal date. You keep the capacity you paid for until then.</li>
            </ul>
            <p className="text-blue-800 text-sm">We spell this out because it is the part customers most often query. If it does not suit how you work, please ask before subscribing.</p>
          </div>

          <p><strong>5.5 Paying before you register:</strong> You may pay first and set up your account afterwards. Your account is created when payment succeeds and stays incomplete until you choose a password. If you never complete it, contact us and the Refund Policy applies.</p>

          <p><strong>5.6 One-off purchases:</strong> Individual documents and templates bought from the Store are charged at the time of purchase, and access is granted immediately.</p>

          <p><strong>5.7 Refunds:</strong> Refunds are governed by our <Link href="/legal/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>, which forms part of these Terms. In summary: a 14-day goodwill refund on your first subscription payment, plus whatever your local consumer law requires. Nothing in these Terms removes a right you have as a consumer.</p>

          <p><strong>5.8 Failed and late payments:</strong> If a payment fails we will retry and tell you. If it stays unpaid we may restrict or suspend access. Your data is not deleted because of non-payment — see section 10.</p>

          <p><strong>5.9 Taxes:</strong> Prices exclude VAT and other transaction taxes unless stated otherwise. You are responsible for taxes arising from your use of the Services, other than tax on our income.</p>

          <p><strong>5.10 Price changes:</strong> We will give at least 30 days&apos; notice of a price increase, by email. The new price applies from your next renewal, and you may cancel before it takes effect.</p>
        </div>
      )
    },
    {
      id: 'data',
      title: '6. Your Data',
      icon: <Lock className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>6.1 You own your content:</strong> Everything you put into SORMALITICS, and every document you generate with it, remains yours. We claim no ownership of your business information, your customer or employee data, or your documents.</p>

          <p><strong>6.2 The permission we need:</strong> You give us permission to store, process, transmit and display your content strictly to provide the Services to you, to keep them secure, and where the law requires. Nothing more. We do not use your content to train machine-learning models, and we do not sell it.</p>

          <p><strong>6.3 Our role:</strong> For your own account information we are the controller. For information you upload about your clients, their employees or your customers, we act as your processor. Section 3.5 covers practitioners specifically.</p>

          <p><strong>6.4 Security:</strong> We take reasonable technical and organisational measures appropriate to the risk, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Encryption in transit (TLS) on all connections</li>
            <li>Encryption at rest through our infrastructure providers</li>
            <li>Additional application-level encryption for agreement content</li>
            <li>Two-factor authentication, enabled by default</li>
            <li>Role-based access control, and per-account data isolation</li>
            <li>Rate limiting, bot filtering and application firewall rules</li>
            <li>Malware scanning of uploaded files</li>
            <li>Application, audit and security logging, with automated DNS and TLS certificate monitoring</li>
          </ul>
          <p className="text-sm text-gray-600">No system is perfectly secure, and we do not promise that ours is. We hold no ISO 27001, SOC 2 or PCI DSS certification of our own; our infrastructure providers hold their own certifications. We will not tell you otherwise.</p>

          <p><strong>6.5 Getting your data out:</strong> You can export everything we hold about you at any time, from your account. There is no charge, and you do not need to ask us.</p>

          <p><strong>6.6 Deleting your account:</strong> You can request deletion from your account. There is a 30-day grace period during which you can change your mind. After that, your personal working data is deleted and your financial and payroll records are anonymised rather than deleted, because tax and company law require the underlying records to be kept. The <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> sets out exactly what happens to what.</p>

          <p><strong>6.7 Privacy:</strong> Our <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> explains what personal information we collect and who we share it with. It forms part of these Terms.</p>
        </div>
      )
    },
    {
      id: 'compliance',
      title: '7. Accuracy, Compliance & Disclaimers',
      icon: <Scale className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-semibold text-red-900">Read this before relying on anything SORMALITICS produces</h5>
                <p className="text-red-800 text-sm">SORMALITICS is a document generation tool. It is not a substitute for professional legal, tax, accounting or payroll advice, and it does not check your work.</p>
              </div>
            </div>
          </div>

          <p><strong>7.1 Tax and payroll calculations:</strong> Our calculations are a convenience based on published rates and rules as we understand them. Rates change, rules have exceptions, and your circumstances may not fit the general case. <strong>You remain responsible for the accuracy of every figure you submit to a revenue authority.</strong> Check the output before you rely on it.</p>

          <p><strong>7.2 Templates:</strong> Our agreement templates are general starting points. They are not legal advice, they are not drafted for your situation, and they may not suit your jurisdiction. Have a lawyer review anything that matters.</p>

          <p><strong>7.3 Filing:</strong> We do not submit anything to SARS, HMRC, the IRS, KRA, URA, BURS, ZRA or any other authority on your behalf. Producing a form in SORMALITICS does not file it.</p>

          <p><strong>7.4 Your compliance obligations:</strong> You are responsible for complying with the law that applies to you, including tax and employment law in your jurisdiction, data protection law in relation to the people whose information you upload, and any regulation specific to your industry or profession.</p>

          <p><strong>7.5 Availability:</strong> We aim to keep the Services available and monitor them continuously, but we do not guarantee uninterrupted access and we offer no uptime service level. We may take the Services down for maintenance.</p>
        </div>
      )
    },
    {
      id: 'intellectual',
      title: '8. Intellectual Property',
      icon: <Building className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>8.1 Ours:</strong> SORMALITICS, its name, logo, software, design and content are owned by AlloBTeQ and protected by intellectual property law.</p>

          <p><strong>8.2 Your licence:</strong> We grant you a limited, non-exclusive, non-transferable, revocable licence to use the Services for your own business purposes while this agreement is in force.</p>

          <p><strong>8.3 Yours:</strong> You keep ownership of your content and of the documents you generate. Where you use one of our templates, you own the completed document; we keep the rights in the underlying template.</p>

          <p><strong>8.4 Feedback:</strong> If you send us suggestions, we may use them without restriction or payment. You are not obliged to send us any.</p>
        </div>
      )
    },
    {
      id: 'liability',
      title: '9. Liability',
      icon: <AlertTriangle className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>9.1 What we do not exclude:</strong> Nothing in these Terms limits liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, or for anything else that cannot lawfully be limited. If you are a consumer, your statutory rights are unaffected — including under the South African Consumer Protection Act or the UK Consumer Rights Act, as applicable.</p>

          <p><strong>9.2 Cap:</strong> Subject to 9.1, our total liability for all claims in any 12-month period is limited to the greater of the amount you paid us in the 12 months before the claim, or ZAR 5,000 (or its equivalent in your billing currency).</p>

          <p><strong>9.3 What we are not liable for:</strong> Subject to 9.1, we are not liable for indirect or consequential loss, or for:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Loss of profit, revenue or business opportunity</li>
            <li>Tax penalties, interest or assessments arising from figures you submitted</li>
            <li>Consequences of a document or template being unsuitable for your circumstances</li>
            <li>Loss of data, to the extent it results from your own action or from not keeping your own copies</li>
            <li>Failures of third-party services outside our reasonable control</li>
          </ul>

          <p><strong>9.4 Your responsibility:</strong> You accept that you must check generated documents before using them, verify tax calculations, have legal templates reviewed where it matters, and keep your own copies of anything you cannot afford to lose.</p>

          <p><strong>9.5 Indemnity:</strong> If you are using the Services for business purposes, you will cover us against claims arising from your breach of these Terms, your unlawful use of the Services, or your infringement of someone else&apos;s rights. This does not apply to consumers.</p>
        </div>
      )
    },
    {
      id: 'termination',
      title: '10. Ending This Agreement',
      icon: <UserCheck className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>10.1 By you:</strong> Cancel your subscription or delete your account at any time from your account settings. No notice period, no cancellation fee.</p>

          <p><strong>10.2 By us:</strong> We may suspend or end your access if you materially breach these Terms, use the Services unlawfully, leave fees unpaid after notice, or create a security risk. Except where the breach is serious or unlawful, we will give you notice and a reasonable chance to fix it.</p>

          <p><strong>10.3 What happens to your data:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li>You keep access to export your data for <strong>30 days</strong> after your account ends</li>
            <li>After that, personal working data is deleted</li>
            <li>Financial and payroll records are anonymised and retained for the periods the law requires</li>
            <li>You can export at any point during those 30 days, at no charge</li>
          </ul>

          <p><strong>10.4 Fees:</strong> Ending the agreement does not refund fees already paid, except as set out in the Refund Policy or as consumer law requires. Amounts already due remain payable.</p>

          <p><strong>10.5 What survives:</strong> Sections 6 (your data), 8 (intellectual property), 9 (liability), and 12 (general) continue to apply after this agreement ends.</p>
        </div>
      )
    },
    {
      id: 'changes',
      title: '11. Changes to These Terms',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>11.1 How we change them:</strong> We may update these Terms. Each version carries a version number, and we record which version you accepted.</p>

          <p><strong>11.2 Notice:</strong> For a material change — one affecting your rights, your fees, or how we use your data — we will give at least <strong>30 days&apos; notice</strong> by email to your registered address and in the product. Minor corrections take effect when published.</p>

          <p><strong>11.3 Your choices:</strong> If you do not accept a material change, you may cancel before it takes effect and we will refund any unused portion of a prepaid period. Continuing to use the Services after the notice period means you accept the new version.</p>

          <p className="text-sm text-gray-500">This version: v{LEGAL_VERSIONS.terms}, effective {effectiveDate}.</p>
        </div>
      )
    },
    {
      id: 'general',
      title: '12. General',
      icon: <Globe className="h-5 w-5" />,
      content: (
        <div className="space-y-4">
          <p><strong>12.1 Governing law and courts:</strong> As set out in section 1.2 — England &amp; Wales for customers of Polompa Investments Limited, South Africa for customers of AlloBTeQ (Pty) Ltd. If you are a consumer, you may also bring proceedings in the courts of the country where you live, and you keep the protection of the mandatory consumer law of that country.</p>

          <p><strong>12.2 Severability:</strong> If any provision is unenforceable, the rest continues to apply.</p>

          <p><strong>12.3 Entire agreement:</strong> These Terms, together with the Privacy Policy, Cookie Policy and Refund Policy, are the whole agreement between us about the Services.</p>

          <p><strong>12.4 Assignment:</strong> You may not transfer this agreement without our written consent. We may transfer it as part of a group reorganisation, merger or sale of the business, on notice to you.</p>

          <p><strong>12.5 No waiver:</strong> If we do not enforce a provision, that does not mean we have given it up.</p>

          <p><strong>12.6 Events outside our control:</strong> Neither party is liable for failure to perform caused by events beyond its reasonable control.</p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold text-gray-900 mb-2">Contact</h5>
            <div className="text-gray-700 text-sm space-y-1">
              <p><strong>{nameWithNumber(ALLOBTEQ)}</strong><br />
                <span className="text-gray-600">{ALLOBTEQ.entityType}, registered with the {ALLOBTEQ.registrar} — {ALLOBTEQ.serves}</span></p>
              <p className="pt-1"><strong>{POLOMPA.registeredName}</strong> (company no. {POLOMPA.registrationNumber})<br />
                <span className="text-gray-600">Registered in {POLOMPA.jurisdiction} — {POLOMPA.serves}</span></p>
              <p className="pt-2">Legal: <a href={`mailto:${CONTACT.legal}`} className="text-blue-600 hover:underline">{CONTACT.legal}</a></p>
              <p>Support: <a href={`mailto:${CONTACT.support}`} className="text-blue-600 hover:underline">{CONTACT.support}</a></p>
              <p>Privacy: <a href={`mailto:${CONTACT.privacy}`} className="text-blue-600 hover:underline">{CONTACT.privacy}</a></p>
              <p>Telephone: {CONTACT.phone} — {CONTACT.hours}</p>
              <p>Address: {formatAddress(ALLOBTEQ)}</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
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
              <FileText className="h-4 w-4 mr-2" />
              <span>Version {LEGAL_VERSIONS.terms}</span>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-blue-800 text-sm">
              <strong>The short version.</strong> SORMALITICS produces financial and legal documents from information you give it. You own what you create. We do not check your figures or file anything on your behalf, so please review what it produces. You can export your data or delete your account at any time, and cancel whenever you like. The parts most worth reading are <strong>5.4</strong> (how Practitioner billing works), <strong>7</strong> (what we do and do not guarantee) and <strong>9</strong> (liability). This summary is not part of the agreement.
            </p>
          </div>
        </div>

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

        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            SORMALITICS is operated by {ALLOBTEQ.registeredName} (reg. {ALLOBTEQ.registrationNumber}) and {POLOMPA.registeredName} (no. {POLOMPA.registrationNumber}).
          </p>
          <p className="text-sm mt-2">
            Questions about these Terms?{' '}
            <a href="mailto:legal@sormalitics.com" className="text-blue-600 hover:underline">
              legal@sormalitics.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SORMALITICSTermsOfService;

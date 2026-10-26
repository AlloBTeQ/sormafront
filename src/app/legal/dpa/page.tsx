"use client"

import React from 'react';
import Link from 'next/link';
import {
  FileText, Shield, Users, Globe, Lock, Calendar,
  CheckCircle, AlertTriangle, Trash2, Server,
} from 'lucide-react';
import { LEGAL_VERSIONS } from '@/lib/legal/versions';
import { ALLOBTEQ, POLOMPA, CONTACT } from '@/lib/legal/entities';

export default function DataProcessingAgreementPage() {
  const lastUpdated = "23 August 2026";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Data Processing Agreement</h1>
          <p className="text-gray-600 mb-4">For practitioners processing client data through SORMALITICS</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" />{lastUpdated}</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-600" />Version {LEGAL_VERSIONS.dpa}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
          <h2 className="font-semibold text-blue-900 mb-2 flex items-center">
            <FileText className="h-5 w-5 mr-2" /> What this is, in plain English
          </h2>
          <div className="text-blue-800 text-sm space-y-2">
            <p>When you use SORMALITICS to work on your clients&apos; books or payroll, you are handling personal information about people who never signed up with us — your clients&apos; employees, their customers, their directors.</p>
            <p>The law says the person who decides <em>why</em> that data is processed is the controller, and anyone processing it for them needs a written contract. <strong>You are the controller. We are your processor.</strong> This is that contract.</p>
            <p>It is required by <strong>Article 28(3) of the UK/EU GDPR</strong> and <strong>section 21 of POPIA</strong>. You need it on file for your own compliance, and your professional body will very likely ask to see it.</p>
          </div>
        </div>

        <div className="space-y-6">

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Parties and scope</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>1.1</strong> This Agreement is between you (the &quot;Controller&quot;, or &quot;Responsible Party&quot; under POPIA) and the SORMALITICS entity that provides the Services to you (the &quot;Processor&quot;, or &quot;Operator&quot;):</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>{POLOMPA.registeredName}</strong> (company no. {POLOMPA.registrationNumber}, {POLOMPA.jurisdiction}) — if you are in the UK or the EU</li>
                <li><strong>{ALLOBTEQ.registeredName}</strong> (registration no. {ALLOBTEQ.registrationNumber}, {ALLOBTEQ.jurisdiction}) — if you are anywhere else</li>
              </ul>
              <p><strong>1.2</strong> It applies to personal data you upload or generate <em>about third parties</em> — your clients, their employees, their customers and their contacts. It does not apply to your own account information, for which we are the controller and the <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link> applies.</p>
              <p><strong>1.3</strong> It forms part of, and is governed by, our <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>. Where the two conflict on the processing of client personal data, this Agreement prevails.</p>
              <p><strong>1.4</strong> It takes effect when you accept it, and continues for as long as we process client personal data for you.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Server className="h-5 w-5 mr-2 text-gray-600" /> 2. What we process, and for whom
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Article 28(3) requires this to be set out specifically, so:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="p-3 font-semibold text-gray-900 w-1/3 align-top bg-gray-50">Subject matter</td><td className="p-3">Providing invoicing, payroll, accounting, agreement and e-signature services to your clients through your practitioner account</td></tr>
                    <tr><td className="p-3 font-semibold text-gray-900 align-top bg-gray-50">Duration</td><td className="p-3">For as long as your account holds the relevant client profile, plus the retention periods in section 9</td></tr>
                    <tr><td className="p-3 font-semibold text-gray-900 align-top bg-gray-50">Nature and purpose</td><td className="p-3">Storage, organisation, calculation, document generation, transmission, retrieval and deletion — carried out to produce the documents you instruct us to produce</td></tr>
                    <tr><td className="p-3 font-semibold text-gray-900 align-top bg-gray-50">Types of personal data</td><td className="p-3">Names, contact details, postal addresses, employment details, salary and remuneration, banking details, national identity numbers, tax reference numbers, signatures, and the contents of documents you create</td></tr>
                    <tr><td className="p-3 font-semibold text-gray-900 align-top bg-gray-50">Categories of data subject</td><td className="p-3">Your clients&apos; employees, directors, customers, suppliers and contracting counterparties</td></tr>
                    <tr><td className="p-3 font-semibold text-gray-900 align-top bg-gray-50">Special categories</td><td className="p-3">Identity numbers and tax numbers are <strong>special personal information</strong> under POPIA s26. We do not require, and ask you not to upload, health data, biometric data, trade-union membership or criminal-record data</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-600" /> 3. Your obligations as controller
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>3.1</strong> You warrant that you have a lawful basis for every piece of personal data you put into SORMALITICS, and the authority to instruct us to process it.</p>
              <p><strong>3.2</strong> You are responsible for giving privacy notices to the people whose data you upload. They do not have a relationship with us, and we cannot notify them on your behalf.</p>
              <p><strong>3.3</strong> Your instructions to us must be lawful. If we believe an instruction breaches data protection law, we will tell you and may decline to act on it.</p>
              <p><strong>3.4</strong> You are responsible for the accuracy of what you upload, and for handling requests from your clients&apos; data subjects. See section 7.</p>
              <p><strong>3.5</strong> Where your own client engagement makes <em>your client</em> the controller and you their processor, you must have the corresponding agreement in place with them. This Agreement covers our relationship with you, not yours with them.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Our undertaking</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>4.1</strong> We process client personal data <strong>only on your documented instructions</strong>. Your use of the Services, the configuration you choose, and this Agreement together constitute those instructions.</p>
              <p><strong>4.2</strong> We do not process client personal data for our own purposes. Specifically, we do not use it to train machine-learning models, we do not sell or share it, and we do not use it for marketing or analytics.</p>
              <p><strong>4.3</strong> If law requires us to process beyond your instructions, we will tell you first unless that law prohibits it on important grounds of public interest.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-600" /> 5. Article 28(3) obligations
            </h2>
            <p className="text-gray-600 text-sm mb-4">These follow the lettering of Article 28(3) so that you can check them off directly.</p>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>(a) Documented instructions.</strong> We process only on your documented instructions, including on transfers to a third country, unless required otherwise by law.</p>
              <p><strong>(b) Confidentiality.</strong> Everyone we authorise to process client personal data is bound by a duty of confidentiality that survives the end of their engagement.</p>
              <p><strong>(c) Security.</strong> We take the measures in section 6.</p>
              <p><strong>(d) Sub-processors.</strong> We engage sub-processors only on the terms in section 8.</p>
              <p><strong>(e) Assisting with data subject rights.</strong> We provide the technical measures in section 7 so that you can meet requests from your clients&apos; data subjects.</p>
              <p><strong>(f) Assisting with your obligations.</strong> We assist you, taking into account what we know and what is available to us, with security, breach notification, impact assessments and prior consultation.</p>
              <p><strong>(g) Deletion or return.</strong> At the end of the Services we delete or return client personal data as set out in section 9.</p>
              <p><strong>(h) Audit.</strong> We make available the information needed to demonstrate compliance with this Agreement, and allow for audits as described in section 11.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-red-600" /> 6. Security measures
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Our technical and organisational measures, appropriate to the risk:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>TLS encryption in transit on every connection</li>
                <li>Encryption at rest through our infrastructure providers</li>
                <li>Additional application-level encryption for agreement content</li>
                <li>Passwords hashed with bcrypt; never stored in readable form</li>
                <li>Two-factor authentication, enabled by default</li>
                <li>Role-based access control, with per-account data isolation applied at query level</li>
                <li>Rate limiting, bot filtering and application firewall rules</li>
                <li>Malware scanning of uploaded files</li>
                <li>Audit logging of significant actions, with signature audit trails</li>
                <li>Automated DNS and TLS certificate monitoring</li>
                <li>A documented and exercised incident response plan</li>
              </ul>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 mb-1">What we do not claim</h5>
                <p className="text-gray-600 text-sm">We hold no ISO 27001, SOC 2 or PCI DSS certification of our own. Our infrastructure providers hold their own certifications and we rely on those. Encryption is not end-to-end — we hold the keys, because the Services must read the data to produce documents from it. If your engagement requires a certified processor, please tell us before you upload client data.</p>
              </div>

              <p><strong>6.2</strong> We review these measures periodically and may change them, provided the level of protection is not reduced.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data subject requests</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>7.1</strong> If one of your clients&apos; data subjects contacts us directly, we will not respond substantively. We will tell them to contact you and, where we can identify you as the controller, let you know.</p>
              <p><strong>7.2</strong> The Services give you the means to answer most requests yourself — you can view, correct, export and delete client records from your practitioner account without asking us.</p>
              <p><strong>7.3</strong> Where you need help beyond that, we will assist. We do not charge for reasonable assistance.</p>
              <p><strong>7.4</strong> Deletion of client data through the Services is subject to the statutory retention rules in section 9 — the same rules that apply to your own records.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Sub-processors</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>8.1</strong> You give general authorisation for us to engage sub-processors, on the conditions below.</p>
              <p><strong>8.2</strong> The current list is published in <Link href="/legal/privacy" className="text-blue-600 hover:underline">section 4 of our Privacy Policy</Link> and forms part of this Agreement. It names every third party that processes personal data on our behalf — hosting, database, caching, payments, email, SMS, error reporting, malware scanning and, with consent, analytics.</p>
              <p><strong>8.3</strong> Each sub-processor is bound by written terms imposing obligations no less protective than these. We remain fully liable to you for their performance.</p>
              <p><strong>8.4 Changes.</strong> We will give you at least <strong>30 days&apos; notice</strong> by email before adding or replacing a sub-processor that handles client personal data. If you object on reasonable data-protection grounds within that period, we will work with you to find an alternative; if we cannot, you may terminate the affected Services and we will refund any unused prepaid period.</p>
              <p><strong>8.5</strong> Two sub-processors are worth your attention specifically:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Malware scanning.</strong> Uploaded files may be submitted to a third-party scanning service that shares submissions with its security-vendor network. If your clients&apos; documents are sensitive enough that this matters, tell us and we will configure local-only scanning for your account.</li>
                <li><strong>Session analytics.</strong> Never runs on signed-in pages, so no client data is ever recorded by it.</li>
              </ul>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Trash2 className="h-5 w-5 mr-2 text-gray-600" /> 9. Retention, return and deletion
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>9.1</strong> You can export client data at any time from your account, in a machine-readable format, at no charge.</p>
              <p><strong>9.2</strong> When you remove a client profile or close your account, there is a <strong>30-day grace period</strong> in which you can retrieve or restore the data.</p>
              <p><strong>9.3</strong> After that period:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Working data — client records, templates, agreements, uploaded files — is <strong>deleted</strong></li>
                <li>Financial and payroll records are <strong>anonymised rather than deleted</strong>, because tax and company law require the underlying record to be retained</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-semibold text-amber-900">Why we cannot simply delete everything</h5>
                    <p className="text-amber-800 text-sm">South Africa requires 5 years under the Tax Administration Act and 7 years for accounting records under the Companies Act; the UK requires 6 years for business records. GDPR Article 17(3)(b) and POPIA section 24(1) both provide for this — the right to erasure yields to a legal retention obligation. What we remove is everything identifying the person. What remains is the transaction. As the controller you should reflect this in the privacy notices you give your clients.</p>
                  </div>
                </div>
              </div>

              <p><strong>9.4</strong> Anonymised records are retained only to meet those obligations and are not processed for any other purpose.</p>
              <p><strong>9.5</strong> Deleted data may persist briefly in encrypted backups before those are cycled out. It is not restored to live systems.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-600" /> 10. Personal data breaches
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>10.1</strong> We will notify you <strong>without undue delay</strong>, and in any event within <strong>48 hours</strong>, of becoming aware of a breach affecting client personal data we process for you.</p>
              <p className="text-gray-600">Forty-eight hours, not seventy-two: your own 72-hour clock to your regulator starts when we tell you, so you need the time to act.</p>
              <p><strong>10.2</strong> Our notification will describe the nature of the breach, the categories and approximate number of data subjects and records, the likely consequences, the measures taken or proposed, and a contact point for more information. Where we cannot provide it all at once, we will provide it in phases.</p>
              <p><strong>10.3</strong> Notifying your supervisory authority and the affected data subjects is <strong>your</strong> responsibility as controller. We will not do it on your behalf, because we do not hold your relationship with them — but we will give you what you need.</p>
              <p><strong>10.4</strong> We will assist with your investigation and remediation, and will not require payment for reasonable assistance.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Audit and demonstrating compliance</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>11.1</strong> On reasonable written request, and no more than once a year unless a breach or a regulator requires otherwise, we will provide the information reasonably needed to demonstrate compliance with this Agreement.</p>
              <p><strong>11.2</strong> That will normally take the form of written answers, our security documentation and our sub-processor list. Where that is genuinely insufficient for your regulator, we will discuss an on-site or remote audit, at reasonable notice, during business hours, under confidentiality, and without disrupting the Services or exposing other customers&apos; data.</p>
              <p><strong>11.3</strong> You bear your own audit costs. We bear ours, unless the audit reveals a material breach by us, in which case we bear both.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Globe className="h-5 w-5 mr-2 text-blue-600" /> 12. International transfers
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>12.1</strong> Client personal data may be processed outside South Africa, the UK and the EU, because our infrastructure providers operate internationally. We do not own or operate data centres, and <strong>we do not currently offer data residency</strong> on any plan.</p>
              <p><strong>12.2</strong> Transfers are made under the appropriate safeguard for the route: UK and EU Standard Contractual Clauses (with the UK Addendum where applicable), an adequacy decision where one exists, or POPIA section 72 for transfers out of South Africa.</p>
              <p><strong>12.3</strong> Where the UK or EU SCCs apply, they are incorporated into this Agreement, with you as data exporter and us as data importer, Module Two (controller to processor). The technical and organisational measures in section 6 populate Annex II, the details in section 2 populate Annex I, and our sub-processor list populates Annex III.</p>
              <p><strong>12.4</strong> If your engagement requires data residency in a particular jurisdiction, SORMALITICS cannot currently meet that requirement. We would rather say so here than at procurement.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">13. Liability, term and general</h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p><strong>13.1 Liability.</strong> Each party&apos;s liability under this Agreement is subject to the limitations in the Terms of Service, except where data protection law does not permit that limitation.</p>
              <p><strong>13.2 Term.</strong> This Agreement runs for as long as we process client personal data for you. Sections 9, 10 and 13 survive its end.</p>
              <p><strong>13.3 Changes.</strong> We may update this Agreement where the law or our processing changes. For a material change we give at least <strong>30 days&apos; notice</strong> and ask you to accept the new version. Each version is numbered and your acceptance is recorded against it.</p>
              <p><strong>13.4 Governing law.</strong> As set out in the Terms of Service — England &amp; Wales for Polompa customers, South Africa for AlloBTeQ customers.</p>
              <p><strong>13.5 Precedence.</strong> Where this Agreement conflicts with the Terms of Service on the processing of client personal data, this Agreement prevails. Where it conflicts with the SCCs, the SCCs prevail.</p>
              <p><strong>13.6 Severability.</strong> If a provision is unenforceable, the rest continues to apply.</p>
            </div>
          </section>

          <section className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
            <div className="text-sm text-gray-700 space-y-1">
              <p>Data protection: <a href={`mailto:${CONTACT.privacy}`} className="text-blue-600 hover:underline">{CONTACT.privacy}</a></p>
              <p>Legal: <a href={`mailto:${CONTACT.legal}`} className="text-blue-600 hover:underline">{CONTACT.legal}</a></p>
              <p className="pt-2 text-gray-600">A countersigned PDF for your compliance file is available on request from either address.</p>
            </div>
          </section>

        </div>

        <div className="mt-10 text-center text-sm text-gray-600 space-y-1">
          <p>This Agreement supplements the <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
          <p className="text-gray-500">Accepted in-product from your practice settings. Version {LEGAL_VERSIONS.dpa}.</p>
        </div>
      </div>
    </div>
  );
}

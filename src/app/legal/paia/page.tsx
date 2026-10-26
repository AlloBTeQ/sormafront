"use client"

import React from 'react';
import Link from 'next/link';
import {
  FileText, Building2, BookOpen, FolderOpen, Send,
  ShieldOff, UserCheck, Calendar, MapPin, CheckCircle,
} from 'lucide-react';
import { ALLOBTEQ, POLOMPA, CONTACT, formatAddress } from '@/lib/legal/entities';

export default function PaiaManualPage() {
  const lastUpdated = '23 August 2026';
  const io = ALLOBTEQ.informationOfficerRegistration;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">

        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-600 mb-3">
            Promotion of Access to Information Act 2 of 2000
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Section 51 Manual
          </h1>
          <p className="text-gray-600 mb-4">{ALLOBTEQ.registeredName}, trading as SORMALITICS</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-gray-600">
            <span className="flex items-center"><Calendar className="h-4 w-4 mr-2" />Compiled {lastUpdated}</span>
            <span className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-600" />Next review 23 August 2027</span>
          </div>
        </div>

        <div className="space-y-6">

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" /> 1. Purpose of this manual
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>PAIA gives effect to the constitutional right of access to information. This manual explains what records {ALLOBTEQ.registeredName} holds and how to request access to them.</p>
              <p>It is also the point of contact for requests under the Protection of Personal Information Act 4 of 2013 (POPIA), including requests by data subjects to access, correct or delete their personal information.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-gray-600" /> 2. Particulars of the private body
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <tbody className="divide-y divide-gray-100">
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 w-2/5 align-top">Registered name</td><td className="p-3">{ALLOBTEQ.registeredName}</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Trading name</td><td className="p-3">SORMALITICS</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Registration number</td><td className="p-3">{ALLOBTEQ.registrationNumber}</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Entity type</td><td className="p-3">{ALLOBTEQ.entityType}, registered with the {ALLOBTEQ.registrar}</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">VAT number</td><td className="p-3">{ALLOBTEQ.vatRegistered ? '—' : 'Not registered for VAT'}</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Physical address</td><td className="p-3">{formatAddress(ALLOBTEQ)}</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Postal address</td><td className="p-3">{formatAddress(ALLOBTEQ)}</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Telephone</td><td className="p-3">{CONTACT.phone}</td></tr>
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Website</td><td className="p-3">https://sormalitics.com</td></tr>
                  {io && (
                    <>
                      <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Information Officer</td><td className="p-3">{io.officerName}</td></tr>
                      <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Information Officer email</td><td className="p-3"><a href={`mailto:${io.officerEmail}`} className="text-blue-600 hover:underline">{io.officerEmail}</a></td></tr>
                      <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Registration with the Regulator</td><td className="p-3">{io.number}, registered {new Date(io.registeredOn).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
                    </>
                  )}
                  <tr><td className="p-3 bg-gray-50 font-semibold text-gray-900 align-top">Deputy Information Officer</td><td className="p-3">None appointed</td></tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <strong>Related entity.</strong> Personal information of users in the United Kingdom and the European Union is controlled by {POLOMPA.registeredName} (company no. {POLOMPA.registrationNumber}, registered in {POLOMPA.jurisdiction}). Requests concerning those users should be directed to that entity. This manual governs records held by {ALLOBTEQ.registeredName}.
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-teal-600" /> 3. The Regulator&apos;s PAIA Guide
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>The Information Regulator has published a guide, under section 10 of PAIA, on how to use the Act. It is available in all official languages.</p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-1">Information Regulator (South Africa)</p>
                <p>JD House, 27 Stiemens Street, Braamfontein, Johannesburg, 2001</p>
                <p>PO Box 31533, Braamfontein, Johannesburg, 2017</p>
                <p className="mt-2">Telephone: 010 023 5200</p>
                <p>General: enquiries@inforegulator.org.za</p>
                <p>PAIA complaints: PAIAComplaints@inforegulator.org.za</p>
                <p>Website: inforegulator.org.za</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <FolderOpen className="h-5 w-5 mr-2 text-amber-600" /> 4. Records held, by category
            </h2>
            <div className="space-y-4 text-gray-700 text-sm">
              <p className="text-gray-600">Listing a category does not mean every record in it is automatically available — the grounds of refusal in Chapter 4 of PAIA may apply. See section 6.</p>

              <div className="space-y-3">
                {[
                  { t: '4.1 Company and statutory records', d: 'Founding documents, share register, director records, minutes, statutory returns, tax registrations and returns, insurance policies.' },
                  { t: '4.2 Financial records', d: 'Accounting records, annual financial statements, bank records, supplier and customer invoices, payment processor records, payroll and employee tax records.' },
                  { t: '4.3 Employee and HR records', d: 'Contracts of employment, personnel files, payroll records, leave records, disciplinary records, training records, recruitment records.' },
                  { t: '4.4 Customer and user records', d: 'Account records, subscription and billing records, support correspondence, and the documents users create through the SORMALITICS platform.' },
                  { t: '4.5 Technical and security records', d: 'System and application logs, audit logs, security monitoring records, incident records, backup records, source code and technical documentation.' },
                  { t: '4.6 Supplier and subprocessor records', d: 'Agreements with service providers, subprocessor records, procurement records.' },
                ].map(r => (
                  <div key={r.t}>
                    <p className="font-semibold text-gray-900">{r.t}</p>
                    <p>{r.d}</p>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="font-semibold text-amber-900 mb-1">Note on platform content</p>
                <p className="text-amber-800">Where a practitioner or business user uploads information about <em>their own</em> clients or employees, {ALLOBTEQ.shortName} acts as an <strong>operator</strong> under POPIA and processes that information on that user&apos;s instructions. A person seeking access to such records should approach the user who uploaded them — the responsible party — rather than {ALLOBTEQ.shortName}. We will assist that responsible party in responding. See our <Link href="/legal/dpa" className="underline">Data Processing Agreement</Link>.</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">4.7 Records held under other legislation</p>
                <p>Records kept under, among others: the Companies Act 71 of 2008; the Income Tax Act 58 of 1962; the Tax Administration Act 28 of 2011; the Value-Added Tax Act 89 of 1991; the Basic Conditions of Employment Act 75 of 1997; the Labour Relations Act 66 of 1995; the Unemployment Insurance Act 63 of 2001; the Skills Development Levies Act 9 of 1999; the Compensation for Occupational Injuries and Diseases Act 130 of 1993; POPIA; and the Electronic Communications and Transactions Act 25 of 2002.</p>
              </div>

              <div>
                <p className="font-semibold text-gray-900">4.8 Records available without a formal request</p>
                <p>
                  The following are published on our website and need no PAIA request:{' '}
                  <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>,{' '}
                  <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>,{' '}
                  <Link href="/legal/cookies" className="text-blue-600 hover:underline">Cookie Policy</Link>,{' '}
                  <Link href="/legal/refunds" className="text-blue-600 hover:underline">Refund Policy</Link>,{' '}
                  <Link href="/legal/dpa" className="text-blue-600 hover:underline">Data Processing Agreement</Link>, pricing, and this manual.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Send className="h-5 w-5 mr-2 text-blue-600" /> 5. How to request access
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <ol className="list-decimal pl-6 space-y-1">
                <li>Complete the prescribed <strong>Form C</strong> (Request for Access to Record — private body), available from the Information Regulator&apos;s website.</li>
                <li>Send it to the Information Officer at the address in section 2.</li>
                <li>Provide enough detail to identify the record, and identify the right you are seeking to exercise or protect and why the record is required for that purpose.</li>
                <li>State how you wish to be informed of the outcome, and in what form you want access.</li>
                <li>If you are requesting on someone else&apos;s behalf, attach proof of your authority.</li>
              </ol>

              <p className="font-semibold text-gray-900 pt-2">Fees</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>A <strong>request fee</strong> is payable by a requester other than a personal requester, before the request is processed.</li>
                <li>An <strong>access fee</strong> may be payable for search, preparation, reproduction and postage.</li>
                <li><strong>A personal requester — someone requesting a record about themselves — pays no request fee.</strong></li>
                <li>A deposit may be required where preparation is expected to exceed six hours.</li>
              </ul>
              <p className="text-gray-600">Amounts are those prescribed in the Regulations in force at the time of the request. We will tell you the amount before proceeding.</p>

              <p className="font-semibold text-gray-900 pt-2">Timeframe</p>
              <p>A decision within <strong>30 days</strong> of receipt, extendable by a further 30 days in the circumstances PAIA allows. You will be notified in writing of any extension.</p>

              <p className="font-semibold text-gray-900 pt-2">If access is refused</p>
              <p>You will be given written reasons and told what remedies are available. You may complain to the Information Regulator, or apply to a court.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ShieldOff className="h-5 w-5 mr-2 text-red-600" /> 6. Grounds for refusal
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>PAIA requires refusal in some cases and permits it in others. The grounds most likely to apply to us:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Unreasonable disclosure of personal information about a third party (s63)</li>
                <li>Commercial information of a third party — trade secrets, or information that could harm their commercial or financial interests (s64)</li>
                <li>Information supplied in confidence, where disclosure could prejudice future supply (s65)</li>
                <li>Information that could endanger a person&apos;s life or safety, or prejudice the security of property or a system (s66) — this includes our security architecture and system logs</li>
                <li>Legally privileged records (s67)</li>
                <li>Our own confidential commercial information, including source code (s68)</li>
                <li>Research information of a third party or of {ALLOBTEQ.shortName} (s69)</li>
              </ul>
              <p>Access may still be granted where the public interest override in section 70 applies.</p>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <UserCheck className="h-5 w-5 mr-2 text-green-600" /> 7. Requests under POPIA
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>Data subjects have rights under POPIA that are separate from PAIA:</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold text-gray-900">Right</th>
                      <th className="text-left p-3 font-semibold text-gray-900">Section</th>
                      <th className="text-left p-3 font-semibold text-gray-900">How to exercise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr><td className="p-3">Confirmation of what we hold, and access to it</td><td className="p-3">s23</td><td className="p-3">Form 2, or the self-service export in your account</td></tr>
                    <tr><td className="p-3">Correction or deletion</td><td className="p-3">s24</td><td className="p-3">Form 2, or your account settings</td></tr>
                    <tr><td className="p-3">Object to processing</td><td className="p-3">s11(3)</td><td className="p-3">Form 1</td></tr>
                    <tr><td className="p-3">Object to direct marketing</td><td className="p-3">s69</td><td className="p-3">The unsubscribe link, or write to us</td></tr>
                    <tr><td className="p-3">Complain to the Regulator</td><td className="p-3">s74</td><td className="p-3">complaints.IR@inforegulator.org.za</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900 mb-1">Self-service</p>
                <p className="text-green-800">Account holders can export their data and request deletion from within the product — see the <Link href="/legal/privacy" className="underline">Privacy Policy</Link>. Deletion carries a 30-day grace period, after which personal working data is deleted and financial and payroll records are <strong>anonymised rather than deleted</strong>, because tax and company law require the underlying record to be retained.</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-600" /> 8. Availability and review
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>This manual is available:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>On this page, at sormalitics.com/legal/paia</li>
                <li>At our physical address during business hours</li>
                <li>By email from the Information Officer on request</li>
                <li>In printed form, on payment of the prescribed reproduction fee</li>
              </ul>
              <p>It is reviewed at least annually, and whenever there is a material change to the records we hold or to our processing.</p>
            </div>
          </section>

        </div>

        <div className="mt-10 text-center text-sm text-gray-600 space-y-1">
          <p>Compiled in terms of section 51 of the Promotion of Access to Information Act 2 of 2000.</p>
          <p className="text-gray-500">{ALLOBTEQ.registeredName} · Registration {ALLOBTEQ.registrationNumber}</p>
        </div>
      </div>
    </div>
  );
}
